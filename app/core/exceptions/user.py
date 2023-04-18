from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from app.models import Book


class UserExistsException(BadRequestException):
    def __init__(self, user_email: str) -> None:
        self.description = f"User with email '{user_email}' already exist."
        super().__init__()


class UserNotFoundException(NotFoundException):
    def __init__(self, user_email: str) -> None:
        self.description = f"User with email '{user_email}' doesn't exist."
        super().__init__()


class PasswordDoesNotMatchException(BadRequestException):
    description = "Incorrect password. Try again..."


class UserIsOffender(ForbiddenException):
    def __init__(self, taken_books: list[Book]) -> None:
        self.description = (
            f"Return {', '.join([f'`{book.title}`' for book in taken_books])} to unlock that functionality."
        )
        super().__init__()
