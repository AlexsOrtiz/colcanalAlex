"""Module model definition."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base

if TYPE_CHECKING:  # pragma: no cover - typing only
    from .category import Category
    from .role_permission import RolePermission


class Module(Base):
    """Top level functional module."""

    __tablename__ = "modulos"
    __table_args__ = {"schema": "auth"}

    modulo_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    clave: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icono: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    es_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    categorias: Mapped[List["Category"]] = relationship(
        back_populates="modulo",
        cascade="all, delete-orphan",
    )
    asignaciones: Mapped[List["RolePermission"]] = relationship(back_populates="modulo")
