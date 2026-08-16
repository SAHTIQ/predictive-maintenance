"""
Feature Processor for Predictive Maintenance ML Inference
SPDX-License-Identifier: MIT
"""

import numpy as np
from backend.app.ml.model_loader import model_loader
from backend.app.utils.logger import logger

FEATURE_NAMES = [
    "temperature",
    "vibration",
    "pressure",
    "voltage",
    "current",
    "rpm",
    "operating_hours"
]

class FeatureProcessor:
    @staticmethod
    def extract_vector(features: dict[str, float]) -> np.ndarray:
        """Extracts correctly ordered feature vector from dictionary."""
        vector = []
        for name in FEATURE_NAMES:
            val = float(features.get(name, 0.0))
            vector.append(val)
        return np.array([vector])

    @staticmethod
    def scale_vector(feature_array: np.ndarray) -> np.ndarray:
        """Applies trained StandardScaler transformation if available."""
        scaler = model_loader.scaler
        if scaler is not None:
            try:
                return scaler.transform(feature_array)
            except Exception as e:
                logger.warning(f"Scaling failed: {e}. Passing unscaled features.")
        return feature_array

feature_processor = FeatureProcessor()
