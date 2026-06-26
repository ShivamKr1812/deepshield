import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeepShield AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkeyforjwttokensigningdeepshieldai12345!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "deepshield"

    # Redis / Celery
    REDIS_HOST: str = "localhost"
    REDIS_PORT: str = "6379"
    REDIS_PASSWORD: str = ""
    REDIS_URL: str = ""
    USE_CELERY: bool = False

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Computed at runtime (not pydantic fields)
    DATABASE_URL: str = ""
    UPLOAD_DIR: str = ""

    @model_validator(mode="before")
    @classmethod
    def parse_cors_origins(cls, data):
        if isinstance(data, dict):
            origins = data.get("BACKEND_CORS_ORIGINS")
            if isinstance(origins, str) and not origins.strip().startswith("["):
                data["BACKEND_CORS_ORIGINS"] = [x.strip() for x in origins.split(",") if x.strip()]
        return data

    @model_validator(mode="after")
    def compute_urls(self):
        self.DATABASE_URL = (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
        if not self.REDIS_URL:
            if self.REDIS_PASSWORD:
                self.REDIS_URL = f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/0"
            else:
                self.REDIS_URL = f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"
        
        # Translate Valkey schemes to Redis schemes (Celery/Redis python packages do not recognize valkey://)
        if self.REDIS_URL.startswith("valkey://"):
            self.REDIS_URL = self.REDIS_URL.replace("valkey://", "redis://", 1)
        elif self.REDIS_URL.startswith("valkeys://"):
            self.REDIS_URL = self.REDIS_URL.replace("valkeys://", "rediss://", 1)
        self.UPLOAD_DIR = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "uploads"
        )
        return self

    model_config = {"case_sensitive": True, "env_file": ".env", "extra": "ignore"}

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
