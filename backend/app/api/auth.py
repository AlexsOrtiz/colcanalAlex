"""Authentication API endpoints."""

from typing import Tuple

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.database import get_db
from ..services.auth_service import AuthService
from .schemas import AuthenticatedUser, LoginRequest, LoginResponse

router = APIRouter()

ALLOWED_DOMAINS: Tuple[str, ...] = tuple(settings.corporate_domains)
INVALID_EMAIL_MESSAGE = (
    "El correo debe pertenecer a uno de los dominios permitidos: "
    + ", ".join(ALLOWED_DOMAINS)
    if ALLOWED_DOMAINS
    else "El correo proporcionado no pertenece a un dominio autorizado."
)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Dependency injector for AuthService."""
    return AuthService(db)


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> LoginResponse:
    """Validate credentials and return JWT plus user context."""
    email = payload.email.lower()
    if ALLOWED_DOMAINS and not any(email.endswith(domain.lower()) for domain in ALLOWED_DOMAINS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_EMAIL_MESSAGE,
        )

    user, token = auth_service.authenticate(email=email, password=payload.password)

    return LoginResponse(
        access_token=token,
        user=AuthenticatedUser(
            user_id=user.user_id,
            email=user.email,
            nombre=user.nombre,
            rol_id=user.role.rol_id,
            nombre_rol=user.role.nombre_rol,
            default_module=user.role.default_module,
        ),
    )
