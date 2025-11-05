"""Category model definition."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base

if TYPE_CHECKING:  # pragma: no cover
    from .module import Module
    from .role_permission import RolePermission


class Category(Base):
    """Sub-module category bound to a module."""

    __tablename__ = "categorias"
    __table_args__ = {"schema": "auth"}

    categoria_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    modulo_id: Mapped[int] = mapped_column(
        ForeignKey("auth.modulos.modulo_id", ondelete="CASCADE"),
        nullable=False,
    )
    clave: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    es_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    modulo: Mapped["Module"] = relationship(back_populates="categorias")
    asignaciones: Mapped[List["RolePermission"]] = relationship(back_populates="categoria")
