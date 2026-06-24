from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os



app = FastAPI()


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


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(BASE_DIR, "..", "saved_models")

# get all version folders
versions = [int(v) for v in os.listdir(models_dir) if v.isdigit()]

latest_version = str(max(versions))

MODEL_PATH = os.path.join(models_dir, latest_version)

MODEL = tf.saved_model.load(MODEL_PATH)


infer = MODEL.signatures["serving_default"]

CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]


@app.get("/ping")
async def ping():
    return {"message": "API working"}



def read_file_as_image(data) -> np.ndarray:
    img = Image.open(BytesIO(data)).convert("RGB")
    img = img.resize((256, 256))

    img_array = np.array(img).astype("float32") / 255.0  # ✅ clean
    return img_array



@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img = read_file_as_image(await file.read())
    img_batch = np.expand_dims(img, 0)

  
    prediction = infer(tf.constant(img_batch))

   
    prediction = list(prediction.values())[0].numpy()

    predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
    confidence = float(np.max(prediction[0]))

    return {
        "class": predicted_class,
        "confidence": confidence
    }



if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)