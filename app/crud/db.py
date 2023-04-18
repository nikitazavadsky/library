from datetime import datetime

import psycopg2.extensions
import psycopg2.extras
from fastapi import Request

from app.core.config import config


def get_cursor(request: Request) -> psycopg2.extensions.cursor:
    return request.state.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)


def get_table_names(cursor: psycopg2.extensions.cursor) -> list[str]:
    cursor.execute("""SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'""")

    tables = list(map(lambda x: x[0], cursor.fetchall()))

    # To avoid user passwords leak
    if "user_" in tables:
        tables.remove("user_")

    return tables


def export_table_to_csv(cursor: psycopg2.extensions.cursor, table_name: str) -> str:
    sql = f"""COPY (SELECT * FROM {table_name}) TO STDOUT WITH CSV HEADER DELIMITER ';'"""
    current_datetime = datetime.now().isoformat(sep="T", timespec="seconds")

    fname = f"{config.TABLE_DATA_FOLDER}/{table_name}-{current_datetime}.csv"
    with open(fname, "w") as file:
        file.write
        cursor.copy_expert(sql, file)

    return fname
