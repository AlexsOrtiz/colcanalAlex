"""User model definition."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base

if TYPE_CHECKING:  # pragma: no cover - typing only
    from .authorization import Authorization
    from .role import Role
    from .access_log import AccessLog


class User(Base):
    """Represents authenticated users."""

    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    cargo: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    rol_id: Mapped[int] = mapped_column(
        ForeignKey("auth.roles.rol_id", onupdate="CASCADE", ondelete="RESTRICT"),
        nullable=False,
    )
    estado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    ultimo_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    must_reset: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    role: Mapped["Role"] = relationship(back_populates="users")
    autorizaciones_otorgadas: Mapped[List["Authorization"]] = relationship(
        "Authorization",
        back_populates="supervisor",
        foreign_keys="Authorization.supervisor_id",
        cascade="all, delete-orphan",
    )
    autorizaciones_recibidas: Mapped[List["Authorization"]] = relationship(
        "Authorization",
        back_populates="subordinado",
        foreign_keys="Authorization.subordinado_id",
        cascade="all, delete-orphan",
    )
    accesos: Mapped[List["AccessLog"]] = relationship(
        "AccessLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def mark_login(self) -> None:
        """Update the last login timestamp."""
        self.ultimo_login = datetime.utcnow()
