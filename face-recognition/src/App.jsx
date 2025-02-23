import React, { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log('Modelos cargados');
      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error('Error al acceder a la cámara:', err));
    };

    const detectFaces = async () => {
      if (videoRef.current && canvasRef.current) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvasRef.current, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks(); // Incluir puntos de referencia (landmarks)

          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          // Limpiar el canvas antes de dibujar
          const context = canvasRef.current.getContext('2d');
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Dibujar detecciones y landmarks
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }, 100);
      }
    };

    videoRef.current?.addEventListener('play', detectFaces);

    loadModels();

    return () => videoRef.current?.removeEventListener('play', detectFaces);
  }, []);

  return (
    <div>
      <h1>Reconocimiento Facial</h1> 
      <video ref={videoRef} autoPlay muted width="720" height="560" /> 
      <canvas ref={canvasRef} width="720" height="560" />
    </div>
  );
}

export default App;
