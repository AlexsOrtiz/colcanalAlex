"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import List

from pydantic import field_validator

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings."""

    project_name: str = "Canalco Backend"
    api_prefix: str = "/api"

    database_url: str = "postgresql+psycopg://canalco:canalco@localhost:5432/canalco"

    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    debug: bool = False

    cors_allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    cors_allowed_methods: List[str] = ["*"]
    cors_allowed_headers: List[str] = ["*"]
    cors_allow_credentials: bool = True
    corporate_domains: List[str] = ["@canalco.com"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="CANALCO_",
    )

    @field_validator("corporate_domains", mode="before")
    @classmethod
    def _split_domains(cls, value: object) -> List[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if value is None:
            return []
        return value  # type: ignore[return-value]

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Validate JWT secret key for production use."""
        import os

        # Allow weak secret only in development
        if v == "change-me":
            env = os.getenv("CANALCO_ENV", "production")
            if env == "production":
                raise ValueError(
                    "JWT_SECRET_KEY must be set to a secure value in production. "
                    "Generate a strong secret with: openssl rand -hex 32"
                )

        # Enforce minimum length
        if len(v) < 32:
            raise ValueError(
                "JWT_SECRET_KEY must be at least 32 characters long for security. "
                "Generate a strong secret with: openssl rand -hex 32"
            )

        return v

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Validate database URL format."""
        if not v.startswith("postgresql"):
            raise ValueError(
                "DATABASE_URL must start with 'postgresql://' or 'postgresql+psycopg://'"
            )
        return v


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
