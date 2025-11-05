"""Business logic for authentication."""

from __future__ import annotations

from datetime import timedelta
from typing import Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..core.config import settings
from ..models.auth import Role, User
from ..utils.security import create_access_token, verify_password

LOGIN_ERROR_MESSAGE = "Credenciales incorrectas o usuario no autorizado."


class AuthService:
    """Service encapsulating login behaviour."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def authenticate(self, email: str, password: str) -> Tuple[User, str]:
        """Validate credentials and return user plus JWT."""

        allowed_domains = tuple(settings.corporate_domains)
        if allowed_domains and not any(
            email.lower().endswith(domain.lower()) for domain in allowed_domains
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=(
                    "Solo se permiten correos corporativos de los dominios: "
                    + ", ".join(allowed_domains)
                ),
            )

        user = self._get_user_by_email(email)

        if user is None or not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=LOGIN_ERROR_MESSAGE,
            )

        if not user.estado:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=LOGIN_ERROR_MESSAGE,
            )

        user.mark_login()
        self._db.add(user)
        self._db.commit()
        self._db.refresh(user)

        token_claims = {
            "sub": str(user.user_id),
            "user_id": user.user_id,
            "nombre": user.nombre,
            "rol_id": user.role.rol_id,
            "nombre_rol": user.role.nombre_rol,
            "default_module": user.role.default_module,
        }

        token = create_access_token(token_claims)

        return user, token

    def _get_user_by_email(self, email: str) -> Optional[User]:
        stmt = (
            select(User)
            .options(selectinload(User.role))
            .join(Role, User.rol_id == Role.rol_id)
            .where(User.email == email.lower())
        )
        result = self._db.execute(stmt)
        return result.scalar_one_or_none()
