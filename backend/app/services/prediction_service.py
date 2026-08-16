"""
Prediction & Explainability Service
SPDX-License-Identifier: MIT

Deterministic 3-layer aggregation engine:
Layer 1 (ML Classification) + Layer 2 (Industrial Rules) + Layer 3 (Anomaly Isolation Forest)
-> Aggregated Health Decision, Root-Cause Explainability, and Recommended Actions.
Persists telemetry and audit logs to the database.
"""

from datetime import datetime
from sqlalchemy.orm import Session

from backend.app.database import PredictionModel, SensorReadingModel, MachineModel
from backend.app.schemas.prediction import (
    PredictionRequest, PredictionResponse,
    MLPredictionResult, RulePredictionResult, AnomalyPredictionResult
)
from backend.app.ml.predictor import ml_predictor
from backend.app.rules.maintenance_rules import rule_engine
from backend.app.services.anomaly_service import anomaly_service
from backend.app.utils.logger import logger

class PredictionService:
    @staticmethod
    def run_prediction(
        payload: PredictionRequest,
        db: Session,
        persist: bool = True
    ) -> PredictionResponse:
        features = {
            "temperature": payload.temperature,
            "vibration": payload.vibration,
            "pressure": payload.pressure,
            "voltage": payload.voltage,
            "current": payload.current,
            "rpm": payload.rpm,
            "operating_hours": payload.operating_hours
        }

        # 1. Execute ML Classification Layer
        ml_res: MLPredictionResult = ml_predictor.predict(features)

        # 2. Execute Rule-Based Threshold Layer
        rule_res: RulePredictionResult = rule_engine.evaluate(features)

        # 3. Execute Anomaly Detection Layer
        anom_res: AnomalyPredictionResult = anomaly_service.detect_anomaly(features)

        # 4. Deterministic Aggregation Strategy
        # Priority: Critical ML or Critical Rule -> Critical
        # If Anomaly detected with Warning ML/Rule -> Escalate to Warning or Critical
        overall_status = "Healthy"
        risk_level = "Low"

        is_ml_crit = ml_res.prediction == "Critical"
        is_rule_crit = rule_res.prediction == "Critical"
        is_ml_warn = ml_res.prediction == "Warning"
        is_rule_warn = rule_res.prediction == "Warning"
        is_anomaly = anom_res.is_anomaly

        if is_ml_crit or is_rule_crit:
            overall_status = "Critical"
            risk_level = "Critical" if (is_ml_crit and is_rule_crit) else "High"
        elif is_ml_warn or is_rule_warn or is_anomaly:
            overall_status = "Warning"
            risk_level = "High" if (is_anomaly and (is_ml_warn or is_rule_warn)) else "Medium"
        else:
            overall_status = "Healthy"
            risk_level = "Low"

        # 5. Formulate Human-Readable Explainability & Factors
        detected_factors: list[str] = []
        
        for viol in rule_res.violations:
            detected_factors.append(viol.message)

        if is_anomaly:
            detected_factors.append(
                f"Multivariate sensor anomaly detected by Isolation Forest (anomaly score: {anom_res.anomaly_score:.2f})"
            )

        if ml_res.confidence >= 0.70:
            detected_factors.append(
                f"ML model classified state as '{ml_res.prediction}' with {ml_res.confidence * 100:.1f}% confidence"
            )

        if not detected_factors:
            detected_factors.append("All physical parameters within nominal manufacturer operating baseline.")

        # Explanation narrative
        if overall_status == "Critical":
            explanation = (
                f"Severe machine degradation detected on {payload.machine_id}. "
                f"ML classifier evaluated state as {ml_res.prediction} while rule engine identified {len(rule_res.violations)} boundary violation(s). "
                f"Immediate mechanical intervention required to prevent catastrophic component failure."
            )
            recommended_action = (
                "Immediately halt non-critical operation. Dispatch maintenance technician for physical bearing, "
                "hydraulic line, and electrical diagnostic inspection."
            )
        elif overall_status == "Warning":
            explanation = (
                f"Elevated stress parameters detected on {payload.machine_id}. "
                f"{'Anomaly pattern detected. ' if is_anomaly else ''}"
                f"Sensor telemetry is trending outside optimal thresholds."
            )
            recommended_action = (
                "Schedule preventative inspection within 48 hours. Monitor thermal and vibration trends closely."
            )
        else:
            explanation = (
                f"Machine {payload.machine_id} is operating within nominal specifications. "
                "No adverse vibration, thermal, or electrical abnormalities observed."
            )
            recommended_action = "Continue normal operations. Proceed with standard scheduled maintenance cycle."

        # 6. Database Persistence
        db_id = None
        now = datetime.utcnow()

        if persist:
            try:
                # Ensure machine exists or auto-register if missing
                mach = db.query(MachineModel).filter(MachineModel.machine_id == payload.machine_id).first()
                if not mach:
                    mach = MachineModel(
                        machine_id=payload.machine_id,
                        name=f"Machine {payload.machine_id}",
                        type="General Industrial Unit",
                        location="Facility Floor",
                        operating_hours=payload.operating_hours,
                        active=True
                    )
                    db.add(mach)
                    db.flush()
                else:
                    mach.operating_hours = max(mach.operating_hours, payload.operating_hours)
                    mach.updated_at = now

                # Store sensor telemetry point
                sensor_record = SensorReadingModel(
                    machine_id=payload.machine_id,
                    temperature=payload.temperature,
                    vibration=payload.vibration,
                    pressure=payload.pressure,
                    voltage=payload.voltage,
                    current=payload.current,
                    rpm=payload.rpm,
                    operating_hours=payload.operating_hours,
                    recorded_at=now
                )
                db.add(sensor_record)

                # Store prediction record
                rule_viols_json = [v.model_dump() for v in rule_res.violations]
                pred_record = PredictionModel(
                    machine_id=payload.machine_id,
                    ml_prediction=ml_res.prediction,
                    ml_confidence=ml_res.confidence,
                    rule_prediction=rule_res.prediction,
                    rule_violations=rule_viols_json,
                    anomaly_prediction=anom_res.prediction,
                    anomaly_score=anom_res.anomaly_score,
                    overall_status=overall_status,
                    risk_level=risk_level,
                    explanation=explanation,
                    recommended_action=recommended_action,
                    input_features=features,
                    created_at=now
                )
                db.add(pred_record)
                db.commit()
                db.refresh(pred_record)
                db_id = pred_record.id
            except Exception as e:
                db.rollback()
                logger.error(f"Failed to persist prediction to database: {e}")

        return PredictionResponse(
            id=db_id,
            machine_id=payload.machine_id,
            overall_status=overall_status,
            risk_level=risk_level,
            ml_result=ml_res,
            rule_result=rule_res,
            anomaly_result=anom_res,
            detected_factors=detected_factors,
            explanation=explanation,
            recommended_action=recommended_action,
            input_features=features,
            created_at=now
        )

prediction_service = PredictionService()
