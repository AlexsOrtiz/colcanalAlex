"""FastAPI application entrypoint."""

from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router as api_router
from .core.config import settings

app = FastAPI(title=settings.project_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allowed_methods,
    allow_headers=settings.cors_allowed_headers,
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/health", tags=["health"])
async def health_check() -> Dict[str, str]:
    """Health probe endpoint."""
    return {"status": "ok"}
