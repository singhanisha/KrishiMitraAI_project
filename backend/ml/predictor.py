import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from fastapi import HTTPException, status

from pathlib import Path
from .crop_schema import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    PredictionResult,
    AlternativeCrop,
)

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "crop_rf_model.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"

logger = logging.getLogger("krishimitra.predictor")

class CropPredictor:
    """Service to load trained model artifacts and execute crop recommendation inferences."""
    
    def __init__(self):
        self.model: Optional[Any] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.classes_: Optional[List[str]] = None
        self.feature_names: List[str] = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Loads model and metadata artifacts if present on disk."""
        model_path = MODEL_PATH
        metadata_path = METADATA_PATH

        try:
            if model_path.exists():
                self.model = joblib.load(model_path)
                if hasattr(self.model, "classes_"):
                    self.classes_ = list(self.model.classes_)
                logger.info(f"Loaded ML model from {model_path}")
            else:
                logger.warning(f"Model artifact not found at {model_path}")

            if metadata_path.exists():
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded ML metadata from {metadata_path}")
            else:
                logger.warning(f"Metadata artifact not found at {metadata_path}")
        except Exception as e:
            logger.error(f"Error loading model artifacts: {e}", exc_info=True)
            self.model = None
            self.metadata = None

    def is_loaded(self) -> bool:
        return self.model is not None

    def get_model_details(self) -> Optional[Dict[str, Any]]:
        if not self.is_loaded():
            return None
        return {
            "model_type": self.metadata.get("model_type", "RandomForestClassifier") if self.metadata else "RandomForestClassifier",
            "features": self.feature_names,
            "classes_count": len(self.classes_) if self.classes_ else 0,
            "trained_at": self.metadata.get("trained_at") if self.metadata else None,
            "metrics": self.metadata.get("metrics") if self.metadata else None
        }

    def predict(self, req: CropRecommendationRequest) -> CropRecommendationResponse:
        """Runs inference on validated soil & climate request parameters."""
        if not self.is_loaded():
            self._load_artifacts()
            if not self.is_loaded():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Machine learning model artifact is not loaded or unavailable. Please ensure the model is trained."
                )

        # Feature dataframe with exact model column naming
        input_data = pd.DataFrame([{
            'N': float(req.nitrogen),
            'P': float(req.phosphorus),
            'K': float(req.potassium),
            'temperature': float(req.temperature),
            'humidity': float(req.humidity),
            'ph': float(req.ph),
            'rainfall': float(req.rainfall)
        }], columns=self.feature_names)

        try:
            # Predict probabilities
            probabilities = self.model.predict_proba(input_data)[0]
            classes = self.classes_ if self.classes_ is not None else list(self.model.classes_)

            # Sort classes by probability in descending order
            sorted_indices = np.argsort(probabilities)[::-1]
            
            top_class_idx = sorted_indices[0]
            top_crop = str(classes[top_class_idx])
            top_prob = float(probabilities[top_class_idx])
            confidence_pct = round(top_prob * 100.0, 2)

            # Assign confidence tier
            if confidence_pct >= 75.0:
                confidence_tier = "High"
            elif confidence_pct >= 40.0:
                confidence_tier = "Moderate"
            else:
                confidence_tier = "Low"

            # Extract alternative recommendations (up to 3 non-zero alternatives)
            top_alternatives: List[AlternativeCrop] = []
            for idx in sorted_indices[1:]:
                alt_prob = float(probabilities[idx])
                alt_pct = round(alt_prob * 100.0, 2)
                if alt_pct > 0.0 and len(top_alternatives) < 3:
                    top_alternatives.append(
                        AlternativeCrop(
                            crop=str(classes[idx]),
                            confidence_pct=alt_pct
                        )
                    )

            prediction_result = PredictionResult(
                recommended_crop=top_crop,
                confidence_pct=confidence_pct,
                confidence_tier=confidence_tier,
                top_alternatives=top_alternatives
            )

            input_dict = {
                "nitrogen": float(req.nitrogen),
                "phosphorus": float(req.phosphorus),
                "potassium": float(req.potassium),
                "temperature": float(req.temperature),
                "humidity": float(req.humidity),
                "ph": float(req.ph),
                "rainfall": float(req.rainfall)
            }
            if req.ec is not None:
                input_dict["ec"] = float(req.ec)
            if req.oc is not None:
                input_dict["oc"] = float(req.oc)
            if req.caco3 is not None:
                input_dict["caco3"] = float(req.caco3)

            return CropRecommendationResponse(
                status="success",
                prediction=prediction_result,
                input_received=input_dict
            )
        except Exception as e:
            logger.error(f"Inference execution error: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Inference failed during model evaluation: {str(e)}"
            )

# Global singleton predictor instance
crop_predictor = CropPredictor()
