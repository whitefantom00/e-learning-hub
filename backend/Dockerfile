FROM python:3.10-slim-bullseye

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

# Create database directory and initialize empty database
RUN mkdir -p /app/data && \
    touch /app/data/app.db && \
    chmod -R 777 /app/data

# Set environment variable for database location
ENV SQLITE_DB_PATH=/app/data/app.db

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]