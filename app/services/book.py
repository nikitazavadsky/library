import psycopg2.extensions

from app.core.exceptions import DatabaseException, NotFoundException
from app.crud import get_one_book
from app.models import Book, BookUpdate


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

def update_single_book(cursor: psycopg2.extensions.cursor, book_id: int, book: BookUpdate):

    sql = "UPDATE book SET title=%s,isbn=%s,num_pages=%s,image_url=%s,description=%s WHERE id=%s"
    sql_params = (book.title, book.isbn, book.num_pages, book.image_url, book.description, book_id)

    cursor.execute(sql, sql_params)

    delete_authors_sql = "DELETE FROM book_author WHERE book_id in %s"
    delete_authors_sql_params = tuple(book.authors)

    cursor.execute(delete_authors_sql, (delete_authors_sql_params,))

    for author in book.authors:
        cursor.execute("INSERT INTO book_author(book_id,author_id) VALUES (%s, %s)", (book_id, author))
