from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any, Literal

SupportedLanguage = Literal[
    "en",
    "hi",
    "bn",
    "pa",
    "ta",
    "mr",
    "te",
    "ml",
    "kn",
    "or",
    "gu"
]

class CropRecommendationRequest(BaseModel):
    # Core crop recommendation & soil macronutrient parameters
    nitrogen: float = Field(..., ge=0.0, le=300.0, description="Nitrogen content in soil (N)")
    phosphorus: float = Field(..., ge=0.0, le=300.0, description="Phosphorus content in soil (P)")
    potassium: float = Field(..., ge=0.0, le=300.0, description="Potassium content in soil (K)")
    temperature: float = Field(..., ge=-10.0, le=60.0, description="Temperature in degree Celsius")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in percentage")
    ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH value (0-14)")
    rainfall: float = Field(..., ge=0.0, le=1000.0, description="Rainfall in mm")

    language: SupportedLanguage = Field(
        default="en",
        description="Language for the user-facing response"
    )

    # Optional secondary soil quality indicators
    ec: Optional[float] = Field(None, ge=0.0, le=20.0, description="Electrical Conductivity in dS/m")
    oc: Optional[float] = Field(None, ge=0.0, le=20.0, description="Organic Carbon in percentage")
    caco3: Optional[float] = Field(None, ge=0.0, le=100.0, description="Calcium Carbonate / Free Lime in percentage")

    @model_validator(mode='before')
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map N, P, K, pH aliases
            if 'N' in data and 'nitrogen' not in data:
                data['nitrogen'] = data['N']
            if 'P' in data and 'phosphorus' not in data:
                data['phosphorus'] = data['P']
            if 'K' in data and 'potassium' not in data:
                data['potassium'] = data['K']
            if 'pH' in data and 'ph' not in data:
                data['ph'] = data['pH']
            # Map EC, OC, CaCO3 aliases
            if 'EC' in data and 'ec' not in data:
                data['ec'] = data['EC']
            if 'OC' in data and 'oc' not in data:
                data['oc'] = data['OC']
            if 'CaCO3' in data and 'caco3' not in data:
                data['caco3'] = data['CaCO3']
            elif 'caco_3' in data and 'caco3' not in data:
                data['caco3'] = data['caco_3']
        return data

class SoilAnalysisRequest(BaseModel):
    # Core soil macronutrients & chemical metrics (required)
    nitrogen: float = Field(..., ge=0.0, le=300.0, description="Nitrogen content in soil (N) in kg/ha")
    phosphorus: float = Field(..., ge=0.0, le=300.0, description="Phosphorus content in soil (P) in kg/ha")
    potassium: float = Field(..., ge=0.0, le=300.0, description="Potassium content in soil (K) in kg/ha")
    ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH value (0-14)")

    language: SupportedLanguage = Field(
        default="en",
        description="Language for the user-facing response"
    )

    # Optional secondary soil quality indicators
    ec: Optional[float] = Field(None, ge=0.0, le=20.0, description="Electrical Conductivity in dS/m")
    oc: Optional[float] = Field(None, ge=0.0, le=20.0, description="Organic Carbon in percentage")
    caco3: Optional[float] = Field(None, ge=0.0, le=100.0, description="Calcium Carbonate / Free Lime in percentage")

    @model_validator(mode='before')
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map N, P, K, pH aliases
            if 'N' in data and 'nitrogen' not in data:
                data['nitrogen'] = data['N']
            if 'P' in data and 'phosphorus' not in data:
                data['phosphorus'] = data['P']
            if 'K' in data and 'potassium' not in data:
                data['potassium'] = data['K']
            if 'pH' in data and 'ph' not in data:
                data['ph'] = data['pH']
            # Map EC, OC, CaCO3 aliases
            if 'EC' in data and 'ec' not in data:
                data['ec'] = data['EC']
            if 'OC' in data and 'oc' not in data:
                data['oc'] = data['OC']
            if 'CaCO3' in data and 'caco3' not in data:
                data['caco3'] = data['CaCO3']
            elif 'caco_3' in data and 'caco3' not in data:
                data['caco3'] = data['caco_3']
        return data

class AlternativeCrop(BaseModel):
    crop: str
    confidence_pct: float

class PredictionResult(BaseModel):
    recommended_crop: str
    confidence_pct: float
    confidence_tier: str  # High, Moderate, Low
    top_alternatives: List[AlternativeCrop] = Field(default_factory=list)

class NutrientStatus(BaseModel):
    input_value: float
    unit: str = ""
    dataset_median: float
    dataset_range: List[float]
    relative_level: str  # In Lower Quartile, Within Interquartile Mid-Range, In Upper Quartile
    interpretation: str  # Farmer-friendly advisory explanation
    status_badge: str    # Optimal, Moderate, Attention Needed

class NPKBalanceInfo(BaseModel):
    ratio_string: str
    balance_status: str
    interpretation: str

class SoilHealthScore(BaseModel):
    score: int  # 0 to 100
    rating: str  # Optimal, Moderate, Needs Attention
    summary: str
    score_breakdown: Dict[str, int]

class SoilAdvisoryResponse(BaseModel):
    disclaimer: str
    parameters_analyzed: Dict[str, NutrientStatus]
    soil_health_score: SoilHealthScore
    npk_balance: NPKBalanceInfo
    soil_summary: str
    key_observations: List[str]
    risk_flags: List[str] = Field(default_factory=list)

class CropRecommendationResponse(BaseModel):
    status: str = "success"
    prediction: PredictionResult
    input_received: Dict[str, float]

class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    version: str
    model_loaded: bool
    model_details: Optional[Dict[str, Any]] = None

