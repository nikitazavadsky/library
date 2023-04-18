from pydantic import BaseModel


class Author(BaseModel):
    id: int
    first_name: str
    last_name: str
    origin: str


class BookAuthor(BaseModel):
    id: int
    book_id: int
    author_id: int


class Book(BaseModel):
    id: int
    title: str
    isbn: str
    num_pages: int
    authors: list[Author]


class BookFilters(BaseModel):
    available: bool
