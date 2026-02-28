from dotenv import load_dotenv
import os
from typing import List

load_dotenv()

class Settings:
    # FastAPI settings
    UVICORN_HOST: str = os.getenv("UVICORN_HOST", "0.0.0.0")
    UVICORN_PORT: int = int(os.getenv("UVICORN_PORT", "8000"))
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "True").lower() in ("true", "1", "t")

    # API Keys for Groq (Supporting your specific .env naming)
    GROQ_API_KEYS: List[str] = [
        key for key in [
            os.getenv("Groq_Cloud_API_KEY"),
            os.getenv("Groq_Cloud_2_API_KEY"),
            os.getenv("GROQ_API_KEY_1"),
            os.getenv("GROQ_API_KEY_2")
        ] if key
    ]
    
    # API Keys for OpenRouter
    OPENROUTER_API_KEYS: List[str] = [
        key for key in [
            os.getenv("OpenRouter_API_KEY"),
            os.getenv("OpenRouter_API_KEY_2"),
            os.getenv("OPENROUTER_API_KEY_1"),
            os.getenv("OPENROUTER_API_KEY_2")
        ] if key
    ]

    # Google Fact Check Tools API Key
    GOOGLE_FACT_CHECK_API_KEY: str = os.getenv("Google_Fact_Check_Tools") or os.getenv("GOOGLE_FACT_CHECK_API_KEY", "")

    # Default Models
    DEFAULT_VISION_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct" # Flagship Groq Multimodal Model
    DEFAULT_TEXT_MODEL: str = "llama-3.3-70b-versatile"

    # Add other configuration settings here as needed
    # Example:
    # CACHE_TYPE: str = os.getenv("CACHE_TYPE", "in_memory")

settings = Settings()
