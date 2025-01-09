import io
import os
from dataclasses import dataclass
from typing import List
from datetime import datetime
from PIL import Image, ImageDraw
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

def draw_boxes(image: Image.Image, detections: torch.Tensor, output_path: str) -> None:
    """
    Draw bounding boxes on the image and save it.
    
    Args:
        image: PIL Image object
        detections: Tensor of shape (num_detections, 6) [x1, y1, x2, y2, confidence, class]
        output_path: Path to save the annotated image
    """
    draw = ImageDraw.Draw(image)
    
    for detection in detections:
        # Extract coordinates and confidence
        x1, y1, x2, y2, confidence, class_id = detection.tolist()
        
        # Convert coordinates to integers
        x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
        
        # Draw rectangle
        draw.rectangle([x1, y1, x2, y2], outline='red', width=3)
        
        # Add confidence text
        confidence_text = f"{confidence:.2f}"
        draw.text((x1, y1-20), confidence_text, fill='red')
    
    # Save the image
    image.save(output_path)

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
        for i, (image_result, img, file) in enumerate(zip(images_results, imgs, files)):
            confidence = 0
            for detection in image_result:
                detection_confidence = detection[4].item()
                confidence = max(confidence, detection_confidence)
                
            confidences[i] = confidence
            
            if confidence > DETECTION_CONFIDENCE_THRESHOLD:
                detections_found = True
                # Generate unique filename with timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_{file.filename.split("/")[-1]}"
                print(timestamp)
                print(file.filename)
                print(filename)
                draw_boxes(img, image_result, filename)

        return ValidationResponse(valid=detections_found, confidences=confidences)

    except Exception as e:
        print(f"Error processing images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=6969, reload=True)
