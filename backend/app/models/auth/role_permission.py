"""Role-permission association."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base

if TYPE_CHECKING:  # pragma: no cover - typing helpers
    from .category import Category
    from .module import Module
    from .permission import Permission
    from .role import Role


class RolePermission(Base):
    """Permission grants per role, module and category."""

    __tablename__ = "roles_permisos_modulo_categoria"
    __table_args__ = (
        UniqueConstraint(
            "rol_id",
            "modulo_id",
            "categoria_id",
            "permiso_id",
            name="uq_roles_permisos_modulo_categoria",
        ),
        {"schema": "auth"},
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rol_id: Mapped[int] = mapped_column(
        ForeignKey("auth.roles.rol_id", ondelete="CASCADE"),
        nullable=False,
    )
    modulo_id: Mapped[int] = mapped_column(
        ForeignKey("auth.modulos.modulo_id", ondelete="CASCADE"),
        nullable=False,
    )
    categoria_id: Mapped[int] = mapped_column(
        ForeignKey("auth.categorias.categoria_id", ondelete="CASCADE"),
        nullable=False,
    )
    permiso_id: Mapped[int] = mapped_column(
        ForeignKey("auth.permisos.permiso_id", ondelete="CASCADE"),
        nullable=False,
    )
    alcance: Mapped[str] = mapped_column(String(50), default="total", nullable=False)
    restricciones: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    role: Mapped["Role"] = relationship(back_populates="permissions")
    modulo: Mapped["Module"] = relationship(back_populates="asignaciones")
    categoria: Mapped["Category"] = relationship(back_populates="asignaciones")
    permission: Mapped["Permission"] = relationship(back_populates="roles")
