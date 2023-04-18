from fastapi import APIRouter, status

ping_router = APIRouter(tags=["ping"])


@ping_router.get(
    path="",
    status_code=status.HTTP_200_OK,
    summary="Ping endpoint.",
)
async def ping():
    return {"ping": "pong"}
