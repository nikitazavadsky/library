from app.core.exceptions import BadRequestException
from app.models import OrderStatus


class InvalidOrderStatusException(BadRequestException):
    description = "Status must be in `PENDING` state."

    def __init__(self, order_status: str) -> None:
        self.description = f"{self.description}. Status: `{OrderStatus(order_status).name}`"
        super().__init__()
