from pathlib import Path
import io
import json

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from fastapi import APIRouter, UploadFile, File, HTTPException


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/disease",
    tags=["Disease Detection"]
)


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = PROJECT_ROOT / "backend" / "model"

MODEL_PATH = MODEL_DIR / "best_model.pth"
CLASSES_PATH = MODEL_DIR / "classes.json"


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Disease Detection Device: {DEVICE}")


# ============================================================
# TRANSFORM
# ============================================================

IMAGE_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# MODEL
# ============================================================

_model = None
_class_names = None


def load_classes():
    global _class_names

    if _class_names is not None:
        return _class_names

    if not CLASSES_PATH.exists():
        raise FileNotFoundError(
            f"Classes file not found: {CLASSES_PATH}"
        )

    with open(CLASSES_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Expected format:
    # ["Cashew_anthracnose", "Cashew_gumosis", ...]

    if isinstance(data, list):
        _class_names = data

    elif isinstance(data, dict):
        # Handles {"0": "class1", "1": "class2", ...}
        _class_names = list(data.values())

    else:
        raise ValueError(
            "Invalid classes.json format."
        )

    return _class_names


def load_model():
    global _model

    if _model is not None:
        return _model

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}"
        )

    class_names = load_classes()

    num_classes = len(class_names)

    # EfficientNet-B0 architecture
    model = models.efficientnet_b0(weights=None)

    model.classifier[1] = nn.Linear(
        model.classifier[1].in_features,
        num_classes
    )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    # Supports both:
    # torch.save(model.state_dict(), ...)
    # and
    # torch.save({"model_state_dict": ...}, ...)

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    model.load_state_dict(state_dict)

    model.to(DEVICE)
    model.eval()

    _model = model

    print("Disease detection model loaded successfully.")
    print(f"Classes: {num_classes}")

    return _model


# ============================================================
# IMAGE PREDICTION
# ============================================================

def predict_image(image: Image.Image):

    model = load_model()
    class_names = load_classes()

    image = image.convert("RGB")

    tensor = IMAGE_TRANSFORM(image)

    tensor = tensor.unsqueeze(0)

    tensor = tensor.to(DEVICE)

    with torch.no_grad():

        outputs = model(tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

    # Top 3 predictions
    top_probabilities, top_indices = torch.topk(
        probabilities,
        k=min(3, len(class_names)),
        dim=1
    )

    predictions = []

    for probability, index in zip(
        top_probabilities[0],
        top_indices[0]
    ):
        index = index.item()
        confidence = probability.item() * 100

        class_name = class_names[index]

        predictions.append({
            "class_index": index,
            "class_name": class_name,
            "display_name": class_name.replace("_", " "),
            "confidence": round(confidence, 2)
        })

    best_prediction = predictions[0]

    return {
        "prediction": best_prediction["display_name"],
        "class_name": best_prediction["class_name"],
        "class_index": best_prediction["class_index"],
        "confidence": best_prediction["confidence"],
        "top_predictions": predictions
    }


# ============================================================
# API ENDPOINT
# ============================================================

@router.post("/predict")
async def predict_disease(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate file type
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid image format. "
                "Upload JPG, JPEG, PNG, or WEBP."
            )
        )

    # --------------------------------------------------------
    # Read image
    # --------------------------------------------------------

    try:

        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        image = Image.open(
            io.BytesIO(contents)
        )

        # ----------------------------------------------------
        # Predict
        # ----------------------------------------------------

        result = predict_image(image)

        return {
            "success": True,
            "filename": file.filename,
            **result
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "Disease prediction error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process image: {str(e)}"
        )