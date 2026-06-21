import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";

export const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Dropzone
  const onDrop = (acceptedFiles) => {
    const selected = acceptedFiles[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setData(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  // ✅ Send to backend
  useEffect(() => {
    const sendFile = async () => {
      if (!file) return;

      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          process.env.REACT_APP_API_URL,
          formData
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    sendFile();
  }, [file]);

  return (
    <div>
      {/* HEADER */}
      <AppBar position="static" style={{ background: "#b35f6a" }}>
        <Toolbar>
          <Typography variant="h6">
            Potato Disease Classification
          </Typography>
        </Toolbar>
      </AppBar>

      {/* BACKGROUND */}
      <Container
        maxWidth={false}
        style={{
          backgroundImage: `url("/bg.png")`,
          backgroundSize: "cover",
          minHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card style={{ width: 450, padding: 20 }}>
          <CardContent style={{ textAlign: "center" }}>

            {/* DROPZONE */}
            {!preview && (
              <div
                {...getRootProps()}
                style={{
                  border: "2px dashed #ccc",
                  padding: 40,
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                <Typography>
                  Drag & drop potato leaf image here
                </Typography>
              </div>
            )}

            {/* PREVIEW */}
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{ width: "100%", borderRadius: 10 }}
              />
            )}

            <br /><br />

            {/* LOADING */}
            {loading && (
              <>
                <CircularProgress />
                <Typography>Processing...</Typography>
              </>
            )}

            {/* RESULT */}
            {data && (
              <div>
                <Typography variant="h6">
                  Label: {data.class}
                </Typography>
                <Typography>
                  Confidence: {(data.confidence * 100).toFixed(2)}%
                </Typography>
              </div>
            )}

            <br />

            {/* CLEAR */}
            {preview && (
              <Button
                variant="contained"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setData(null);
                }}
              >
                Clear
              </Button>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
``