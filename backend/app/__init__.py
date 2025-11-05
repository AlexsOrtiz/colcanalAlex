"""
Core FastAPI application package for Canalco.
Initializes shared metadata used across the backend.
"""

__all__ = [
    "create_app",
]


def create_app() -> "fastapi.FastAPI":
    """Factory import hook to avoid circular imports in tooling."""
    from .main import app  # Lazy import to keep side effects at top-level minimal.

    return app
