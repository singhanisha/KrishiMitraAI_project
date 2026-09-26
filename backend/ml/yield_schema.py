from pydantic import BaseModel, Field, model_validator
from typing import Optional, Dict, Any

class YieldPredictionRequest(BaseModel):
    year: int = Field(..., ge=1990, le=2035, description="Cropping harvest year (e.g., 2024)")
    state: str = Field(..., min_length=1, max_length=100, description="Indian State / Union Territory")
    crop: str = Field(..., min_length=1, max_length=100, description="Crop name (e.g., Wheat, Rice, Sugarcane, Coconut)")
    season: str = Field(..., min_length=1, max_length=50, description="Cultivation season (e.g., Kharif, Rabi, Whole Year)")
    area: float = Field(..., gt=0.0, description="Cultivation area in hectares")
    annual_rainfall: float = Field(..., ge=0.0, description="Annual rainfall in mm")
    fertilizer: float = Field(..., ge=0.0, description="Total fertilizer used in kg")
    pesticide: float = Field(..., ge=0.0, description="Total pesticide used in kg")

    @model_validator(mode='before')
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Support PascalCase / alternate casing from raw datasets
            aliases = {
                'Year': 'year',
                'State': 'state',
                'Crop': 'crop',
                'Season': 'season',
                'Area': 'area',
                'Annual_Rainfall': 'annual_rainfall',
                'annualRainfall': 'annual_rainfall',
                'rainfall': 'annual_rainfall',
                'Fertilizer': 'fertilizer',
                'Pesticide': 'pesticide',
            }
            for source_key, target_key in aliases.items():
                if source_key in data and target_key not in data:
                    data[target_key] = data[source_key]
        return data

class YieldPredictionResponse(BaseModel):
    success: bool = Field(True, description="Whether inference completed successfully")
    predicted_yield: float = Field(..., description="Predicted yield per unit area (tonnes/ha or nuts/ha)")
    unit: str = Field(..., description="Measurement unit (tonnes/hectare or nuts/hectare for Coconut)")
    crop: str = Field(..., description="Crop evaluated")
    state: str = Field(..., description="State evaluated")
    season: str = Field(..., description="Season evaluated")
    area: float = Field(..., description="Cultivated area in hectares")
    model_info: Optional[Dict[str, Any]] = Field(None, description="Metadata regarding model architecture and evaluation")
