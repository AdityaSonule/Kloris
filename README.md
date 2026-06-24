Kloris is a full-stack deep learning web application that detects potato leaf diseases from an uploaded image. The system classifies a leaf into one of three classes:

- Early Blight
- Late Blight
- Healthy

The project uses a trained Convolutional Neural Network (CNN), a FastAPI backend, and a React frontend. It was built as an end-to-end machine learning product pipeline: model training, API serving, web interface, and local testing.

Project Overview

Potato plants are highly affected by diseases such as Early Blight and Late Blight. Early identification helps farmers take correct action and reduce crop loss. This project allows users to upload a potato leaf image and receive an instant prediction with confidence score.

The complete workflow is:

User uploads image
        ↓
React frontend sends image
        ↓
FastAPI backend receives image
        ↓
Image is preprocessed
        ↓
TensorFlow model predicts disease
        ↓
Prediction result is shown on UI
