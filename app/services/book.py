import psycopg2.extensions

from app.core.exceptions import DatabaseException, NotFoundException
from app.crud import get_one_book
from app.models import Book


def get_book_or_404(cursor: psycopg2.extensions.cursor, book_id: int) -> Book:
    book = get_one_book(cursor, book_id)

    if book is None:
        raise NotFoundException
    return book


def insert_books(cursor: psycopg2.extensions.cursor, books: list[dict]) -> int:
    book_count = 0

    for book in books:
        cursor.execute(
            """INSERT INTO book (title, isbn, num_pages) VALUES (%s, %s, %s) RETURNING id""",
            (book["book_title"].strip(), book["isbn"].strip(), book["num_of_pages"].strip()),
        )
        record = cursor.fetchone()
        if not record:
            raise DatabaseException

        book_id = record[0]

        authors = []
        for author in list(map(str.strip, book["authors"].split(","))):
            author, author_origin = author.rsplit(maxsplit=1)
            author_name, author_surname = author.split()
            authors.append((author_name, author_surname, author_origin))

        authors_ids = []
        for author in authors:
            cursor.execute("""SELECT id from author WHERE (first_name, last_name, origin) = %s""", (author,))
            record = cursor.fetchone()
            if record:
                authors_ids.append(record[0])

        cursor.execute(
            f"""
                INSERT INTO author (first_name, last_name, origin) VALUES {','.join(list(map(str, authors)))}
                ON CONFLICT DO NOTHING RETURNING id
            """,
        )
        authors_ids.extend(list(map(lambda x: x[0], cursor.fetchall())))

        book_author_values = [str((book_id, author_id)) for author_id in authors_ids]

        cursor.execute(
            f"""INSERT INTO book_author (book_id, author_id) VALUES {','.join(book_author_values)}""",
        )

        book_count += 1

    return book_count
