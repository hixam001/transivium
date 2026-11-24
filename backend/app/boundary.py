"""Bounded request reading and uniform, privacy-safe error envelopes."""

from uuid import uuid4

from starlette.responses import JSONResponse

from app.engine.budget import LIMITS
from app.engine.errors import EngineError


def error_response(code, message, status=422, issues=None, request_id=None):
    return JSONResponse(
        status_code=status,
        content={
            "error": {
                "code": code,
                "message": message,
                "issues": issues or [],
                "requestId": request_id or uuid4().hex,
            }
        },
    )


class Boundary:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        request_id = uuid4().hex
        scope.setdefault("state", {})["request_id"] = request_id

        async def fail(code, message, status):
            await error_response(code, message, status, request_id=request_id)(scope, receive, send)

        if scope["method"] == "POST":
            headers = dict(scope["headers"])
            if (
                headers.get(b"content-type", b"").split(b";", 1)[0].strip().lower()
                != b"application/json"
            ):
                return await fail(
                    "UNSUPPORTED_MEDIA_TYPE", "POST requests require application/json.", 415
                )
            body = bytearray()
            while True:
                message = await receive()
                if message["type"] == "http.disconnect":
                    return
                chunk = message.get("body", b"")
                if len(body) + len(chunk) > LIMITS.request_bytes:
                    return await fail("PAYLOAD_TOO_LARGE", "Request exceeds 512 KiB.", 413)
                body.extend(chunk)
                if not message.get("more_body", False):
                    break
            consumed = False

            async def body_receive():
                nonlocal consumed
                if not consumed:
                    consumed = True
                    return {"type": "http.request", "body": bytes(body), "more_body": False}
                return await receive()

            app_receive = body_receive
        else:
            app_receive = receive
        # This app has JSON responses, not unbounded streaming endpoints.
        messages = []
        size = 0

        async def bounded_send(message):
            nonlocal size
            if message["type"] == "http.response.body":
                size += len(message.get("body", b""))
                if size > LIMITS.response_bytes:
                    raise EngineError("LIMIT_EXCEEDED", "Response size limit exceeded.")
            messages.append(message)

        try:
            await self.app(scope, app_receive, bounded_send)
        except EngineError as exc:
            return await fail(exc.code, exc.message, exc.status)
        except Exception:
            # Never expose exception messages, machine contents or tracebacks.
            return await fail(
                "INTERNAL_ERROR", "Operation failed; retry or report the request ID.", 500
            )
        for message in messages:
            if message["type"] == "http.response.start":
                message.setdefault("headers", []).append((b"x-request-id", request_id.encode()))
            await send(message)
