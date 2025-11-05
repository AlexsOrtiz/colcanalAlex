"""Access log model."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional, Dict

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ...core.database import Base

if TYPE_CHECKING:  # pragma: no cover
    from .user import User


class AccessLog(Base):
    """Stores authentication attempts."""

    __tablename__ = "bitacora_accesos"
    __table_args__ = {"schema": "auth"}

    bitacora_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("auth.users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    resultado: Mapped[str] = mapped_column(String(20), nullable=False)
    mensaje: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_origen: Mapped[Optional[str]] = mapped_column(INET, nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extra_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    user: Mapped[Optional["User"]] = relationship(back_populates="accesos")
