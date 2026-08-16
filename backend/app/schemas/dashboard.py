"""
Dashboard & Analytics Schemas
SPDX-License-Identifier: MIT
"""

from datetime import datetime
from pydantic import BaseModel
from backend.app.schemas.prediction import PredictionHistoryItem

class DashboardStats(BaseModel):
    total_machines: int
    healthy_machines: int
    warning_machines: int
    critical_machines: int
    inactive_machines: int
    anomalies_detected_today: int
    predictions_today: int
    fleet_health_score: float

class HealthDistribution(BaseModel):
    healthy: int
    warning: int
    critical: int
    inactive: int

class MaintenanceAlert(BaseModel):
    machine_id: str
    machine_name: str
    machine_type: str
    location: str
    status: str
    risk_level: str
    primary_issue: str
    last_prediction_date: datetime

class FleetAnalyticsOverview(BaseModel):
    health_distribution: HealthDistribution
    top_at_risk_machines: list[MaintenanceAlert]
    recent_predictions: list[PredictionHistoryItem]
    fleet_health_score: float
    total_sensor_readings: int
