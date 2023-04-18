from celery import Celery

from app.core.config import config

celery = Celery(__name__)

celery.conf.broker_url = config.CELERY_BROKER_URL
celery.conf.result_backend = config.CELERY_RESULT_BACKEND
