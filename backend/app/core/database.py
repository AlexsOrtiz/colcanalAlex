"""SQLAlchemy database configuration and session management."""

from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy models."""


# Database engine with optimized connection pooling
engine = create_engine(
    settings.database_url,
    future=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,  # Number of connections to maintain in the pool
    max_overflow=20,  # Max additional connections beyond pool_size
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=False,  # Set to True for SQL query logging (useful for debugging)
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        "application_name": "canalco_backend",  # Identify connections in pg_stat_activity
    },
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autoflush=False,
    expire_on_commit=False,
    future=True,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session per request."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
