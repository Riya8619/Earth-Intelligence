from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # App
    APP_NAME: str
    APP_ENV: str = "development"
    DEBUG: bool = True

    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str

    # Frontend
    FRONTEND_URL: str

    # AI
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # APIs
    NASA_API_KEY: str = ""
    NASA_FIRMS_API_KEY: str = ""
    USGS_API_URL: str = ""
    OPEN_METEO_BASE_URL: str = ""
    GDACS_API_URL: str = ""

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str) and value.lower() in {"release", "production", "prod"}:
            return False
        return value

    class Config:
        env_file = ".env"


settings = Settings()
