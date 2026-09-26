from ml.predictor import crop_predictor
from ml.crop_schema import CropRecommendationRequest

print("Model loaded:", crop_predictor.is_loaded())
print("Model details:", crop_predictor.get_model_details())

# Sample soil/climate values (Rice-jaisi conditions)
sample_request = CropRecommendationRequest(
    nitrogen=90,
    phosphorus=42,
    potassium=43,
    temperature=25.5,
    humidity=82.0,
    ph=6.5,
    rainfall=200.0
)

result = crop_predictor.predict(sample_request)
print("\n--- Prediction Result ---")
print("Recommended Crop:", result.prediction.recommended_crop)
print("Confidence:", result.prediction.confidence_pct, "%")
print("Confidence Tier:", result.prediction.confidence_tier)
print("Top Alternatives:", result.prediction.top_alternatives)