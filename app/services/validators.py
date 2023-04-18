import os

import psycopg2.extensions

from app.core.config import config
from app.core.exceptions import (
    InvalidOrderStatusException,
    NotFoundException,
    TableNotExistsException,
    TooManyBooksException,
    UnavailableBooksException,
    UserExistsException,
    UserIsOffender,
)
from app.crud import get_books_from_ids, get_table_names, get_unavailable_books
from app.models import OrderStatus


def validate_order_status(cursor: psycopg2.extensions.cursor, order_id: int):
    cursor.execute("""SELECT * FROM order_ WHERE id = %s""", (order_id,))
    record = cursor.fetchone()
    if not record:
        raise NotFoundException

    if (order_status := record["status"]) != OrderStatus.PENDING:  # type: ignore
        raise InvalidOrderStatusException(order_status=order_status)

    return record


def validate_order_books_available(cursor: psycopg2.extensions.cursor, books_ids: list[int]):
    unavailable_books = {book.id: book for book in get_unavailable_books(cursor)}

    if unavailable_ordered_books_ids := set(books_ids) & unavailable_books.keys():
        unavailable_books_response = ", ".join(
            [f"`{book_id} - {unavailable_books[book_id].title}`" for book_id in unavailable_ordered_books_ids]
        )
        raise UnavailableBooksException(unavailable_books=unavailable_books_response)


def validate_user_is_not_exist(cursor: psycopg2.extensions.cursor, user_email: str):
    cursor.execute("""SELECT * FROM user_ where email = %s""", (user_email,))
    if cursor.fetchone():
        raise UserExistsException(user_email=user_email)


def validate_user_is_not_offender(cursor: psycopg2.extensions.cursor, user_id: int):
    cursor.execute("""SELECT book_id FROM offender WHERE user_id = %s""", (user_id,))

    if result := cursor.fetchall():
        taken_books_ids = list(map(lambda x: x[0], result))
        taken_books = get_books_from_ids(cursor, taken_books_ids)

        raise UserIsOffender(taken_books=taken_books)


def validate_user_book_count(user_books: list, requested_books: list[int]):
    total_book_count = len(user_books) + len(requested_books)

    if total_book_count > 3:
        raise TooManyBooksException


def validate_table_existence(cursor: psycopg2.extensions.cursor, table_name: str):
    if table_name not in get_table_names(cursor):
        raise TableNotExistsException(table_name=table_name)


def validate_data_folder_existence():
    if not os.path.exists(config.TABLE_DATA_FOLDER):
        os.mkdir(config.TABLE_DATA_FOLDER)
