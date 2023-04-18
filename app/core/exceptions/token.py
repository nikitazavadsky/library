from app.core.exceptions import ForbiddenException, UnauthorizedException


class InvalidAuthorizationTypeException(ForbiddenException):
    description = "Invalid authorization type."


class ExpiredTokenException(UnauthorizedException):
    description = "Token is expired."


class DecodeTokenException(UnauthorizedException):
    description = "Token is invalid."
