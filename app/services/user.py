import psycopg2.extensions

from app.core.exceptions import NotFoundException
from app.crud import get_user
from app.models import UserResponseModelExtended


def get_user_or_404(cursor: psycopg2.extensions.cursor, user_id: int) -> UserResponseModelExtended:
    user = get_user(cursor, user_id)

    if user is None:
        raise NotFoundException

    return user
