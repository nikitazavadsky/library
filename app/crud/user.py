import psycopg2.extensions

from app.core.exceptions import DatabaseException
from app.core.security import Hasher
from app.models import UserCreateModel, UserResponseModelExtended, UserRole

USER_SQL = """
    SELECT id, email, first_name, last_name, role FROM user_
"""


def get_user_object(user_item: tuple) -> UserResponseModelExtended:
    user_data = {key: user_item[i] for i, key in enumerate(UserResponseModelExtended.__fields__.keys())}

    return UserResponseModelExtended(**user_data)


def get_user(cursor: psycopg2.extensions.cursor, user_id: int) -> UserResponseModelExtended | None:
    cursor.execute(f"""{USER_SQL} WHERE id = %s""", (user_id,))
    if user_item := cursor.fetchone():
        return get_user_object(user_item)

    return None


def _get_user_objects(user_items) -> list[UserResponseModelExtended]:
    return list(map(get_user_object, user_items))


def get_users_except_admins(cursor: psycopg2.extensions.cursor) -> list[UserResponseModelExtended]:
    cursor.execute(f"""{USER_SQL} WHERE role != %s""", (UserRole.ADMIN,))

    if user_items := cursor.fetchall():
        return _get_user_objects(user_items)

    return []


def get_users(cursor: psycopg2.extensions.cursor) -> list[UserResponseModelExtended]:
    cursor.execute(USER_SQL)

    if user_items := cursor.fetchall():
        return _get_user_objects(user_items)

    return []


def insert_user(cursor: psycopg2.extensions.cursor, user: UserCreateModel, role: int = UserRole.READER):
    cursor.execute(
        """INSERT INTO user_ (email, first_name, last_name, password, role) VALUES (%s, %s, %s, %s, %s) RETURNING id""",
        (user.email, user.first_name, user.last_name, Hasher.get_password_hash(user.password), role),
    )

    if not (user_item := cursor.fetchone()):
        raise DatabaseException

    return user_item["id"]  # type: ignore


def delete_user(cursor: psycopg2.extensions.cursor, user_id: int):
    cursor.execute("""DELETE FROM user_ WHERE id = %s RETURNING id""", (user_id,))

    if not (user_item := cursor.fetchone()):
        raise DatabaseException

    return user_item["id"]  # type: ignore
