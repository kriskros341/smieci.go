import io
import os
from dataclasses import dataclass
from typing import List

import torch
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel


@dataclass
class YOLOv5Results:
    # Predictions for each image as tensor
    # Shape: (num_detections, 6) where each detection is [x1, y1, x2, y2, confidence, class]
    # Example, First element is an image with no detections, second element is an image with one detection
    # [
    #     tensor([], size=(0, 6)),
    #     tensor([[1.36918e+03, 4.86768e+02, 1.41909e+03, 5.34264e+02, 6.31078e-01, 5.00000e+00]])
    # ]
    xyxy: List[torch.Tensor]


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

DETECTION_CONFIDENCE_THRESHOLD = 0.5
model = None


@app.on_event("startup")
async def load_model():
    if os.getenv("HOST") == "localhost":
        if not load_dotenv(override=False):
            print("Error loading .env file")
            exit(1)
    global model
    model_path = "best.pt"
    model = torch.hub.load(
        "ultralytics/yolov5", "custom", path=model_path, force_reload=False
    )
    model.eval()


class ImageProcessRequest(BaseModel):
    files: List[UploadFile]


class ValidationResponse(BaseModel):
    valid: bool
    confidences: List[float]


@app.post("/validate-images", response_model=ValidationResponse)
async def validate_images(
    files: List[UploadFile] = File(...),
):
    """
    Returns true if any image has any trash detected in it with a certain confidence threshold.
    So, if we send 10 images, and 1 of them has trash, it will return true.
    """
    # TODO: add access token for security and add to .env, or docker internal network
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Too many images")
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    imgs = []
    try:
        for file in files:
            content = await file.read()
            img = Image.open(io.BytesIO(content))
            imgs.append(img)
        results: YOLOv5Results = model(imgs)
        images_results = results.xyxy

        detections_found = False
        confidences: list[float] = [0.0 for _ in range(len(files))]
        for i, image_result in enumerate(images_results):
            confidence = 0
            for detection in image_result:
                detection_confidence = detection[4].item()
                confidence = max(confidence, detection_confidence)
                if confidence > DETECTION_CONFIDENCE_THRESHOLD:
                    detections_found = True
            confidences[i] = confidence
        print("l(confidences) == l(files)", len(confidences) == len(files))
        print("detections_found", detections_found, confidences)
        return ValidationResponse(valid=detections_found, confidences=confidences)

    except Exception as e:
        print(f"Error processing images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=6969, reload=True)
