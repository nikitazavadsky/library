FROM python:3.10-slim-buster

WORKDIR /app

COPY . .

RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
