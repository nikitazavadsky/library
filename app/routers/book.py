import csv

import psycopg2.extensions
from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.responses import FileResponse

from app.core.exceptions import NotFoundException, UploadBooksException
from app.core.jwt import get_current_user
from app.crud import (
    export_table_to_csv,
    filter_books,
    get_all_books,
    get_available_books,
    get_book_filters,
    get_cursor,
    get_unavailable_books,
    get_user_book_list,
    get_books_by_title,
    update_book_status,
    get_authors
)
from app.models import Book, BookFilters, UserResponseModelExtended, Author, BookUpdate
from app.services import (
    get_book_or_404,
    insert_books,
    validate_data_folder_existence,
    validate_table_existence,
    update_single_book
)
from app.tasks.celery import celery

book_router = APIRouter(tags=["books"])


@book_router.get(
    "/",
    summary="Retrieve books.",
    status_code=status.HTTP_200_OK,
    response_model=list[Book],
)
async def retrieve_books(
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    search_term: str | None = None,
    availability: bool | None = None, 
    authors: str | None = None, 
    min: int | None = None, 
    max: int | None = None
) -> list[Book]:
    
    search_parameters = {}

    if availability != None:
        search_parameters["availability"] = availability
    if authors:
        search_parameters["authors"] = authors
    if min and max:
        search_parameters["min"] = min
        search_parameters["max"] = max

    print(f"Search params: {search_parameters}")

    result = None

    if not search_parameters and search_term:
        print("Performing text search...")
        result = get_books_by_title(cursor, search_term)
    elif search_parameters:
        print("Performing filtering...")
        result = filter_books(cursor, search_parameters)
    else:
        print("Retrieving all books...")
        result = get_all_books(cursor)

    return result

@book_router.get(
    "/filters",
    summary="Get book filters",
    status_code=status.HTTP_200_OK
)
async def retrieve_book_filters(
    cursor: psycopg2.extensions.cursor = Depends(get_cursor)
) -> BookFilters:
    return get_book_filters(cursor)

@book_router.get(
    "/mine",
    summary="Retrieve book by id.",
    status_code=status.HTTP_200_OK,
)
async def retrieve_current_user_books(
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
) -> list[Book]:
    return get_user_book_list(cursor, user_id=user.id)


@book_router.get(
    "/{book_id}",
    summary="Retrieve book by id.",
    status_code=status.HTTP_200_OK,
)
async def retrieve_single_book(book_id: int, cursor: psycopg2.extensions.cursor = Depends(get_cursor)) -> Book:
    return get_book_or_404(cursor, book_id)

@book_router.put(
    "/{book_id}/",
    summary="Update book by id.",
    status_code=status.HTTP_200_OK,
)
async def update_book(
    book_id: int,
    book: BookUpdate, 
    cursor: psycopg2.extensions.cursor = Depends(get_cursor)) -> Book:
    update_single_book(cursor, book_id, book)
    return get_book_or_404(cursor, book_id)


@book_router.get(
    "/authors/",
    summary="Retrieve all authors",
    status_code=status.HTTP_200_OK,
)
async def retrieve_all_authors(cursor: psycopg2.extensions.cursor = Depends(get_cursor)) -> list[Author]:
    return get_authors(cursor)


@book_router.post(
    "/{book_id}/return",
    summary="Mark book as returned (librarian).",
    status_code=status.HTTP_200_OK,
)
async def mark_book_as_returned(
    book_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
) -> None:
    if not user.is_librarian and not user.is_admin:
        raise NotFoundException

    book = get_book_or_404(cursor, book_id)

    update_book_status(cursor, book.id)
    celery.control.revoke(task_id=f"book_{book_id}")


@book_router.post(
    "/import",
    summary="Upload books from provided .csv-file.",
    status_code=status.HTTP_201_CREATED,
)
async def import_books(
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
    csv_file: UploadFile = File(),
):
    """
    CSV structure - book_title;isbn;num_of_pages;authors

    'authors' schema:
    author1_first_name author1_second_name author1_origin, author2_first_name author2_second_name author2_origin, ...

    Example: Программирование на языке Rust;9785041950392;550;Джейсон Орендорф США, Джим Блэнди США
    """

    if not user.is_librarian:
        raise NotFoundException

    try:
        decoded_file_content = list(map(bytes.decode, csv_file.file.readlines()))
        fieldnames = ["book_title", "isbn", "num_of_pages", "authors"]

        reader = csv.DictReader(decoded_file_content, fieldnames=fieldnames, delimiter=";")
        books = list(reader)

        book_count = insert_books(cursor, books)
    except Exception as e:
        print(type(e), ":", e)
        raise UploadBooksException
    finally:
        csv_file.file.close()

    return {
        "detail": f"Successfully inserted {book_count} book{'s' if book_count != 1 else ''} from '{csv_file.filename}'!"
    }


# TODO: move it to other router
@book_router.post(
    "/export",
    summary="Export books from DB to csv.",
    status_code=status.HTTP_201_CREATED,
)
async def export_books(
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_librarian:
        raise NotFoundException

    table_name = "book"

    validate_table_existence(cursor, table_name)
    validate_data_folder_existence()

    filename = export_table_to_csv(cursor, table_name)

    return FileResponse(filename)
