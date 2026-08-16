"""
Health Check Routes
SPDX-License-Identifier: MIT
"""

from datetime import datetime
from fastapi import APIRouter
from backend.app.config import settings
from backend.app.ml.model_loader import model_loader

router = APIRouter(tags=["Health"])

@router.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "ml_model_loaded": model_loader.rf_model is not None,
        "anomaly_model_loaded": model_loader.iso_forest is not None
    }
