from app.core.exceptions import BadRequestException, BaseHTTPException


class DatabaseException(BaseHTTPException):
    description = "Database Operation failed. We're working on that issue."


class TableNotExistsException(BadRequestException):
    def __init__(self, table_name: str) -> None:
        self.description = f"Table with {table_name=} doesn't exist.'"
        super().__init__()
