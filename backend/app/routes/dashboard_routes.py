"""
Dashboard & Analytics Routes
SPDX-License-Identifier: MIT
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.dashboard import DashboardStats, FleetAnalyticsOverview
from backend.app.services.analytics_service import analytics_service

router = APIRouter(tags=["Dashboard & Analytics"])

@router.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Provides high-level KPI metric counts for the monitoring dashboard."""
    return analytics_service.get_dashboard_stats(db)

@router.get("/api/analytics/overview", response_model=FleetAnalyticsOverview)
def get_fleet_analytics_overview(db: Session = Depends(get_db)):
    """Provides complete fleet health distribution, at-risk ranking, and recent logs."""
    return analytics_service.get_fleet_overview(db)
