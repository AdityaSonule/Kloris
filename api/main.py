from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os

from tensorflow.keras.utils import img_to_array


# ✅ CREATE APP
app = FastAPI()

# ✅ CORS SETTINGS
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

# ✅ MODEL PATH
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "saved_models", "1")

# ✅ LOAD MODEL (FIXED FOR SAVEDMODEL)
MODEL = tf.saved_model.load(MODEL_PATH)

# ✅ GET INFERENCE FUNCTION
infer = MODEL.signatures["serving_default"]

CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]


# ✅ HEALTH CHECK
@app.get("/ping")
async def ping():
    return {"message": "API working"}


# ✅ IMAGE PREPROCESSING
def read_file_as_image(data) -> np.ndarray:
    img = Image.open(BytesIO(data)).convert("RGB")
    img = img.resize((256, 256))

    img_array = img_to_array(img)
    img_array = img_array / 255.0

    return img_array


# ✅ PREDICTION API (FIXED PROPERLY)
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img = read_file_as_image(await file.read())
    img_batch = np.expand_dims(img, 0)

    # ✅ USE SIGNATURE FUNCTION
    prediction = infer(tf.constant(img_batch))

    # ✅ EXTRACT OUTPUT
    prediction = list(prediction.values())[0].numpy()

    predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
    confidence = float(np.max(prediction[0]))

    return {
        "class": predicted_class,
        "confidence": confidence
    }


# ✅ RUN SERVER
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
