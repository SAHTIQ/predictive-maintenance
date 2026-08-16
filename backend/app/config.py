"""
Application Configuration Module
SPDX-License-Identifier: MIT
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Predictive Maintenance & Machine Health Monitoring Platform"
    PROJECT_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/predictive_maintenance"
    )
    
    # ML Model Paths
    ML_MODEL_PATH: str = os.getenv(
        "ML_MODEL_PATH",
        str(BASE_DIR / "ml" / "models" / "model.joblib")
    )
    ML_SCALER_PATH: str = os.getenv(
        "ML_SCALER_PATH",
        str(BASE_DIR / "ml" / "models" / "scaler.joblib")
    )
    ML_ANOMALY_MODEL_PATH: str = os.getenv(
        "ML_ANOMALY_MODEL_PATH",
        str(BASE_DIR / "ml" / "models" / "isolation_forest.joblib")
    )

    # Configurable Rule Thresholds
    TEMP_WARNING_THRESHOLD: float = 80.0     # °C
    TEMP_CRITICAL_THRESHOLD: float = 92.0    # °C
    VIB_WARNING_THRESHOLD: float = 4.2       # mm/s
    VIB_CRITICAL_THRESHOLD: float = 6.5      # mm/s
    PRESS_MIN_THRESHOLD: float = 2.5         # bar
    PRESS_MAX_THRESHOLD: float = 7.5         # bar
    CURRENT_WARNING_THRESHOLD: float = 22.0  # A
    CURRENT_CRITICAL_THRESHOLD: float = 28.0 # A
    VOLTAGE_MIN_THRESHOLD: float = 370.0     # V
    VOLTAGE_MAX_THRESHOLD: float = 430.0     # V

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
