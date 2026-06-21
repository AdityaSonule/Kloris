from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os

# ✅ FIXED IMPORT
from tensorflow.keras.utils import img_to_array


app = FastAPI()

# ✅ CORS
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


# ✅ IMAGE PROCESS (FIXED PROPERLY)
def read_file_as_image(data) -> np.ndarray:
    img = Image.open(BytesIO(data)).convert("RGB")
    img = img.resize((256, 256))

    img_array = img_to_array(img)   # ✅ correct method
    img_array = img_array / 255.0   # ✅ normalization

    return img_array


# ✅ PREDICT API (CRITICAL FIX HERE)
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img = read_file_as_image(await file.read())   # ✅ correct variable
    img_batch = np.expand_dims(img, 0)            # ✅ correct batching

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
``