from datetime import datetime, timezone

import psycopg2.extensions

from app.models import Author, Book, OrderStatus, BookFilters, PageNumRange

BOOK_SQL = """
    SELECT DISTINCT ON (book.title) book.id, book.title, book.isbn, book.num_pages, book.description, book.image_url, (
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
    SELECT DISTINCT ON (book.title) book.id, book.title, book.isbn, book.num_pages, book.description, book.image_url, (
        SELECT json_agg(json_build_array(a.id, a.first_name, a.last_name, a.origin)) AS authors
        FROM book_author ba
        JOIN author a on ba.author_id = a.id
        JOIN book b ON ba.book_id = b.id
        WHERE book.id = b.id
    )
    FROM book_author
    JOIN book ON book_author.book_id = book.id
    WHERE UPPER(book.title) LIKE UPPER(%s)
"""

UNAVAILABLE_BOOKS_SQL = """
    SELECT book.id
    FROM book
    JOIN book_order bo ON bo.book_id = book.id
    JOIN order_ o ON bo.order_id = o.id
    WHERE bo.date_finished IS NULL AND o.status = 2
"""

BOOK_FILTERS_AUTHORS_SQL = """
    SELECT id, first_name, last_name, origin
    FROM author
"""

BOOK_FILTERS_PAGES_NUM_RANGE_SQL = """
    SELECT MIN(num_pages) as min, MAX(num_pages) as max
    FROM book
"""

def get_book_object(book_item):
    authors = book_item["authors"]

    return Book(
        id=book_item["id"],
        title=book_item["title"],
        isbn=book_item["isbn"],
        num_pages=book_item["num_pages"],
        image_url=book_item["image_url"],
        authors=[
            Author(id=author[0], first_name=author[1], last_name=author[2], origin=author[3]) for author in authors
        ],
        description=book_item["description"]
    )

def get_author_object(author):

    return Author(
        id=author["id"],
        first_name=author["first_name"],
        last_name=author["last_name"],
        origin=author["origin"]
    )

def get_pages_num_range_object(range):
    print(range)
    return PageNumRange(
        min=range["min"],
        max=range["max"],
    )

def get_filters_object(authors: list[Author], page_num_range: PageNumRange):

    return BookFilters(
        authors=authors,
        num_pages=page_num_range
    )

def get_one_book(cursor: psycopg2.extensions.cursor, book_id: int) -> Book | None:
    cursor.execute(f"""{BOOK_SQL} WHERE book.id = %s""", (book_id,))

    if book_item := cursor.fetchone():
        return get_book_object(book_item)

    return None


def _get_books(cursor: psycopg2.extensions.cursor, sql, params: tuple = tuple()) -> list[Book]:
    cursor.execute(sql, params)

    print(f"Executing SQL query: {sql} with params {params}")

    book_items = cursor.fetchall()

    print(f"Books retrieved: {book_items}")

    return list(map(get_book_object, book_items)) if book_items else []

def get_authors(cursor: psycopg2.extensions.cursor) -> list[Author]:
    cursor.execute(BOOK_FILTERS_AUTHORS_SQL)
    fetched_authors = cursor.fetchall()
    print(fetched_authors)
    return list(map(get_author_object, fetched_authors))

def _get_filters(cursor: psycopg2.extensions.cursor) -> BookFilters:
    cursor.execute(BOOK_FILTERS_AUTHORS_SQL)

    authors = list(map(get_author_object, cursor.fetchall()))

    cursor.execute(BOOK_FILTERS_PAGES_NUM_RANGE_SQL)

    page_num_range = get_pages_num_range_object(cursor.fetchone())

    return get_filters_object(authors, page_num_range)


def get_all_books(cursor: psycopg2.extensions.cursor) -> list[Book]:
    return _get_books(cursor, BOOK_SQL)

def get_books_by_title(cursor: psycopg2.extensions.cursor, search_term: str | None) -> list[Book]:
    return _get_books(cursor, BOOK_SEARCH_SQL, (f"%{search_term.strip().upper()}%",))

def get_book_filters(cursor: psycopg2.extensions.cursor) -> BookFilters:
    return _get_filters(cursor)

def get_books_from_ids(cursor: psycopg2.extensions.cursor, book_ids: list[int]) -> list[Book]:
    sql = f"""
        SELECT book.id, book.title, book.isbn, book.num_pages, book.authors, book.image_url, book.description
        FROM ({BOOK_SQL}) AS book
        WHERE book.id = ANY(%s)
    """
    params = (book_ids,)

    return _get_books(cursor, sql, params)

def get_books_by_order(cursor: psycopg2.extensions.cursor, order_id: int) -> list[Book]:
    sql = f"""
        SELECT book.id, book.title, book.isbn, book.num_pages, book.authors, book.image_url, book.description
        FROM ({BOOK_SQL}) AS book
        WHERE book.id = (SELECT book_id FROM book_order WHERE order_id = %s)
    """
    params = (order_id,)

    return _get_books(cursor, sql, params)


def filter_books(cursor: psycopg2.extensions.cursor, search_params: dict) -> list[Book]:

    unavailable_sql = """
        SELECT book.id
        FROM book
        JOIN book_order bo ON bo.book_id = book.id
        JOIN order_ o ON bo.order_id = o.id
        WHERE bo.date_finished IS NULL AND o.status = 2
    """

    available_sql = f"""
        SELECT book.id
        FROM book
        EXCEPT
        {unavailable_sql}
    """

    FILTER_QUERY = BOOK_SQL
    is_available = None

    if search_params:
        is_available = search_params.get("availability")

        if is_available != None:
            FILTER_QUERY = f"""
                {BOOK_SQL}
                JOIN (
                    {available_sql if is_available else unavailable_sql}
                ) AS sub ON book.id = sub.id
            """

        if "min" in search_params or "max" in search_params or "author" in search_params:
            FILTER_QUERY = FILTER_QUERY + "\n WHERE "

            query_params = []

            for key, value in search_params.items():
                if isinstance(value, str):
                    value = value.split(",")
                if key == 'min':
                    query_params.append(f"book.num_pages >= {value}")
                elif key == 'max':
                    query_params.append(f"book.num_pages <= {value}")
                elif isinstance(value, list) and key == "authors":
                    values_as_str = ",".join([f"{v}" for v in value])
                    query_params.append(f"book_author.author_id IN ({values_as_str})")
                elif not isinstance(value, list) and key == "authors":
                    query_params.append(f"book_author.author_id = '{value}'")

            FILTER_QUERY += " AND ".join(query_params)

    return _get_books(cursor, FILTER_QUERY)


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
        SELECT book.id, book.title, book.isbn, book.num_pages, book.authors, book.description
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
