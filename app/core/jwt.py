import datetime as dt
import functools

import jwt
import psycopg2.extensions
from fastapi import Depends, Header

from app.core.config import config
from app.core.exceptions import (
    DecodeTokenException,
    ExpiredTokenException,
    InvalidAuthorizationTypeException,
    NotFoundException,
)
from app.crud import get_cursor, get_user_object


def _get_authorization_token(authorization: str = Header(...)):
    try:
        token_prefix, token = authorization.split()

        if token_prefix != config.JWT_TOKEN_PREFIX:
            raise ValueError
    except ValueError:
        raise InvalidAuthorizationTypeException

    return token


def get_current_user(
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    token: str = Depends(_get_authorization_token),
):
    payload = decode_access_token(token)
    user_email = payload["email"]

    cursor.execute("""SELECT id, email, first_name, last_name, role FROM user_ WHERE email = %s""", (user_email,))

    user_item = cursor.fetchone()
    if not user_item:
        raise NotFoundException

    return get_user_object(user_item)


def encode_access_token(user_email: str):
    payload = {
        "token_type": "access",
        "exp": dt.datetime.utcnow() + config.ACCESS_TOKEN_LIFETIME,
        "email": user_email,
    }

    return jwt.encode(payload, key=config.SECRET_KEY, algorithm=config.ALGORITHM)


def check_token_validness(function):
    @functools.wraps(function)
    def _wrapper(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except jwt.DecodeError:
            raise DecodeTokenException
        except jwt.ExpiredSignatureError:
            raise ExpiredTokenException

    return _wrapper


@check_token_validness
def decode_access_token(access_token):
    return jwt.decode(
        access_token,
        key=config.SECRET_KEY,
        algorithms=[
            config.ALGORITHM,
        ],
    )


def encode_refresh_token(user_email: str):
    payload = {
        "token_type": "refresh",
        "exp": dt.datetime.utcnow() + config.REFRESH_TOKEN_LIFETIME,
        "email": user_email,
    }

    return jwt.encode(payload, key=config.SECRET_KEY, algorithm=config.ALGORITHM)


@check_token_validness
def decode_refresh_token(refresh_token):
    return jwt.decode(
        refresh_token,
        key=config.SECRET_KEY,
        algorithms=[
            config.ALGORITHM,
        ],
    )
