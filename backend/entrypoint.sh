#!/usr/bin/env bash
set -e

# Apply database migrations
alembic -c /app/alembic.ini upgrade head

# Seed the database
python seed.py

# Start the FastAPI server
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT