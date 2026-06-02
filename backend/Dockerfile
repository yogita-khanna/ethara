FROM python:3.12-slim

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN adduser --disabled-password --no-create-home appuser
USER appuser

EXPOSE 8000

# Copy Alembic config
COPY backend/alembic.ini /app/alembic.ini

# Use entrypoint script to run migrations then start server
ENTRYPOINT ["sh", "/app/entrypoint.sh"]
