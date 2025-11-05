"""API router registration."""

from fastapi import APIRouter

from . import auth, modules

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(modules.router, prefix="/modules", tags=["modules"])

__all__ = ["router"]
