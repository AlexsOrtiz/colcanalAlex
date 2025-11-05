"""Role model definition."""

from __future__ import annotations

from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base

if TYPE_CHECKING:  # pragma: no cover - imported only for typing help
    from .role_permission import RolePermission
    from .user import User


class Role(Base):
    """Role grouping with associated permissions."""

    __tablename__ = "roles"
    __table_args__ = {"schema": "auth"}

    rol_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre_rol: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    default_module: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    users: Mapped[List["User"]] = relationship(back_populates="role")
    permissions: Mapped[List["RolePermission"]] = relationship(
        back_populates="role",
        cascade="all, delete-orphan",
    )
