"""
Singleton Machine Learning Model & Artifact Loader
SPDX-License-Identifier: MIT
"""

import os
import joblib
from backend.app.config import settings
from backend.app.utils.logger import logger

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._rf_model = None
            cls._instance._scaler = None
            cls._instance._iso_forest = None
            cls._instance._load_models()
        return cls._instance

    def _load_models(self):
        # 1. Random Forest Classifier
        if os.path.exists(settings.ML_MODEL_PATH):
            try:
                self._rf_model = joblib.load(settings.ML_MODEL_PATH)
                logger.info(f"Loaded ML model from: {settings.ML_MODEL_PATH}")
            except Exception as e:
                logger.error(f"Failed to load ML model from {settings.ML_MODEL_PATH}: {e}")
        else:
            logger.warning(f"ML model file not found at {settings.ML_MODEL_PATH}. Will use heuristic fallback if not trained.")

        # 2. Scaler
        if os.path.exists(settings.ML_SCALER_PATH):
            try:
                self._scaler = joblib.load(settings.ML_SCALER_PATH)
                logger.info(f"Loaded Scaler from: {settings.ML_SCALER_PATH}")
            except Exception as e:
                logger.error(f"Failed to load Scaler: {e}")

        # 3. Isolation Forest
        if os.path.exists(settings.ML_ANOMALY_MODEL_PATH):
            try:
                self._iso_forest = joblib.load(settings.ML_ANOMALY_MODEL_PATH)
                logger.info(f"Loaded Isolation Forest from: {settings.ML_ANOMALY_MODEL_PATH}")
            except Exception as e:
                logger.error(f"Failed to load Isolation Forest: {e}")

    @property
    def rf_model(self):
        if self._rf_model is None:
            self._load_models()
        return self._rf_model

    @property
    def scaler(self):
        if self._scaler is None:
            self._load_models()
        return self._scaler

    @property
    def iso_forest(self):
        if self._iso_forest is None:
            self._load_models()
        return self._iso_forest

    def reload(self):
        self._load_models()

model_loader = ModelLoader()
