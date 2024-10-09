import { useRef } from "react";
export const useVideRecording = (videoRef, streamRef) => {
  const setChunckVideo = useRef();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      // setIsCameraOn(false);
    }
  };

  function getSupportedMimeType() {
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      console.log("video/webm;codecs=vp9");
    } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
      console.log("video/webm;codecs=vp8"); // VP8 fallback
    } else if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
      console.log("video/mp4;codecs=avc1"); // H.264 fallback
    } else {
      console.log("No supported codec found");
    }
  }
  // video/mp4
  const startRecording = (stream, mediaRecorderRef, handleGetRecordFile) => {
    // getSupportedMimeType();
    const optionForSafari = {
      mimeType:
        navigator.userAgent.toLowerCase().indexOf("firefox") > -1
          ? "video/webm;codecs=vp8"
          : "video/mp4; codecs=h264",

      videoBitsPerSecond: 2500000,
    };

    const videoConstraints = {
      video: {
        width: { ideal: 640 }, // Lower width
        height: { ideal: 360 }, // Lower height
        frameRate: { ideal: 15 }, // Lower frame rate
      },
    };
    const options = { mimeType: "video/webm; codecs=vp9" };
    const mediaRecorder = new MediaRecorder(stream, optionForSafari);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorderRef.current.start();

    mediaRecorder.ondataavailable = (event) => {
      console.log(event.data);
      if (event.data.size > 0) {
        handleGetRecordFile(event.data);
      }
    };
  };

  return {
    stopCamera,
    startRecording,
    setChunckVideo,
  };
};
