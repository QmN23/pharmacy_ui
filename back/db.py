import psycopg2
import psycopg2.extras
from fastapi import Depends

DB_CONFIG = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "111",
    "host": "localhost"
}

def get_db():
    # Создаём соединение
    conn = psycopg2.connect(**DB_CONFIG, cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Передаём роутеру
        yield conn
    finally:
        # Закрываем после
        conn.close()