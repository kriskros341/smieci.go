import requests
from pydantic import BaseModel
import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import os
from typing import List
from dotenv import load_dotenv


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
    if not load_dotenv():
        print("failed to load .env")
        exit(1)
    global model
    model_path = 'best.pt'
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=False)
    model.eval()

class ImageProcessRequest(BaseModel):
    markerId: int
    filenames: List[str]

class ValidationResponse(BaseModel):
    valid: bool

@app.post("/validate-images", response_model=ValidationResponse)
async def validate_images(request: ImageProcessRequest):
    # TODO: add access token for security and add to .env
    try:
        for filename in request.filenames:
            if not os.path.exists(filename):
                return ValidationResponse(valid=False)

        try:
            imgs = [Image.open(f) for f in request.filenames]
            results = model(imgs)

            ok = False
            for result in results.ims:
                if len(result) > 0:
                    ok = True
                    break
            return ValidationResponse(valid=ok)

        except Exception as e:
            print(f"Error processing images: {str(e)}")
            return ValidationResponse(valid=False)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




if __name__ == "__main__":
    uvicorn.run("api:app", host="164.90.189.40", port=6969, reload=True)
