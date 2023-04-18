from .analytics import analytics_router
from .auth import auth_router
from .book import book_router
from .order import order_router
from .ping import ping_router
from .user import user_router

__all__ = [
    "analytics_router",
    "auth_router",
    "book_router",
    "order_router",
    "ping_router",
    "user_router",
]
