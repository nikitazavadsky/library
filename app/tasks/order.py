from app.db import close_connection, create_connection
from app.tasks.celery import celery


@celery.task
def mark_user_as_offender(user_id: int, book_id: int):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("""INSERT INTO offender (user_id, book_id) VALUES (%s, %s)""", (user_id, book_id))
    close_connection(conn)
