from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os

app = FastAPI()

# ✅ CORS (ONLY ONE BLOCK)
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ MODEL LOAD
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "saved_models", "1")

MODEL = tf.keras.models.load_model(MODEL_PATH)
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

# ✅ HEALTH CHECK
@app.get("/ping")
async def ping():
    return {"message": "API working"}

# ✅ IMAGE PROCESS
def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data))
    image = image.convert("RGB")
    image = image.resize((256, 256))   # ✅ IMPORTANT
    image = np.array(image) / 255.0
    return image

# ✅ PREDICT API
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    predictions = MODEL.predict(img_batch)

    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0]))

    return {
        "class": predicted_class,
        "confidence": confidence
    }

# ✅ RUN SERVER
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
