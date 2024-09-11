"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import CacheInput from "./kyc/cacheInput";

// import { useParams } from "next/navigation";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { notFound } from "next/navigation";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useRouter } from "next/navigation";

import { Grid } from "@mui/material";

import "./kyc/index.scss";
import ObjectDetection from "./kyc/objectDetection";

// Create an RTL theme
const theme = createTheme({
  direction: "rtl",
});

const Post = () => {
  const [token, setToken] = useState("");
  const [kycId, setKycId] = useState("");
  const [actions, setActions] = useState([]);
  const [callbackUrl, setCallBackUrl] = useState("");
  const [startPlaySound, setStartPlaySound] = useState();
  const mediaRecorderRef = useRef("");
  const [progress, setProgress] = React.useState(false);
  const [loadPage, setLoadPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isGetFile, setIsGetFile] = useState(false);
  const baseUrl = "https://api.levants.io";
  const handleGetRecordFile = (file) => {
    mediaRecorderRef.current = file;
    setIsGetFile(true);
  };
  const steps = [
    {
      label: "راهنما",
      description: () => {
        return (
          <Typography sx={{ direction: "ltr", textAlign: "justify" }}>
            {
              "لطفا برای انجام فرآیند، ابتدا سر خود را در داخل کادر سبز قرار دهید. در ادامه سر خود را به سمت‌هایی که درخواست می‌شود حرکت دهید. به عنوان مثال: [چپ، راست، بالا]. یک راهنما به صورت صوتی شما را قدم به قدم همراهی خواهد کرد. از همکاری شما سپاسگزاریم."
            }
          </Typography>
        );
      },
    },
    {
      label: "ضبط ویدیو",
      description: () => {
        return (
          <div>
            {actions.length > 0 && (
              <ObjectDetection
                startPlaySound={startPlaySound}
                actions={actions}
                handleGetRecordFile={handleGetRecordFile}
              />
            )}
          </div>
        );
      },
    },
    {
      label: "ارسال ویدیو",
      description: () => {
        return (
          <Typography
            sx={{ direction: "rtl", textAlign: "start" }}
          ></Typography>
        );
      },
    },
  ];

  // JSON.stringify({
  //   client_id: "api-client-levant",
  //   client_secret: "59c24382-18ac-41e5-9141-ef2dbcd2e8de",
  //   grant_type: "client_credentials",
  //   scope: "roles",
  // });

  // const getToken = async (e) => {
  //   setLoadingGetId(true);
  //   try {
  //     const response = await fetch(`${baseUrl}/v1/auth/token`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         client_id: "api-client-demo",
  //         client_secret: "21ba7936-ea0c-45ce-996d-887712f79799",
  //         grant_type: "client_credentials",
  //         scope: "roles",
  //       }),
  //     });

  //     // Check if the response is okay
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }

  //     const json = await response.json();
  //     return json;
  //     // setToken(json.access_token);
  //   } catch (error) {
  //     console.error("Error downloading the file:", error);
  //   }
  // };

  useEffect(() => {
    // Listen for the postMessage event to receive token and kycId
    const handleMessage = async (event) => {
      // if (event.origin !== "http://localhost:3001/kyc") {
      //   return; // Ignore messages from untrusted origins
      // }
      // console.log(event.data);
      // setToken(event.data.token);
      // setKycId(event.data.kycId);
      // setTimeout(() => {
      //   handleNext(event.data.token, event.data.kycId);
      // }, 1500);
    };

    window.addEventListener("message", handleMessage);

    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [token, kycId]);
  const handleSendVideo = (token, kycId) => {
    setProgress(true);
    const audio = new Audio(`/thanks.mp3`);
    audio.play();
    const typeForSafari = "video/mp4";
    const blob = new Blob([mediaRecorderRef.current], {
      type: typeForSafari,
    });

    if (blob) {
      const formData = new FormData();
      formData.append("file", blob, "recorded-video.mp4");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          charset: "utf-8",
        },
      };

      axios
        .post(`${baseUrl}/v2/kyc/submit/${kycId}`, formData, config)
        .finally((res) => {
          setProgress(false);
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          // router.push(`${callbackUrl}${kycId}`);
          window.location.assign(`https://${callbackUrl}${kycId}`);
        });
    }
  };

  const [loadingGetId, setLoadingGetId] = useState(false);
  const [notify, setNotife] = useState("");

  const handleNext = async (token, kycId) => {
    try {
      const response = await fetch(`${baseUrl}/v2/kyc/random/action/${kycId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "callback-url": "callback-url",
        },
      });

      // Check if the response is okay
      if (!response.ok) {
        setLoadingGetId(false);
        setLoading(false);
        setNotife("لطفا به صفحه ی اصلی بازگردید و دوباره ورود کنید");
        throw new Error("Network response was not ok");
      }
      setLoadingGetId(false);
      setLoading(false);
      const json = await response.json();
      const actionsArray = json.action.split(",");
      setCallBackUrl(json.callbackUrl);

      // Step 2: Create a dictionary for mapping
      const actionMappings = {
        c: "center",
        l: "left",
        u: "up",
        d: "down",
        r: "right",
      };
      // Step 3: Map array to corresponding meanings
      const mappedActions = actionsArray.map(
        (action) => actionMappings[action]
      );
      const mapActionWithTitle = mappedActions.map((e) => {
        if (e === "center") {
          return {
            title: "مرکز",
            action: e,
          };
        } else if (e === "left") {
          return {
            title: "چپ",
            action: e,
          };
        } else if (e === "right") {
          return {
            title: "راست",
            action: e,
          };
        } else if (e === "down") {
          return {
            title: "پایین",
            action: e,
          };
        } else if (e === "up") {
          return {
            title: "بالا",
            action: e,
          };
        }
      });

      setActions(mapActionWithTitle);
    } catch (error) {
      setLoadingGetId(false);
      console.log(error);
    }
  };

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext1 = (index, token) => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    if (index === 0) {
      const audio = new Audio(`/startForCamera.mp3`);
      setStartPlaySound(audio);
      audio.play();
    }
    if (index === 1) {
      handleSendVideo(token, kycId);
    }
  };

  const desc = useMemo(() => {
    return (step) => {
      return step.description();
    };
  }, []);

  useEffect(() => {
    setLoadPage(true);

    // window.addEventListener("DOMContentLoaded", () => {

    // });
  }, [loadPage]);

  const videoRef = useRef(null);

  useEffect(() => {
    // startVideo();
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Set the video stream as the source of the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // streamRef.current = stream;
          // Play the video explicitly after the stream is set
          videoRef.current.play().catch((error) => {
            console.error("iOS autoplay restriction:", error);
          });
        }
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
      });
  }, []);

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      height={"100vh"}
    >
      <div style={{ width: 400 }}>
        <div className="video-container">
          <video
            ref={videoRef}
            width="640"
            playsinline={true}
            autoPlay={true}
          />
        </div>
      </div>
      {/* {loading && <>loading...</>} */}

      {/* {notify && <>{notify}</>} */}
      {/* {!kycId && !token && !loading && !notify && <>page not found</>} */}
    </Grid>
  );
};

export default Post;
