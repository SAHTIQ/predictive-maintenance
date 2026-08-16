"""
Prediction & Explainability Pydantic Schemas
SPDX-License-Identifier: MIT
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    machine_id: str = Field(..., description="Target machine identifier")
    temperature: float = Field(..., description="Temperature in °C")
    vibration: float = Field(..., description="Vibration velocity in mm/s")
    pressure: float = Field(..., description="Pressure in bar")
    voltage: float = Field(..., description="Supply voltage in Volts")
    current: float = Field(..., description="Current consumption in Amperes")
    rpm: float = Field(..., description="Rotational speed in RPM")
    operating_hours: float = Field(..., description="Cumulative operating runtime in hours")

class RuleViolation(BaseModel):
    parameter: str
    observed_value: float
    threshold: float
    severity: str
    message: str

class MLPredictionResult(BaseModel):
    prediction: str
    confidence: float
    probabilities: dict[str, float]

class RulePredictionResult(BaseModel):
    prediction: str
    violations: list[RuleViolation]

class AnomalyPredictionResult(BaseModel):
    prediction: str
    anomaly_score: float
    is_anomaly: bool

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    machine_id: str
    overall_status: str = Field(..., description="Healthy | Warning | Critical")
    risk_level: str = Field(..., description="Low | Medium | High | Critical")
    
    # 3 Layers
    ml_result: MLPredictionResult
    rule_result: RulePredictionResult
    anomaly_result: AnomalyPredictionResult

    # Explainability & Recommendations
    detected_factors: list[str]
    explanation: str
    recommended_action: str

    input_features: dict[str, float]
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionHistoryItem(BaseModel):
    id: int
    machine_id: str
    ml_prediction: str
    ml_confidence: float
    rule_prediction: str
    rule_violations: list[Any] = []
    anomaly_prediction: str
    anomaly_score: float
    overall_status: str
    risk_level: str
    explanation: str
    recommended_action: str
    input_features: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionHistoryResponse(BaseModel):
    total: int
    items: list[PredictionHistoryItem]
