from datetime import timedelta

from dotenv import load_dotenv
from pydantic import BaseSettings, PostgresDsn

load_dotenv()


class Settings(BaseSettings):
    SECRET_KEY: str
    DATABASE_URL: PostgresDsn

    JWT_TOKEN_PREFIX: str = "Bearer"
    ACCESS_TOKEN_LIFETIME: timedelta = timedelta(days=31)
    REFRESH_TOKEN_LIFETIME: timedelta = timedelta(days=365)
    ALGORITHM: str = "HS256"

    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    TABLE_DATA_FOLDER: str = "lib"


config = Settings()  # type: ignore
