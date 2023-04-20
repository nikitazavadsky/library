from datetime import datetime, timedelta, timezone
from typing import Any

import psycopg2.extensions
from fastapi import APIRouter, Depends, status

from app.core.exceptions import (
    DatabaseException,
    NoRequestedBooksException,
    NotFoundException,
)
from app.core.jwt import get_current_user
from app.crud import get_books_taken_by_user, get_cursor
from app.models import (
    OrderDetailResponseModel,
    OrderResponseModel,
    OrderResponseNewModel,
    OrderStatus,
    UserResponseModelExtended,
)
from app.services import (
    validate_order_books_available,
    validate_order_status,
    validate_user_book_count,
    validate_user_is_not_offender,
)
from app.services.order import generate_status_list, get_order_object
from app.tasks import mark_user_as_offender

order_router = APIRouter(tags=["order"])


@order_router.get(
    path="/",
    status_code=status.HTTP_200_OK,
    summary="List of user's orders.",
    response_model=list[OrderResponseNewModel],
)
async def get_orders(
    state: str | None = None,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    status_list = generate_status_list(state) or list(OrderStatus)

    sql = """SELECT o.id, o.status, o.created_at, o.user_id, json_agg(b.*) AS requested_books
                FROM order_ o
                JOIN book_order bo ON o.id = bo.order_id
                JOIN book b ON b.id = bo.book_id
                WHERE status = ANY(%s)
                """
    params: list[Any] = [
        status_list,
    ]

    if not user.is_librarian:
        sql += " AND user_id = %s"
        params.append(user.id)

    sql += "\nGROUP BY o.id;"

    cursor.execute(sql, params)
    orders: list = cursor.fetchall()

    print(sql)
    print(orders)

    return [OrderResponseNewModel(**order) for order in orders]  # type: ignore


@order_router.post(
    path="/",
    status_code=status.HTTP_201_CREATED,
    summary="Create order for user.",
)
async def create_order(
    books_ids: list[int],
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not books_ids:
        raise NoRequestedBooksException

    validate_user_is_not_offender(cursor, user_id=user.id)

    books_ids = list(set(books_ids))
    validate_order_books_available(cursor, books_ids)
    user_books = get_books_taken_by_user(cursor, user_id=user.id)
    validate_user_book_count(user_books, books_ids)

    cursor.execute(
        """INSERT INTO order_ (created_at, user_id, status) VALUES(%s, %s, %s) RETURNING id""",
        (datetime.now(tz=timezone.utc), user.id, OrderStatus.PENDING),
    )

    record = cursor.fetchone()
    if not record:
        raise DatabaseException

    order_id = record[0]
    
    book_order_values = [(order_id, book_id, datetime.now(tz=timezone.utc)) for book_id in books_ids]
    cursor.executemany(
        "INSERT INTO book_order (order_id, book_id, date_start) VALUES (%s, %s, %s)",
        book_order_values
    )

    return {"order_id": order_id}  # Order successfully created! Your order number is: ...


@order_router.get(
    path="/{order_id}",
    status_code=status.HTTP_200_OK,
    summary="Get order by id.",
    response_model=OrderDetailResponseModel,
)
async def get_order(
    order_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    sql = """SELECT * FROM order_ WHERE id = %s"""
    params: list[int] = [
        order_id,
    ]

    if not user.is_librarian:
        sql += " AND user_id = %s"
        params.append(user.id)

    order_item = cursor.fetchone()
    if not order_item:
        raise NotFoundException

    return get_order_object(cursor, order_item)


@order_router.post(
    path="/{order_id}/approve",
    status_code=status.HTTP_200_OK,
    summary="Approve order by id. (librarian)",
)
async def approve_order(
    order_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_librarian:
        raise NotFoundException

    order_item = validate_order_status(cursor, order_id)

    user_id, requested_books = order_item["user_id"], order_item["requested_books"]  # type: ignore
    books_ids = list(map(int, requested_books.split(",")))

    validate_order_books_available(cursor, books_ids)

    current_datetime = datetime.now(tz=timezone.utc)

    book_order_values = (str((order_id, book_id, current_datetime.isoformat())) for book_id in books_ids)
    cursor.execute(
        f"""INSERT INTO book_order (order_id, book_id, date_start)
        VALUES {','.join(book_order_values)}"""
    )
    for book_id in books_ids:
        mark_user_as_offender.apply_async(
            (user_id, book_id), eta=current_datetime + timedelta(days=14), task_id=f"book_{book_id}"
        )

    cursor.execute("""UPDATE order_ SET status = %s WHERE id = %s""", (OrderStatus.APPROVED, order_id))


@order_router.post(
    path="/{order_id}/reject",
    status_code=status.HTTP_200_OK,
    summary="Reject order by id. (librarian)",
)
async def reject_order(
    order_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_librarian:
        raise NotFoundException

    validate_order_status(cursor, order_id)

    cursor.execute(
        """UPDATE order_ SET status = %s WHERE id = %s and status = %s""",
        (OrderStatus.REJECTED, order_id, OrderStatus.PENDING),
    )
