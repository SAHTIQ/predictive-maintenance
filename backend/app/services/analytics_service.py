"""
Analytics & Dashboard Aggregation Service
SPDX-License-Identifier: MIT

Aggregates fleet statistics, health distributions, top at-risk machines, and prediction history.
"""

from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app.database import MachineModel, PredictionModel, SensorReadingModel
from backend.app.schemas.dashboard import (
    DashboardStats, HealthDistribution, MaintenanceAlert, FleetAnalyticsOverview
)
from backend.app.schemas.prediction import PredictionHistoryItem

class AnalyticsService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStats:
        machines = db.query(MachineModel).all()
        total_machines = len(machines)
        inactive_machines = sum(1 for m in machines if not m.active)
        active_machines = [m for m in machines if m.active]

        healthy_count = 0
        warning_count = 0
        critical_count = 0

        # Calculate current health of each active machine
        for m in active_machines:
            latest_pred = db.query(PredictionModel).filter(
                PredictionModel.machine_id == m.machine_id
            ).order_by(desc(PredictionModel.created_at)).first()

            if not latest_pred:
                healthy_count += 1
            elif latest_pred.overall_status == "Critical":
                critical_count += 1
            elif latest_pred.overall_status == "Warning":
                warning_count += 1
            else:
                healthy_count += 1

        # Today's predictions & anomalies
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        predictions_today = db.query(PredictionModel).filter(
            PredictionModel.created_at >= today_start
        ).count()

        anomalies_today = db.query(PredictionModel).filter(
            PredictionModel.created_at >= today_start,
            PredictionModel.anomaly_prediction == "Anomaly"
        ).count()

        # Fleet health index: (Healthy*100 + Warning*50 + Critical*0) / active_machines
        if active_machines:
            fleet_score = round(
                (healthy_count * 100.0 + warning_count * 50.0 + critical_count * 0.0) / len(active_machines),
                1
            )
        else:
            fleet_score = 100.0

        return DashboardStats(
            total_machines=total_machines,
            healthy_machines=healthy_count,
            warning_machines=warning_count,
            critical_machines=critical_count,
            inactive_machines=inactive_machines,
            anomalies_detected_today=anomalies_today,
            predictions_today=predictions_today,
            fleet_health_score=fleet_score
        )

    @staticmethod
    def get_fleet_overview(db: Session) -> FleetAnalyticsOverview:
        stats = AnalyticsService.get_dashboard_stats(db)
        
        # Identify top at-risk machines
        machines = db.query(MachineModel).filter(MachineModel.active == True).all()
        at_risk: list[MaintenanceAlert] = []

        for m in machines:
            latest_pred = db.query(PredictionModel).filter(
                PredictionModel.machine_id == m.machine_id
            ).order_by(desc(PredictionModel.created_at)).first()

            if latest_pred and latest_pred.overall_status in ["Warning", "Critical"]:
                primary_issue = "Multiple operating threshold violations"
                if latest_pred.rule_violations and len(latest_pred.rule_violations) > 0:
                    first_viol = latest_pred.rule_violations[0]
                    if isinstance(first_viol, dict):
                        primary_issue = first_viol.get("message", primary_issue)
                elif latest_pred.anomaly_prediction == "Anomaly":
                    primary_issue = "Multivariate sensor anomaly detected"

                at_risk.append(MaintenanceAlert(
                    machine_id=m.machine_id,
                    machine_name=m.name,
                    machine_type=m.type,
                    location=m.location,
                    status=latest_pred.overall_status,
                    risk_level=latest_pred.risk_level,
                    primary_issue=primary_issue,
                    last_prediction_date=latest_pred.created_at
                ))

        # Sort at-risk machines by Critical first, then Warning
        at_risk.sort(key=lambda x: (0 if x.status == "Critical" else 1, x.last_prediction_date), reverse=False)

        # Recent predictions
        recent_preds = AnalyticsService.get_recent_predictions(db, limit=10)
        total_readings = db.query(SensorReadingModel).count()

        return FleetAnalyticsOverview(
            health_distribution=HealthDistribution(
                healthy=stats.healthy_machines,
                warning=stats.warning_machines,
                critical=stats.critical_machines,
                inactive=stats.inactive_machines
            ),
            top_at_risk_machines=at_risk[:8],
            recent_predictions=recent_preds,
            fleet_health_score=stats.fleet_health_score,
            total_sensor_readings=total_readings
        )

    @staticmethod
    def get_recent_predictions(db: Session, limit: int = 15) -> list[PredictionHistoryItem]:
        preds = db.query(PredictionModel).order_by(
            desc(PredictionModel.created_at)
        ).limit(limit).all()

        results = []
        for p in preds:
            results.append(PredictionHistoryItem(
                id=p.id,
                machine_id=p.machine_id,
                ml_prediction=p.ml_prediction,
                ml_confidence=p.ml_confidence,
                rule_prediction=p.rule_prediction,
                rule_violations=p.rule_violations or [],
                anomaly_prediction=p.anomaly_prediction,
                anomaly_score=p.anomaly_score,
                overall_status=p.overall_status,
                risk_level=p.risk_level,
                explanation=p.explanation,
                recommended_action=p.recommended_action,
                input_features=p.input_features or {},
                created_at=p.created_at
            ))
        return results

    @staticmethod
    def get_machine_history(
        db: Session,
        machine_id: str,
        limit: int = 50,
        status_filter: Optional[str] = None
    ) -> tuple[int, list[PredictionHistoryItem]]:
        query = db.query(PredictionModel).filter(PredictionModel.machine_id == machine_id)

        if status_filter:
            query = query.filter(PredictionModel.overall_status == status_filter)

        total = query.count()
        preds = query.order_by(desc(PredictionModel.created_at)).limit(limit).all()

        items = [
            PredictionHistoryItem(
                id=p.id,
                machine_id=p.machine_id,
                ml_prediction=p.ml_prediction,
                ml_confidence=p.ml_confidence,
                rule_prediction=p.rule_prediction,
                rule_violations=p.rule_violations or [],
                anomaly_prediction=p.anomaly_prediction,
                anomaly_score=p.anomaly_score,
                overall_status=p.overall_status,
                risk_level=p.risk_level,
                explanation=p.explanation,
                recommended_action=p.recommended_action,
                input_features=p.input_features or {},
                created_at=p.created_at
            ) for p in preds
        ]
        return total, items

analytics_service = AnalyticsService()
