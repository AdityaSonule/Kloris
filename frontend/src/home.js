import React, { useState, useEffect } from "react";
import axios from "axios";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Send image to backend
  const sendFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(
        process.env.REACT_APP_API_URL,
        formData
      );

      console.log(res.data); // ✅ debug
      setData(res.data);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  };

  // ✅ Create preview
  useEffect(() => {
    if (!selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  // ✅ Trigger prediction
  useEffect(() => {
    if (!preview) return;

    setIsLoading(true);
    sendFile();
  }, [preview]);

  // ✅ File select
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setData(null);
  };

  // ✅ Clear everything
  const clearData = () => {
    setSelectedFile(null);
    setPreview(null);
    setData(null);
  };

  return (
    <div>
      {/* Top header */}
      <AppBar position="static" style={{ background: "#be6a77" }}>
        <Toolbar>
          <Typography variant="h6">
            Potato Disease Classification
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main section */}
      <Container
        maxWidth={false}
        style={{
          backgroundColor: "#f5f5f5",
          minHeight: "90vh",
          paddingTop: "40px",
        }}
      >
        <Grid container justifyContent="center">
          <Card style={{ width: 400, padding: 20 }}>
            
            {/* Image preview */}
            {preview && (
              <CardMedia
                component="img"
                height="300"
                image={preview}
                alt="preview"
              />
            )}

            <CardContent style={{ textAlign: "center" }}>
              
              {/* Upload */}
              <input type="file" onChange={handleFileChange} />

              <br /><br />

              {/* Clear button */}
              <Button variant="contained" onClick={clearData}>
                Clear
              </Button>

              <br /><br />

              {/* Loading */}
              {isLoading && (
                <div>
                  <CircularProgress />
                  <Typography>Processing...</Typography>
                </div>
              )}

              {/* RESULT ✅ */}
              {data && (
                <div>
                  <h2>Label: {data.class}</h2>
                  <h3>
                    Confidence: {(data.confidence * 100).toFixed(2)}%
                  </h3>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </div>
  );
};