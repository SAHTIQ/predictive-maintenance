"""
Machine Learning Classifier Predictor (Layer 1)
SPDX-License-Identifier: MIT

Runs supervised classification inference using the loaded Random Forest model.
Returns health classification and probability confidence distribution.
"""

from backend.app.ml.model_loader import model_loader
from backend.app.ml.feature_processor import feature_processor
from backend.app.schemas.prediction import MLPredictionResult
from backend.app.utils.logger import logger

class MLPredictor:
    @staticmethod
    def predict(features: dict[str, float]) -> MLPredictionResult:
        model = model_loader.rf_model
        raw_vec = feature_processor.extract_vector(features)
        scaled_vec = feature_processor.scale_vector(raw_vec)

        if model is not None:
            try:
                pred_label = str(model.predict(scaled_vec)[0])
                prob_array = model.predict_proba(scaled_vec)[0]
                classes = list(model.classes_)
                
                probs = {cls_name: round(float(prob_array[idx]), 3) for idx, cls_name in enumerate(classes)}
                confidence = float(max(prob_array))

                return MLPredictionResult(
                    prediction=pred_label,
                    confidence=round(confidence, 3),
                    probabilities=probs
                )
            except Exception as e:
                logger.error(f"ML Model inference error: {e}. Using fallback rule logic.")

        # Heuristic fallback if model artifact is absent
        temp = features.get("temperature", 60.0)
        vib = features.get("vibration", 2.0)
        if temp > 90 or vib > 6.0:
            pred = "Critical"
            conf = 0.85
            probs = {"Healthy": 0.05, "Warning": 0.10, "Critical": 0.85}
        elif temp > 78 or vib > 3.8:
            pred = "Warning"
            conf = 0.78
            probs = {"Healthy": 0.12, "Warning": 0.78, "Critical": 0.10}
        else:
            pred = "Healthy"
            conf = 0.92
            probs = {"Healthy": 0.92, "Warning": 0.06, "Critical": 0.02}

        return MLPredictionResult(
            prediction=pred,
            confidence=conf,
            probabilities=probs
        )

ml_predictor = MLPredictor()
