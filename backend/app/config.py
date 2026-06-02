from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def assemble_async_db_connection(cls, v: str) -> str:
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v
    SYNC_DATABASE_URL: str
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,https://ethara-self-five.vercel.app"
    API_PREFIX: str = "/api/v1"

    @property
    def cors_origins(self) -> List[str]:
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        # Force these defaults to ALWAYS be allowed
        defaults = ["http://localhost:3000", "http://localhost:5173", "https://ethara-self-five.vercel.app"]
        for d in defaults:
            if d not in origins:
                origins.append(d)
        return origins

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
