"""
Anomaly Detection Service (Layer 3)
SPDX-License-Identifier: MIT

Runs unsupervised Isolation Forest inference to detect multivariate sensor outliers
and unusual machine operational degradation signatures.
"""

from backend.app.ml.model_loader import model_loader
from backend.app.ml.feature_processor import feature_processor
from backend.app.schemas.prediction import AnomalyPredictionResult
from backend.app.utils.logger import logger

class AnomalyService:
    @staticmethod
    def detect_anomaly(features: dict[str, float]) -> AnomalyPredictionResult:
        iso_model = model_loader.iso_forest
        raw_vec = feature_processor.extract_vector(features)
        scaled_vec = feature_processor.scale_vector(raw_vec)

        if iso_model is not None:
            try:
                # 1 = inlier (Normal), -1 = outlier (Anomaly)
                raw_pred = iso_model.predict(scaled_vec)[0]
                # Decision function: lower values mean more abnormal
                score = float(iso_model.decision_function(scaled_vec)[0])
                
                # Normalize score roughly to 0.0 (extreme anomaly) to 1.0 (normal)
                # Raw decision function is typically centered around 0 (-0.3 to +0.3)
                norm_score = round(float(1.0 / (1.0 + 2.71828 ** (-score * 5))), 3)
                is_anomaly = (raw_pred == -1)

                return AnomalyPredictionResult(
                    prediction="Anomaly" if is_anomaly else "Normal",
                    anomaly_score=norm_score,
                    is_anomaly=is_anomaly
                )
            except Exception as e:
                logger.error(f"Isolation Forest inference error: {e}")

        # Fallback anomaly detection heuristics
        temp = features.get("temperature", 60.0)
        vib = features.get("vibration", 2.0)
        volt = features.get("voltage", 400.0)
        curr = features.get("current", 15.0)

        is_anom = (temp > 88.0 and vib > 5.0) or (volt < 365.0 and curr > 25.0) or (vib > 7.0)
        score = 0.22 if is_anom else 0.88

        return AnomalyPredictionResult(
            prediction="Anomaly" if is_anom else "Normal",
            anomaly_score=score,
            is_anomaly=is_anom
        )

anomaly_service = AnomalyService()
