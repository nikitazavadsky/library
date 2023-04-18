import psycopg2.extensions
from fastapi import APIRouter, Depends, status

from app.core.exceptions import PasswordDoesNotMatchException, UserNotFoundException
from app.core.jwt import decode_refresh_token, encode_access_token, encode_refresh_token
from app.core.security import Hasher
from app.crud import get_cursor, insert_user
from app.models import UserCreateModel, UserLoginModel
from app.models.token import TokenObtainPair, TokenUpdateModel
from app.services import validate_user_is_not_exist

auth_router = APIRouter(tags=["auth"])


@auth_router.post(
    "/signup",
    summary="User signup.",
    status_code=status.HTTP_200_OK,
)
def create_user(user: UserCreateModel, cursor: psycopg2.extensions.cursor = Depends(get_cursor)):
    validate_user_is_not_exist(cursor, user.email)
    user_id = insert_user(cursor, user)

    return {"user_id": user_id}


@auth_router.post(
    "/login",
    summary="User login.",
    status_code=status.HTTP_200_OK,
    response_model=TokenObtainPair,
)
def login(user: UserLoginModel, cursor: psycopg2.extensions.cursor = Depends(get_cursor)):
    cursor.execute("""SELECT password FROM user_ WHERE email = %s""", (user.email,))
    user_password = result[0] if (result := cursor.fetchone()) else ""
    if not user_password:
        raise UserNotFoundException(user_email=user.email)

    if not Hasher.verify_password(user.password, user_password):
        raise PasswordDoesNotMatchException

    refresh = encode_refresh_token(user_email=user.email)
    access = encode_access_token(user_email=user.email)

    return TokenObtainPair(access=access, refresh=refresh)


@auth_router.post(
    "/token/refresh",
    summary="Generates new access token via refresh token.",
    status_code=status.HTTP_200_OK,
)
def refresh_access_token(token: TokenUpdateModel):
    payload = decode_refresh_token(refresh_token=token.refresh)
    access = encode_access_token(user_email=payload["email"])

    return TokenObtainPair(access=access, refresh=token.refresh)
