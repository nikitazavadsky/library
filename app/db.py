import psycopg2

from app.core.config import config


def create_connection():
    return psycopg2.connect(config.DATABASE_URL)


def close_connection(conn):
    conn.commit()
    conn.close()
