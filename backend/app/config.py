from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    SYNC_DATABASE_URL: str
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = ""
    API_PREFIX: str = "/api/v1"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
