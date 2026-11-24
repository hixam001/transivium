class EngineError(Exception):
    def __init__(self, code: str, message: str, status: int = 422, issues: list | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status
        self.issues = issues or []
