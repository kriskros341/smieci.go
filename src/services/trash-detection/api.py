import requests
import torch
import uvicorn
from accelerate.test_utils.testing import get_backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForObjectDetection

THRESHOLD = 0.04
MODEL = "hxwk507/detr-garbage"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

device, _, _ = get_backend()

image_processor = AutoImageProcessor.from_pretrained(MODEL)
model = AutoModelForObjectDetection.from_pretrained(MODEL)
model = model.to(device)


@app.post("/inference")
async def inference(path):
    # TODO: add access token for security and add to .env
    image = Image.open(requests.get(path, stream=True).raw)

    with torch.no_grad():
        inputs = image_processor(images=[], return_tensors="pt")
        outputs = model(**inputs.to(device))
        target_sizes = torch.tensor([[image.size[1], image.size[0]]])
        results = image_processor.post_process_object_detection(
            outputs, threshold=THRESHOLD, target_sizes=target_sizes
        )[0]

    for score, label, box in zip(
        results["scores"], results["labels"], results["boxes"]
    ):
        box = [round(i, 2) for i in box.tolist()]
        print(
            f"Detected {model.config.id2label[label.item()]} with confidence "
            f"{round(score.item(), 3)} at location {box}"
        )
    return {
        "labels": [model.config.id2label[label.item()] for label in results["labels"]],
        "scores": [round(score.item(), 3) for score in results["scores"]],
        "boxes": [[round(i, 2) for i in box.tolist()] for box in results["boxes"]],
    }


if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=6969, reload=True)
