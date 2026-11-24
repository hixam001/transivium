"""Bounded request reading and uniform, privacy-safe error envelopes."""

import re
from asyncio import timeout
from uuid import uuid4

from starlette.responses import JSONResponse

from app.engine.budget import LIMITS
from app.engine.errors import EngineError

LOCAL_HOST = re.compile(rb"(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?")


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
            response = error_response(code, message, status, request_id=request_id)
            response.headers["X-Request-ID"] = request_id
            await response(scope, receive, send)

        headers = dict(scope["headers"])
        if not LOCAL_HOST.fullmatch(headers.get(b"host", b"").lower()):
            return await fail("HOST_REJECTED", "Use the local Transivium address.", 400)

        if scope["method"] == "POST":
            if (
                headers.get(b"content-type", b"").split(b";", 1)[0].strip().lower()
                != b"application/json"
            ):
                return await fail(
                    "UNSUPPORTED_MEDIA_TYPE", "POST requests require application/json.", 415
                )
            body = bytearray()
            try:
                async with timeout(LIMITS.request_read_seconds):
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
            except TimeoutError:
                return await fail(
                    "REQUEST_TIMEOUT", "Request upload timed out. Retry locally.", 408
                )
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
        overflow = False

        async def bounded_send(message):
            nonlocal size, overflow
            if message["type"] == "http.response.body":
                size += len(message.get("body", b""))
                if size > LIMITS.response_bytes:
                    overflow = True
                    messages.clear()
            if not overflow:
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
        if overflow:
            return await fail("LIMIT_EXCEEDED", "Response size limit exceeded.", 422)
        start = next((m for m in messages if m["type"] == "http.response.start"), None)
        if start and start["status"] >= 400:
            content_type = dict(start.get("headers", [])).get(b"content-type", b"")
            if not content_type.startswith(b"application/json"):
                return await fail(
                    "CORS_REJECTED" if scope["method"] == "OPTIONS" else "INTERNAL_ERROR",
                    "Request rejected by the local HTTP boundary.",
                    start["status"],
                )
        for message in messages:
            if message["type"] == "http.response.start":
                message.setdefault("headers", []).append((b"x-request-id", request_id.encode()))
            await send(message)
