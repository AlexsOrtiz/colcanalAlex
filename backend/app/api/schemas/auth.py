"""Authentication request/response models."""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Incoming login payload."""

    email: EmailStr = Field(
        ...,
        description="Correo corporativo válido según los dominios permitidos",
    )
    password: str = Field(..., min_length=1, description="Contraseña fija asignada por PMO")


class AuthenticatedUser(BaseModel):
    """Authenticated user data returned to frontend."""

    user_id: int
    email: EmailStr
    nombre: str
    rol_id: int
    nombre_rol: str
    default_module: Optional[str] = None


class LoginResponse(BaseModel):
    """Successful login payload."""

    access_token: str
    token_type: str = "bearer"
    user: AuthenticatedUser
