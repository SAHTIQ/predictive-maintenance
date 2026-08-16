"""
Prediction & History Routes
SPDX-License-Identifier: MIT
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.prediction import (
    PredictionRequest, PredictionResponse,
    PredictionHistoryResponse, PredictionHistoryItem
)
from backend.app.services.prediction_service import prediction_service
from backend.app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.post("", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def run_prediction(payload: PredictionRequest, db: Session = Depends(get_db)):
    """Executes 3-layer diagnostic prediction and saves result."""
    return prediction_service.run_prediction(payload, db=db, persist=True)

# Also expose POST /api/predict for direct convenience
predict_alias_router = APIRouter(tags=["Predictions"])

@predict_alias_router.post("/api/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def run_predict_alias(payload: PredictionRequest, db: Session = Depends(get_db)):
    """Alias for /api/predictions for direct API compliance."""
    return prediction_service.run_prediction(payload, db=db, persist=True)

@router.get("/recent", response_model=list[PredictionHistoryItem])
def get_recent_predictions(
    limit: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return analytics_service.get_recent_predictions(db, limit=limit)

@router.get("/history/{machine_id}", response_model=PredictionHistoryResponse)
def get_machine_prediction_history(
    machine_id: str,
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None, description="Filter by status (Healthy/Warning/Critical)"),
    db: Session = Depends(get_db)
):
    total, items = analytics_service.get_machine_history(
        db, machine_id=machine_id, limit=limit, status_filter=status
    )
    return PredictionHistoryResponse(total=total, items=items)

@router.get("/history", response_model=PredictionHistoryResponse)
def get_all_prediction_history(
    machine_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    if machine_id:
        total, items = analytics_service.get_machine_history(
            db, machine_id=machine_id, limit=limit, status_filter=status
        )
    else:
        items = analytics_service.get_recent_predictions(db, limit=limit)
        total = len(items)
    return PredictionHistoryResponse(total=total, items=items)
