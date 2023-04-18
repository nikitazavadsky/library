import psycopg2.extensions
from fastapi import APIRouter, Depends, status

from app.core.exceptions import ForbiddenException, NotFoundException
from app.core.jwt import get_current_user
from app.crud import (
    delete_user,
    get_cursor,
    get_user,
    get_users,
    get_users_except_admins,
    insert_user,
)
from app.models import (
    OrderResponseModel,
    UserCreateModel,
    UserResponseModel,
    UserResponseModelExtended,
    UserRole,
)
from app.routers.book import mark_book_as_returned, retrieve_current_user_books
from app.routers.order import approve_order, get_order, get_orders, reject_order
from app.services import get_user_or_404

user_router = APIRouter(tags=["user"])


@user_router.get(
    "/",
    summary="Retrieve all users. (librarian)",
    status_code=status.HTTP_200_OK,
    response_model=list[UserResponseModelExtended],
)
def get_all_users(
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if user.is_reader:
        raise NotFoundException

    if user.is_librarian:
        return get_users_except_admins(cursor)

    return get_users(cursor)


@user_router.post(
    path="/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a librarian. (admin)",
)
async def create_librarian(
    user_data: UserCreateModel,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_admin:
        raise NotFoundException

    user_id = insert_user(cursor, user_data, role=UserRole.LIBRARIAN)

    return {"user_id": user_id}


@user_router.delete(
    path="/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a librarian. (admin)",
)
async def delete_librarian(
    user_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_admin:
        raise NotFoundException

    user_to_delete = get_user_or_404(cursor, user_id)
    if user_to_delete.is_librarian:
        raise ForbiddenException

    delete_user(cursor, user_to_delete.id)


@user_router.get(
    "/me",
    summary="Retrieve current user.",
    status_code=status.HTTP_200_OK,
    response_model=UserResponseModelExtended | UserResponseModel,
)
def retrieve_current_user(user: UserResponseModelExtended = Depends(get_current_user)):
    if user.is_reader:
        return UserResponseModel(**user.dict())

    return user


@user_router.get(
    "/{user_id}",
    summary="Retrieve user by <id>. (librarian)",
    status_code=status.HTTP_200_OK,
    response_model=UserResponseModelExtended,
)
def retrieve_user(
    user_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_librarian:
        raise NotFoundException

    return get_user_or_404(cursor, user_id)


@user_router.get(
    "/{user_id}/books",
    summary="Retrieve user's books. (librarian)",
    status_code=status.HTTP_200_OK,
)
async def retrieve_user_books(
    user_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_librarian or (user_obj := get_user(cursor, user_id)) is None:
        raise NotFoundException

    return await retrieve_current_user_books(cursor=cursor, user=user_obj)


@user_router.post(
    "/{user_id}/books/{book_id}/return",
    summary="Mark book as returned (librarian).",
    status_code=status.HTTP_200_OK,
)
async def mark_user_book_as_returned(
    book_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
) -> None:
    return await mark_book_as_returned(book_id=book_id, cursor=cursor, user=user)


@user_router.get(
    "/{user_id}/orders/",
    summary="Retrieve user's orders. (librarian)",
    status_code=status.HTTP_200_OK,
    response_model=list[OrderResponseModel],
)
async def retrieve_user_orders(
    user_id: int,
    state: str | None = None,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_librarian or (user_obj := get_user(cursor, user_id)) is None:
        raise NotFoundException

    return await get_orders(state=state, cursor=cursor, user=user_obj)


@user_router.get(
    "/{user_id}/orders/{order_id}",
    summary="Retrieve user's order by <id>. (librarian)",
    status_code=status.HTTP_200_OK,
)
async def retrieve_user_order(
    user_id: int,
    order_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    if not user.is_librarian or (user_obj := get_user(cursor, user_id)) is None:
        raise NotFoundException

    return await get_order(order_id=order_id, cursor=cursor, user=user_obj)


@user_router.post(
    path="/{user_id}/orders/{order_id}/approve",
    status_code=status.HTTP_200_OK,
    summary="Approve order by id. (librarian)",
)
async def approve_user_order(
    order_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    return await approve_order(order_id=order_id, cursor=cursor, user=user)


@user_router.post(
    path="/{user_id}/orders/{order_id}/reject",
    status_code=status.HTTP_200_OK,
    summary="Reject order by id. (librarian)",
)
async def reject_user_order(
    order_id: int,
    cursor: psycopg2.extensions.cursor = Depends(get_cursor),
    user: UserResponseModelExtended = Depends(get_current_user),
):
    return await reject_order(order_id=order_id, cursor=cursor, user=user)
