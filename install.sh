#!/usr/bin/env bash

set -e

curl -sSL https://install.python-poetry.org | python3 -
poetry install
poetry run pre-commit install
