"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import CacheInput from "./kyc/cacheInput";

import CircularProgress from "@mui/material/CircularProgress";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
// import { useFFmpeg } from "./kyc/useFFmpeg";

import { Grid } from "@mui/material";

import "./kyc/index.scss";
import ObjectDetection from "./kyc/objectDetection";
import HandGestures from "./kyc/HandGestures";

const Post = () => {
  const [frontPridict, setFrontPredict] = useState("");
  const [kycType, setkycType] = useState("");
  const [activeStep, setActiveStep] = React.useState(0);
  const [token, setToken] = useState("");
  const [kycId, setKycId] = useState("");
  const [actions, setActions] = useState([]);
  const [callbackUrl, setCallBackUrl] = useState("");
  const [reduceSizeFile, setRedueSizeFile] = useState(false);
  const [startPlaySound, setStartPlaySound] = useState();
  const mediaRecorderRef = useRef("");
  const [progress, setProgress] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploadAgain, setIsFileUploadAgain] = useState(true);
  const [retryCount, setRetryCount] = useState(0); // Track retries
  const maxRetries = 5; // Set a maximum number of retries
  const [errorMessage, setErrorMessage] = useState(""); // State to store error messages
  const [isGetFile, setIsGetFile] = useState(false);

  const [isMultipleFace, setIsMultipleFace] = useState(false);
  // const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);
  const messageRef = useRef(null);

  const baseUrl = process.env.BASEURL || "https://uat.kian.digital/api-proxy";
  const handleGetRecordFile = (file, lastStep) => {
    const blob = new Blob([file], {
      type: "video/mp4",
    });

    mediaRecorderRef.current = file;
    // setRedueSizeFile(true);
    // transcode(file).then((e) => {
    //   // setRedueSizeFile(false);
    //   // mediaRecorderRef.current = e;
    // });

    if (lastStep === "finish") {
      setIsGetFile(true);
    }
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
          <div style={{ width: "350px" }}>
            {actions.length > 0 && kycType === "HEAD_POSITIONING" ? (
              <ObjectDetection
                startPlaySound={startPlaySound}
                actions={actions}
                handleGetRecordFile={handleGetRecordFile}
                handleGetfrontPredit={handleGetfrontPredit}
              />
            ) : (
              <HandGestures
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

  useEffect(() => {
    const handleMessage = (event) => {
      setToken(event.data.token);
      setKycId(event.data.kycId);
    };

    window.addEventListener("message", handleMessage);

    // Cleanup event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/submit", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.status}`);
        }
        const result = await res.json();
        setToken(result.token);
        setKycId(result.kycId);
      } catch (error) {
        console.error("Error fetching stored data:", error);
        // setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (token && kycId) {
      setRetryCount(0); // Reset retry count
      handleFetchActions(token, kycId);
    }
  }, [token, kycId]);

  const handleGetfrontPredit = (value) => {
    setFrontPredict(value);
  };

  // const { transcode, progressCompress } = useFFmpeg();

  const handleSendVideo = async (token, kycId22) => {
    setProgress(true); // Start progress
    // Play thank-you audio
    const audio = new Audio(`/thanks.mp3`);
    audio.play();
    const typeForSafari = "video/mp4";
    const mediaData = mediaRecorderRef.current; // Ensure this contains the correct media data
    // eslint-disable-next-line react-hooks/rules-of-hooks

    const blob = new Blob([mediaData], {
      type: typeForSafari,
    });

    setRedueSizeFile(false);
    // const link = document.createElement("a");
    // link.href = window.URL.createObjectURL(blob); // e should be a blob or File object (representing the video)
    // link.download = `test.mp4`; // Download as a video file, adjust extension as needed
    // document.body.appendChild(link); // Append to the body to make it part of the DOM
    // link.click(); // Programmatically click the link to trigger the download
    // document.body.removeChild(link); // Remove the link from the DOM
    // window.URL.revokeObjectURL(link.href);

    if (blob) {
      const formData = new FormData();
      formData.append("file", blob, "recorded-video.mp4");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Use multipart for file upload
          charset: "utf-8",
          // "front-predit": frontPridict.join(","),
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
        timeout: 60000, // Optional: Increase timeout for slower networks
      };

      // Make the POST request to upload the video
      const uaturl = "https://apipanel.uat.kian.digital/2";
      const local = "http://localhost:3001/2";
      const mainCall = `${callbackUrl}`;
      axios
        .post(`${baseUrl}/v2/kyc/submit/${kycId}`, formData, config)
        .then((response) => {
          // handleSubmit(uaturl);
          window.location.href = mainCall;
        })
        .catch((error) => {
          alert(error);
          // console.error("Error uploading the file:", error);
          alert("File upload failed, please try again.");
          setIsFileUploadAgain(false);
        })
        .finally(() => {
          setProgress(false); // End progress indicator
        });
    } else {
      console.error("Failed to create Blob for the video.");
    }
  };
  // Fetch API logic with retry mechanism
  const handleFetchActions = async (token, kycId1) => {
    setLoading(true); // Start showing the spinner
    setErrorMessage("");

    try {
      const response = await fetch(
        `${baseUrl}/v2/kyc/random/action/${kycId1}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "callback-url": "default",
          },
        }
      );

      // Check if the response is okay (status 200)
      if (response.ok) {
        const json = await response.json();
        console.log(json, "response");
        setkycType(json.kycType);
        const actionsArray = json.action.split(",");
        console.log(json.callbackUrl, "json.callbackUrl");
        setCallBackUrl(json.callbackUrl);

        // Map actions to corresponding meanings
        const actionMappings = {
          c: "center",
          l: "left",
          u: "up",
          d: "down",
          r: "right",
          1: "one",
          2: "two",
          3: "three",
          4: "four",
          5: "five",
        };
        const mappedActions = actionsArray.map(
          (action) => actionMappings[action]
        );

        const mapActionWithTitle = mappedActions.map((e) => {
          if (e === "center") return { title: "مرکز", action: e };
          if (e === "left") return { title: "چپ", action: e };
          if (e === "right") return { title: "راست", action: e };
          if (e === "down") return { title: "پایین", action: e };
          if (e === "up") return { title: "بالا", action: e };
          if (e === "one") return { title: "یک", action: e };
          if (e === "two") return { title: "دو", action: e };
          if (e === "three") return { title: "سه", action: e };
          if (e === "four") return { title: "چهار", action: e };
          if (e === "five") return { title: "پنج", action: e };
        });

        setActions(mapActionWithTitle);
        setLoading(false); // Stop loading spinner
      } else {
        // Retry logic in case the response is not 200
        throw new Error("Failed to fetch actions, retrying...");
      }
    } catch (error) {
      alert(error);
      console.log(error, "Liveness Detection");
      if (retryCount < maxRetries) {
        console.warn(`Retrying... (${retryCount + 1}/${maxRetries})`);
        setRetryCount(retryCount + 1);
        // handleFetchActions(token, kycId); // Retry the fetch
      } else {
        alert(error);
        console.error("Max retries reached, could not fetch actions.", error);
        setErrorMessage("error");
        setLoading(false); // Stop loading spinner after max retries
      }
    }
  };

  const handleNextStep = (index, token) => {
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

  function redirectToPost(url, data) {
    // Create a form element
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;

    // Add data as hidden input fields
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
      }
    }

    // Append the form to the body and submit it
    document.body.appendChild(form);
    form.submit();
  }

  function handleSubmit(url, data) {
    const data1 = {};
    redirectToPost(url, data1);
  }

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      height={"100vh"}
    >
      {loading ? (
        <div className="spinner">
          <Box sx={{ display: "flex" }}>
            <CircularProgress />
          </Box>
        </div>
      ) : errorMessage ? (
        <div className="error">
          <p>Error: {404}</p>
        </div>
      ) : (
        <CacheInput>
          <Box sx={{ maxWidth: 400 }} dir="rtl">
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel style={{ width: "10px" }}>{step.label}</StepLabel>
                  <StepContent TransitionProps={{ unmountOnExit: true }}>
                    {desc(step)}
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <LoadingButton
                          variant="contained"
                          onClick={
                            !isUploadAgain
                              ? () => handleSendVideo(token, kycId)
                              : () => handleNextStep(index, token, kycId)
                          }
                          sx={{
                            mt: 1,
                            mr: 1,
                            display:
                              index === 1 && !isGetFile ? "none" : "block",
                          }}
                          loading={index === steps.length - 1 && progress}
                          disabled={index === 1 && !isGetFile}
                        >
                          {!isUploadAgain
                            ? "آپلود دوباره"
                            : index === steps.length - 1
                            ? "پایان"
                            : "ادامه"}
                        </LoadingButton>
                        {/* {index === steps.length - 1 && progressCompress} */}
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </CacheInput>
      )}
    </Grid>
  );
};

export default Post;
