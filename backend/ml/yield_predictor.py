import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from fastapi import HTTPException, status

from pathlib import Path
from .yield_schema import (
    YieldPredictionRequest,
    YieldPredictionResponse,
)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
YIELD_MODEL_PATH = ARTIFACTS_DIR / "yield_prediction_model.joblib"
YIELD_METADATA_PATH = ARTIFACTS_DIR / "yield_model_metadata.json"

logger = logging.getLogger("krishimitra.yield_predictor")

class YieldPredictor:
    """Service to load trained Yield Prediction pipeline artifact and execute inferences."""

    def __init__(self):
        self.pipeline: Optional[Any] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.feature_names: List[str] = [
            'Year', 'State', 'Crop', 'Season', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide'
        ]
        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Loads model pipeline and metadata artifacts from disk."""
        model_path = YIELD_MODEL_PATH
        metadata_path = YIELD_METADATA_PATH 

        try:
            if model_path.exists():
                self.pipeline = joblib.load(model_path)
                logger.info(f"Loaded Yield Prediction ML pipeline from {model_path}")
            else:
                logger.warning(f"Yield model artifact not found at {model_path}")

            if metadata_path.exists():
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded Yield ML metadata from {metadata_path}")
            else:
                logger.warning(f"Yield metadata artifact not found at {metadata_path}")
        except Exception as e:
            logger.error(f"Error loading yield model artifacts: {e}", exc_info=True)
            self.pipeline = None
            self.metadata = None

    def is_loaded(self) -> bool:
        return self.pipeline is not None

    def get_model_details(self) -> Optional[Dict[str, Any]]:
        if not self.is_loaded():
            return None
        return {
            "model_type": self.metadata.get("model_type", "RandomForestRegressor") if self.metadata else "RandomForestRegressor",
            "features": self.feature_names,
            "trained_at": self.metadata.get("trained_at") if self.metadata else None,
            "metrics": self.metadata.get("metrics") if self.metadata else None,
            "notes": self.metadata.get("dataset_notes") if self.metadata else None,
        }

    def predict(self, req: YieldPredictionRequest) -> YieldPredictionResponse:
        """Runs yield inference on validated request parameters."""
        if not self.is_loaded():
            self._load_artifacts()
            if not self.is_loaded():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Yield Prediction ML model artifact is not loaded. Please ensure the model is trained."
                )

        # Standardize strings to match dataset casing
        crop_clean = req.crop.strip()
        state_clean = req.state.strip()
        season_clean = req.season.strip()

        # Input dataframe matching training column names and ordering
        input_data = pd.DataFrame([{
            'Year': int(req.year),
            'State': state_clean,
            'Crop': crop_clean,
            'Season': season_clean,
            'Area': float(req.area),
            'Annual_Rainfall': float(req.annual_rainfall),
            'Fertilizer': float(req.fertilizer),
            'Pesticide': float(req.pesticide),
        }], columns=self.feature_names)

        try:
            raw_prediction = float(self.pipeline.predict(input_data)[0])
            # Yield cannot be negative in agricultural domain
            predicted_yield = max(0.0, round(raw_prediction, 4))

            # Unit differentiation: Coconut is recorded in nuts/hectare; all other crops in tonnes/hectare
            is_coconut = crop_clean.lower() == "coconut"
            unit = "nuts/hectare" if is_coconut else "tonnes/hectare"

            model_info = {
                "model_type": "RandomForestRegressor",
                "metrics": self.metadata.get("metrics") if self.metadata else None,
            }

            return YieldPredictionResponse(
                success=True,
                predicted_yield=predicted_yield,
                unit=unit,
                crop=crop_clean,
                state=state_clean,
                season=season_clean,
                area=float(req.area),
                model_info=model_info,
            )
        except Exception as e:
            logger.error(f"Inference error during yield prediction: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Yield prediction inference failed: {str(e)}"
            )

# Global singleton instance
yield_predictor = YieldPredictor()
