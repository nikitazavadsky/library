import uuid
from datetime import datetime

import psycopg2.extensions
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse

from app.core.config import config
from app.crud.db import get_cursor
from app.services import generate_report

analytics_router = APIRouter(tags=["analytics"])


@analytics_router.get(
    "/report",
    summary="Returns .docx report in base64 encoded format.",
    status_code=status.HTTP_200_OK,
)
async def get_analytics(cursor: psycopg2.extensions.cursor = Depends(get_cursor)):
    current_datetime = datetime.now().isoformat(sep="T", timespec="seconds")
    save_path = f"{config.TABLE_DATA_FOLDER}/report-{uuid.uuid4()}-{current_datetime}.docx"

    generate_report(cursor, save_path)

    return StreamingResponse(
        open(save_path, "rb"),
        headers={
            "Content-Disposition": f'attachment; filename="{save_path}"',
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
    )
