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
    image_url: str
    authors: list[Author]

class BookShort(BaseModel):
    id: int
    title: str
    isbn: str
    image_url: str
    num_pages: int

class PageNumRange(BaseModel):
    min: int
    max: int

class BookFilters(BaseModel):
    authors: list[Author]
    num_pages: PageNumRange
