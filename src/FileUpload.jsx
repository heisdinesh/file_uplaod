import React, { useEffect, useRef, useState } from "react";
import styles from "./fileUpload.module.css";
// import Image from "next/image";
// import { SVGImages } from "@/assets/images";
// import { useDispatch, useSelector } from "react-redux";
// import * as EnquiryActions from "@/app/store/enquiry/actions";
// import { dispatchErrorToast } from "@/utils/toaster";
import { MdOutlineCameraAlt, MdOutlineArrowForward } from "react-icons/md";
import { IoMdArrowBack } from "react-icons/io";
import { CiRedo } from "react-icons/ci";

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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const inputFileRef = useRef(null);
  //   const dispatch = useDispatch();

  const uploadFiles = (files) => {
    // dispatch(EnquiryActions.uploadTestRideImages({ files, category, userId }));
  };
  const deleteTestRideImageSuccess = false;
  const deleteTestRideImageReset = (data) => {
    // dispatch(EnquiryActions.deleteTestRideImageReset(data));
  };

  useEffect(() => {
    deleteTestRideImageReset();
  }, [deleteTestRideImageSuccess]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > maxFilesPerCategory) {
      //   dispatchErrorToast(
      //     `You can only upload up to ${maxFilesPerCategory} files.`
      //   );
      return;
    }
    const newImages = files.map((file) => ({
      id: file.name,
      type: "PHOTO_OF_USER",
      url: URL.createObjectURL(file),
    }));
    setUploadedImages((prevImages) => [...prevImages, ...newImages]);
    onChange(e.target.files);
    uploadFiles(files);
  };

  const removeImage = (id) => {
    setUploadedImages((prevImages) =>
      prevImages.filter((image) => image.id !== id)
    );
    // dispatch(EnquiryActions.deleteTestRideImage({ imageId: id }));
    onChange(null);
  };

  const startCapture = async () => {
    if (uploadedImages.length >= maxFilesPerCategory) {
      //   dispatchErrorToast(`You have reached the maximum upload limit.`);
      return;
    }
    setCapturing(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
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
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCapturing(false);
  };

  const proceedWithCapture = () => {
    const file = dataURLtoFile(capturedImage, `photo-${Date.now()}.jpg`);
    handleFileChange({ target: { files: [file] } });
    setCapturedImage(null);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCapture();
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

  return (
    <>
      {!capturing && !capturedImage && (
        <div className={styles.fileUploadContainer}>
          {uploadedImages.length > 0 && (
            <div className={styles.files}>
              <div className={styles.fileNames}>
                {uploadedImages.map(({ id, url }) => (
                  <div className={styles.fileName} key={id}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {id}
                    </a>
                    {isEdit && (
                      <button className={styles.remove}>
                        {" "}
                        {/* <Image
                          width={24}
                          height={24}
                          onClick={() => removeImage(id)}
                          src={SVGImages.wrongClose}
                          alt="Remove"
                        /> */}
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div
            className={styles.fileUpload}
            onClick={() => {
              if (uploadedImages.length >= maxFilesPerCategory) {
                // dispatchErrorToast(
                //   `You have reached the maximum upload limit.`
                // );
              } else {
                inputFileRef.current.click();
              }
            }}
          >
            <input
              ref={inputFileRef}
              type="file"
              className={styles.fileInput}
              onChange={handleFileChange}
              multiple
              disabled={uploadedImages.length >= maxFilesPerCategory}
            />
            {!capturing && !capturedImage && isEdit && (
              <div className={styles.fileUploadMore}>
                {/* <Image src={SVGImages.upload} alt="upload" /> */}
                {uploadedImages.length > 0 && <p>Upload more</p>}
              </div>
            )}
            {uploadedImages.length === 0 &&
              !capturing &&
              !capturedImage &&
              isEdit && (
                <h2>
                  Drop your image file here, or <span>Browse</span>
                </h2>
              )}
          </div>
          {uploadedImages.length === 0 &&
            !capturing &&
            !capturedImage &&
            !isEdit && <p>No Imaged added yet.</p>}
          {!capturing && !capturedImage && isEdit && (
            <div className={styles.cameraUpload}>
              <button
                onClick={() => {
                  if (uploadedImages.length >= maxFilesPerCategory) {
                    // dispatchErrorToast(
                    //   `You have reached the maximum upload limit.`
                    // );
                  } else {
                    startCapture();
                  }
                }}
              >
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
          <canvas ref={canvasRef} />
        </div>
      )}
      {capturedImage && !capturing && (
        <div className={styles.cameraUpload}>
          <img
            src={capturedImage}
            alt="Captured"
            className={styles.capturedImage}
          />
          <div className={styles.captureActions}>
            <button className={styles.retake} onClick={retakePhoto}>
              <CiRedo size={16} /> Retake
            </button>
            <button className={styles.proceed} onClick={proceedWithCapture}>
              Proceed <MdOutlineArrowForward size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUpload;
