import { useRef } from "react";
export const useVideRecording = (videoRef, streamRef) => {
  const setChunckVideo = useRef();
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      // await new Promise((resolve) => (video.onloadedmetadata = resolve));
      videoRef.current.play();
      // setupMediaRecorder(stream, mediaRecorderRef);
    } catch (err) {
      console.error("Error accessing the camera: ", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      // setIsCameraOn(false);
    }
  };

  const startRecording = (stream, mediaRecorderRef, handleGetRecordFile) => {
    const optionForSafari = {
      mimeType: "video/mp4",
      // videoBitsPerSecond: 100000,
    };
    const options = { mimeType: "video/webm; codecs=vp9" };
    const mediaRecorder = new MediaRecorder(stream, optionForSafari);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorderRef.current.start();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        handleGetRecordFile(event.data);
      }
    };
  };

  return {
    startVideo,
    stopCamera,
    startRecording,
    setChunckVideo,
  };
};
