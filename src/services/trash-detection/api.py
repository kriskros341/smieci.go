from pydantic import BaseModel
import torch
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from typing import List
import io
from dotenv import load_dotenv
import os


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

model = None
@app.on_event("startup")
async def load_model():
    if os.getenv("HOST") == "localhost":
        if not load_dotenv(override=False):
            print("Error loading .env file")
            exit(1)
    global model
    model_path = 'best.pt'
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=False)
    model.eval()

class ImageProcessRequest(BaseModel):
    markerId: int
    files: List[UploadFile]

class ValidationResponse(BaseModel):
    valid: bool

@app.post("/validate-images", response_model=ValidationResponse)
async def validate_images(
    marker_id: int = Form(...), # TODO: unused probably
    files: List[UploadFile] = File(...),
):
    # TODO: add access token for security and add to .env, or docker internal network
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Too many images")
    imgs = []
    try:
        for file in files:
            content = await file.read()
            img = Image.open(io.BytesIO(content))
            imgs.append(img)
        results = model(imgs)

        valid = any(len(result) > 0 for result in results.ims)
        print(results)
        return ValidationResponse(valid=valid)

    except Exception as e:
        print(f"Error processing images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))




if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=6969, reload=True)
