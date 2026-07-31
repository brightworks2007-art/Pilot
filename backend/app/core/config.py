"""
Central app settings, loaded from environment variables (.env locally,
real env vars on Render). Nothing else in the app should call os.getenv
directly -- import `settings` from here instead, so all config lives
in one place.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_bucket: str = "documents"

    # LLM (used by the intent parser in services/intent_service.py)
    gemini_api_key: str
    gemini_model: str = "gemini-3.6-flash"

    # CORS - comma-separated list of allowed frontend origins
    frontend_origins: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


settings = Settings()
