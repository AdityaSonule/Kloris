import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  CircularProgress
} from "@mui/material";

import { useDropzone } from "react-dropzone";
import ClearIcon from "@mui/icons-material/Clear";

import cblogo from "./cblogo.PNG";
import image from "./bg.png";

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  // ✅ Dropzone
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setData(null);
    setImageUploaded(true);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  // ✅ Send to backend
  useEffect(() => {
    const sendFile = async () => {
      if (!selectedFile) return;
      setIsloading(true);

      let formData = new FormData();
      formData.append("file", selectedFile);

      try {
        let res = await axios.post(
          process.env.REACT_APP_API_URL,
          formData
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      }

      setIsloading(false);
    };

    sendFile();
  }, [selectedFile]);

  const clearData = () => {
    setData(null);
    setImageUploaded(false);
    setSelectedFile(null);
    setPreview(null);
  };

  let confidence = "";
  if (data) {
    confidence = (data.confidence * 100).toFixed(2);
  }

  return (
    <>
      {/* HEADER */}
      <AppBar position="static" style={{ background: "#be6a77" }}>
        <Toolbar>
          <Typography variant="h6">
            CodeBasics: Potato Disease Classification
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Avatar src={cblogo} />
        </Toolbar>
      </AppBar>

      {/* MAIN */}
      <Container
        maxWidth={false}
        style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        }}
      >

        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Card
              style={{
              width: 400,
              padding: 20,
              borderRadius: 20,

              // ✅ GLASS EFFECT
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",

              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",

              color: "white"
              }}
        >
              {/* IMAGE */}
              {imageUploaded && (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: 300,
                    objectFit: "cover"
                  }}
                />
              )}

              {/* UPLOAD */}
              {!imageUploaded && (
                <CardContent>
                  
                  <div
                    {...getRootProps()}
                    style={{
                    border: "2px dashed rgba(255,255,255,0.5)",
                    padding: 40,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 10,
                    color: "white",
                    }}
                  >

                    <input {...getInputProps()} />
                    <Typography style={{ color: "white" }}>
                      Drag & drop an image of a potato leaf
                    </Typography>
                  </div>
                </CardContent>
              )}

              {/* RESULT */}
              {data && (
                <CardContent style={{ textAlign: "center" }}>
                  <TableContainer
                    component={Paper}
                    style={{
                    background: "transparent",
                    boxShadow: "none",
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Label</TableCell>
                          <TableCell style={{ color: "white" }}>
                            Confidence
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{data.class}</TableCell>
                          <TableCell align="right">
                            {confidence}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}

              {/* LOADER */}
              {isLoading && (
                <CardContent style={{ textAlign: "center" }}>
                  <CircularProgress />
                  <Typography>Processing...</Typography>
                </CardContent>
              )}
            </Card>
          </Grid>

          {/* CLEAR BUTTON */}
          {data && (
            <Grid item style={{ marginTop: 20 }}>
              <Button
                variant="contained"
                onClick={clearData}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};