from .base import (
    BadRequestException,
    BaseHTTPException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)
from .book import (
    NoRequestedBooksException,
    TooManyBooksException,
    UnavailableBooksException,
    UploadBooksException,
)
from .db import DatabaseException, TableNotExistsException
from .order import InvalidOrderStatusException
from .token import (
    DecodeTokenException,
    ExpiredTokenException,
    InvalidAuthorizationTypeException,
)
from .user import (
    PasswordDoesNotMatchException,
    UserExistsException,
    UserIsOffender,
    UserNotFoundException,
)

__all__ = [
    # base
    "BaseHTTPException",
    "BadRequestException",
    "ForbiddenException",
    "NotFoundException",
    "UnauthorizedException",
    # token
    "DecodeTokenException",
    "ExpiredTokenException",
    "InvalidAuthorizationTypeException",
    # user
    "PasswordDoesNotMatchException",
    "UserExistsException",
    "UserIsOffender",
    "UserNotFoundException",
    # order
    "InvalidOrderStatusException",
    # book
    "NoRequestedBooksException",
    "TooManyBooksException",
    "UnavailableBooksException",
    "UploadBooksException",
    # db
    "DatabaseException",
    "TableNotExistsException",
]
