"""Modules API endpoints."""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.auth import Module, RolePermission, User
from .dependencies import get_current_user
from .schemas import ModuleCard

router = APIRouter()


@router.get("", response_model=List[ModuleCard], summary="List modules and access flags")
def list_modules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ModuleCard]:
    """Return all modules with access information for the authenticated user."""
    stmt = (
        select(
            Module.modulo_id,
            Module.clave,
            Module.nombre,
            Module.descripcion,
            Module.icono,
            Module.orden,
            func.count(RolePermission.id).label("permission_count"),
        )
        .outerjoin(
            RolePermission,
            and_(
                RolePermission.modulo_id == Module.modulo_id,
                RolePermission.rol_id == current_user.rol_id,
            ),
        )
        .group_by(
            Module.modulo_id,
            Module.clave,
            Module.nombre,
            Module.descripcion,
            Module.icono,
            Module.orden,
        )
        .order_by(Module.orden, Module.nombre)
    )

    results = db.execute(stmt).all()
    modules: List[ModuleCard] = [
        ModuleCard(
            modulo_id=row.modulo_id,
            clave=row.clave,
            nombre=row.nombre,
            descripcion=row.descripcion,
            icono=row.icono,
            has_access=row.permission_count > 0,
        )
        for row in results
    ]
    return modules
