from datetime import datetime, timezone

import psycopg2.extensions

from app.models import Author, Book, OrderStatus

BOOK_SQL = """
    SELECT DISTINCT ON (book.title) book.id, book.title, book.isbn, book.num_pages, (
        SELECT json_agg(json_build_array(a.id, a.first_name, a.last_name, a.origin)) AS authors
        FROM book_author ba
        JOIN author a on ba.author_id = a.id
        JOIN book b ON ba.book_id = b.id
        WHERE book.id = b.id
    )
    FROM book_author
    JOIN book ON book_author.book_id = book.id
"""

BOOK_SEARCH_SQL = """
    SELECT DISTINCT ON (book.title) book.id, book.title, book.isbn, book.num_pages, (
        SELECT json_agg(json_build_array(a.id, a.first_name, a.last_name, a.origin)) AS authors
        FROM book_author ba
        JOIN author a on ba.author_id = a.id
        JOIN book b ON ba.book_id = b.id
        WHERE book.id = b.id
    )
    FROM book_author
    JOIN book ON book_author.book_id = book.id
    WHERE book.title LIKE %s
"""

UNAVAILABLE_BOOKS_SQL = """
    SELECT book.id
    FROM book
    JOIN book_order bo ON bo.book_id = book.id
    JOIN order_ o ON bo.order_id = o.id
    WHERE bo.date_finished IS NULL
"""


def get_book_object(book_item):
    authors = book_item["authors"]

    return Book(
        id=book_item["id"],
        title=book_item["title"],
        isbn=book_item["isbn"],
        num_pages=book_item["num_pages"],
        authors=[
            Author(id=author[0], first_name=author[1], last_name=author[2], origin=author[3]) for author in authors
        ],
    )


def get_one_book(cursor: psycopg2.extensions.cursor, book_id: int) -> Book | None:
    cursor.execute(f"""{BOOK_SQL} WHERE book.id = %s""", (book_id,))

    if book_item := cursor.fetchone():
        return get_book_object(book_item)

    return None


def _get_books(cursor: psycopg2.extensions.cursor, sql, params: tuple = tuple()) -> list[Book]:
    cursor.execute(sql, params)

    book_items = cursor.fetchall()

    return list(map(get_book_object, book_items))


def get_all_books(cursor: psycopg2.extensions.cursor) -> list[Book]:
    return _get_books(cursor, BOOK_SQL)

def get_books_by_title(cursor: psycopg2.extensions.cursor, search_term: str | None) -> list[Book]:
    return _get_books(cursor, BOOK_SEARCH_SQL, (f"%{search_term}%",))

def get_books_from_ids(cursor: psycopg2.extensions.cursor, book_ids: list[int]) -> list[Book]:
    sql = f"""
        SELECT book.id, book.title, book.isbn, book.num_pages, book.authors
        FROM ({BOOK_SQL}) AS book
        WHERE book.id = ANY(%s)
    """
    params = (book_ids,)

    return _get_books(cursor, sql, params)


def filter_books(cursor: psycopg2.extensions.cursor, is_available: bool = True) -> list[Book]:
    unavailable_sql = """
        SELECT book.id
        FROM book
        JOIN book_order bo ON bo.book_id = book.id
        JOIN order_ o ON bo.order_id = o.id
        WHERE bo.date_finished IS NULL
    """

    available_sql = f"""
        SELECT book.id
        FROM book
        EXCEPT
        {unavailable_sql}
    """

    sql = f"""
        {BOOK_SQL}
        JOIN (
            {available_sql if is_available else unavailable_sql}
        ) AS sub ON book.id = sub.id
    """

    return _get_books(cursor, sql)


def get_unavailable_books(cursor: psycopg2.extensions.cursor) -> list[Book]:
    sql = f"""
        {BOOK_SQL}
        JOIN (
            {UNAVAILABLE_BOOKS_SQL}
        ) AS sub ON book.id = sub.id
    """
    return _get_books(cursor, sql)


def get_available_books(cursor: psycopg2.extensions.cursor) -> list[Book]:
    sql = f"""
        {BOOK_SQL}
        JOIN (
            SELECT book.id
            FROM book
            EXCEPT
            {UNAVAILABLE_BOOKS_SQL}
        ) AS sub ON book.id = sub.id
    """
    return _get_books(cursor, sql)


def get_user_book_list(cursor: psycopg2.extensions.cursor, user_id: int) -> list[Book]:
    sql = f"""
        SELECT book.id, book.title, book.isbn, book.num_pages, book.authors
        FROM ({BOOK_SQL}) AS book
        JOIN book_order bo ON bo.book_id = book.id
        JOIN order_ o ON bo.order_id = o.id
        WHERE o.status = %s AND o.user_id = %s AND bo.date_finished IS NULL
    """
    params = (OrderStatus.APPROVED, user_id)

    return _get_books(cursor, sql, params)


def update_book_status(cursor: psycopg2.extensions.cursor, book_id: int):
    cursor.execute(
        """UPDATE book_order SET date_finished = %s WHERE book_id = %s AND date_finished IS NULL""",
        (datetime.now(tz=timezone.utc), book_id),
    )


def get_books_taken_by_user(cursor: psycopg2.extensions.cursor, user_id: int) -> list[Book]:
    sql = """
        SELECT *
        FROM book_order bo
        JOIN order_ o ON bo.order_id = o.id
        WHERE bo.date_finished IS NULL AND o.user_id = %s
    """
    params = (user_id,)

    return _get_books(cursor, sql, params)
