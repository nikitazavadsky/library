from datetime import datetime
from enum import IntEnum, auto

from pydantic import BaseModel

from app.models import Book, BookShort


class OrderStatus(IntEnum):
    PENDING = auto()  # 1
    APPROVED = auto()
    REJECTED = auto()


class OrderResponseModel(BaseModel):
    id: int
    created_at: datetime
    status: OrderStatus

    class Config:
        json_encoders = {OrderStatus: lambda order_status: order_status.name}

class OrderResponseNewModel(BaseModel):
    id: int
    created_at: datetime
    status: OrderStatus
    requested_books: list[BookShort]

    class Config:
        json_encoders = {OrderStatus: lambda order_status: order_status.name}


class OrderDetailResponseModel(OrderResponseModel):
    requested_books: list[Book]
