from http import HTTPStatus

from fastapi import HTTPException


class BaseHTTPException(HTTPException):
    code = HTTPStatus.INTERNAL_SERVER_ERROR
    description = HTTPStatus.INTERNAL_SERVER_ERROR.description

    def __init__(self) -> None:
        self.detail = self.description
        self.status_code = self.code


class BadRequestException(BaseHTTPException):
    code = HTTPStatus.BAD_REQUEST
    description = HTTPStatus.BAD_REQUEST.description


class UnauthorizedException(BaseHTTPException):
    code = HTTPStatus.UNAUTHORIZED
    description = HTTPStatus.UNAUTHORIZED.description


class ForbiddenException(BaseHTTPException):
    code = HTTPStatus.FORBIDDEN
    description = HTTPStatus.FORBIDDEN.description


class NotFoundException(BaseHTTPException):
    code = HTTPStatus.NOT_FOUND
    description = HTTPStatus.NOT_FOUND.description
