import traceback

from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.db import close_connection, create_connection
from app.routers import (
    analytics_router,
    auth_router,
    book_router,
    order_router,
    ping_router,
    user_router,
)

ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
]


async def exception_handler(request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        print(traceback.format_exception(exc))
        if hasattr(request.state, "conn"):
            close_connection(request.state.conn)
        return JSONResponse({"err": str(exc)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


async def db_connection(request, call_next):
    request.state.conn = create_connection()

    if request.method != "GET":  # need to sync
        cursor = request.state.conn.cursor()
        cursor.execute(
            """
                SELECT setval('order__id_seq', (SELECT MAX(id) FROM order_))
                UNION
                SELECT setval('book_id_seq', (SELECT MAX(id) FROM book))
                UNION
                SELECT setval('offender_id_seq', (SELECT MAX(id) FROM offender))
                UNION
                SELECT setval('author_id_seq', (SELECT MAX(id) FROM author))
                UNION
                SELECT setval('book_author_id_seq', (SELECT MAX(id) FROM book_author))
                UNION
                SELECT setval('book_order_id_seq', (SELECT MAX(id) FROM book_order))
                UNION
                SELECT setval('user__id_seq', (SELECT MAX(id) FROM user_))
            """
        )

    resp = await call_next(request)

    close_connection(request.state.conn)

    return resp


def init_routers(application: FastAPI):
    application.include_router(analytics_router, prefix="/analytics")
    application.include_router(auth_router, prefix="/auth")
    application.include_router(book_router, prefix="/books")
    application.include_router(order_router, prefix="/orders")
    application.include_router(ping_router, prefix="/ping")
    application.include_router(user_router, prefix="/users")


def create_app() -> FastAPI:

    app = FastAPI(
        title="Library API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url=None,
    )
    app.middleware("http")(db_connection)
    app.middleware("http")(exception_handler)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    init_routers(application=app)

    return app


app = create_app()
