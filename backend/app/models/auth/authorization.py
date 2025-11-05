"""Authorization hierarchy model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base

if TYPE_CHECKING:  # pragma: no cover
    from .category import Category
    from .module import Module
    from .user import User


class Authorization(Base):
    """Represents supervisory relationships between users."""

    __tablename__ = "autorizaciones"
    __table_args__ = (
        UniqueConstraint(
            "supervisor_id",
            "subordinado_id",
            "modulo_id",
            "categoria_id",
            "tipo",
            name="uq_auth_autorizaciones_relacion",
        ),
        {"schema": "auth"},
    )

    autorizacion_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    supervisor_id: Mapped[int] = mapped_column(
        ForeignKey("auth.users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    subordinado_id: Mapped[int] = mapped_column(
        ForeignKey("auth.users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    modulo_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("auth.modulos.modulo_id", ondelete="CASCADE"),
        nullable=True,
    )
    categoria_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("auth.categorias.categoria_id", ondelete="CASCADE"),
        nullable=True,
    )
    tipo: Mapped[str] = mapped_column(String(50), default="aprobacion", nullable=False)
    nivel: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    es_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    supervisor: Mapped["User"] = relationship(
        back_populates="autorizaciones_otorgadas",
        foreign_keys=[supervisor_id],
    )
    subordinado: Mapped["User"] = relationship(
        back_populates="autorizaciones_recibidas",
        foreign_keys=[subordinado_id],
    )
    modulo: Mapped[Optional["Module"]] = relationship(foreign_keys=[modulo_id])
    categoria: Mapped[Optional["Category"]] = relationship(foreign_keys=[categoria_id])
