from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

# Replace with your database URL
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

import os

# Get absolute path for SQLite database
db_path = os.getenv("SQLITE_DB_PATH", "app.db")
if not os.path.isabs(db_path):
    db_path = os.path.abspath(db_path)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

# Ensure the directory exists
os.makedirs(os.path.dirname(db_path), exist_ok=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        "timeout": 30  # Increase SQLite timeout
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Create tables at import time
def init_db():
    import sqlite3
    conn = sqlite3.connect(db_path)
    conn.execute('DROP TABLE IF EXISTS test_results')
    conn.execute('DROP TABLE IF EXISTS mock_test_questions')
    conn.execute('DROP TABLE IF EXISTS mock_test_sections')
    conn.execute('DROP TABLE IF EXISTS mock_tests')
    conn.execute('DROP TABLE IF EXISTS questions')
    conn.execute('DROP TABLE IF EXISTS quizzes')
    conn.execute('DROP TABLE IF EXISTS users')
    conn.commit()
    conn.close()
    Base.metadata.create_all(bind=engine)