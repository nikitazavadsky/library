from app.core.exceptions import BadRequestException, BaseHTTPException


class NoRequestedBooksException(BadRequestException):
    description = "Book list can't be empty. Provide book ids. Example: [1, 2]"


class UnavailableBooksException(BadRequestException):
    def __init__(self, unavailable_books: str) -> None:
        self.description = f"Not available: {unavailable_books}."
        super().__init__()


class UploadBooksException(BaseHTTPException):
    description = "There was an error uploading the file."


class TooManyBooksException(BadRequestException):
    description = "You can't have more than 3 books at the time."
