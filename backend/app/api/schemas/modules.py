"""Module listing schemas."""

from typing import Optional

from pydantic import BaseModel


class ModuleCard(BaseModel):
    """Module information for dashboard cards."""

    modulo_id: int
    clave: str
    nombre: str
    descripcion: Optional[str] = None
    icono: Optional[str] = None
    has_access: bool
