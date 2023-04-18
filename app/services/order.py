import psycopg2.extensions

from app.crud import get_books_from_ids
from app.models import OrderDetailResponseModel, OrderStatus


def generate_status_list(state: str | None) -> list[OrderStatus]:
    """Allows to get OrderStatus list from strings like `pending,approved,unknown`."""

    if state is None:
        return []

    status_list = []
    for s in state.split(","):
        order_status = OrderStatus.__dict__.get(s.upper())

        if order_status is not None:
            status_list.append(order_status)

    return status_list


def get_order_object(cursor: psycopg2.extensions.cursor, order_data) -> OrderDetailResponseModel:
    book_ids = list(map(int, order_data["requested_books"].split(",")))
    order_data["requested_books"] = get_books_from_ids(cursor, book_ids)

    return OrderDetailResponseModel(**order_data)
