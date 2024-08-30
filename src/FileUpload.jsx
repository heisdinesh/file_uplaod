import React, { useEffect, useRef, useState } from "react";
import styles from "./fileUpload.module.css";
import { MdOutlineCameraAlt, MdOutlineArrowForward } from "react-icons/md";
import { IoMdArrowBack } from "react-icons/io";
import { CiRedo } from "react-icons/ci";
import { PiCameraRotate } from "react-icons/pi";

const FileUpload = ({
  onChange,
  userId,
  category,
  images = [],
  maxFilesPerCategory,
  isEdit = true,
}) => {
  const [uploadedImages, setUploadedImages] = useState(images);
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const inputFileRef = useRef(null);

  useEffect(() => {
    // Get available video devices (cameras)
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const videoDevices = deviceInfos.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId); // Set default to first camera
      }
    });
  }, []);

  useEffect(() => {
    // Start capturing when the video element is rendered
    if (capturing && videoRef.current) {
      startCapture();
    }
  }, [capturing, selectedDeviceId]);

  const startCapture = async () => {
    if (uploadedImages.length >= maxFilesPerCategory) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        },
      });

      // Ensure the video element is available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        // Handle the case where the video element is not ready
        console.error("Video element is not available yet.");
        alert(
          "An issue occurred while accessing the camera. Please try again."
        );
        stream.getTracks().forEach((track) => track.stop()); // Stop the stream
      }
    } catch (error) {
      if (error.name === "NotAllowedError") {
        alert(
          "Camera access is required to capture a photo. Please grant permission."
        );
      } else if (error.name === "NotFoundError") {
        alert("No camera device found. Please connect a camera.");
      } else {
        alert("An unexpected error occurred while accessing the camera.");
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > maxFilesPerCategory) {
      // Handle max file limit
      return;
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const [header, data] = dataurl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new File([array], filename, { type: mime });
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.srcObject.getTracks().forEach((track) => track.stop());
    setCapturedImage(canvas.toDataURL("image/jpeg"));
    setCapturing(false);
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCapturing(false);
  };

  const handleDeviceChange = (event) => {
    setSelectedDeviceId(event.target.value);
  };

  const rotateCamera = () => {
    const currentIndex = devices.findIndex(
      (device) => device.deviceId === selectedDeviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  };

  return (
    <>
      {!capturing && !capturedImage && (
        <div className={styles.fileUploadContainer}>
          {/* Existing UI */}
          {!capturing && !capturedImage && isEdit && devices.length > 1 && (
            <div className={styles.deviceSelector}>
              <label htmlFor="camera">Select Camera: </label>
              <select
                id="camera"
                value={selectedDeviceId}
                onChange={handleDeviceChange}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId}`}
                  </option>
                ))}
              </select>
              <button onClick={rotateCamera} className={styles.rotate}>
                <PiCameraRotate size={16} /> Rotate Camera
              </button>
            </div>
          )}
          {/* Camera capture UI */}
          {!capturing && !capturedImage && isEdit && (
            <div className={styles.cameraUpload}>
              <button onClick={() => setCapturing(true)}>
                <MdOutlineCameraAlt /> Capture using Camera
              </button>
            </div>
          )}
        </div>
      )}
      {capturing && (
        <div className={styles.cameraUpload}>
          <video ref={videoRef} autoPlay />
          <div className={styles.captureActions}>
            <button onClick={closeCamera} className={styles.retake}>
              <IoMdArrowBack size={16} /> Back
            </button>
            <button onClick={capturePhoto} className={styles.proceed}>
              <MdOutlineCameraAlt size={16} /> Capture Photo
            </button>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
      {capturedImage && !capturing && (
        <div className={styles.cameraUpload}>
          <img
            src={capturedImage}
            alt="Captured"
            className={styles.capturedImage}
            style={{ transform: `rotate(${rotation}deg)` }} // Apply rotation
          />
          <div className={styles.captureActions}>
            <button
              className={styles.retake}
              onClick={() => setCapturing(true)}
            >
              <CiRedo size={16} /> Retake
            </button>
            <button
              className={styles.proceed}
              onClick={() => {
                const file = dataURLtoFile(
                  capturedImage,
                  `photo-${Date.now()}.jpg`
                );
                handleFileChange({ target: { files: [file] } });
                setCapturedImage(null);
              }}
            >
              Proceed <MdOutlineArrowForward size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUpload;
