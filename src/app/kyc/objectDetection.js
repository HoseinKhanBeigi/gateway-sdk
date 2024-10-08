"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Image from "next/image";
import IconButton from "@mui/material/IconButton";
// import Notifier from "../notify";
import { Countdown } from "./countdown";
import { FaceSvg } from "./faceSvg";
import {
  usePlayTransitionColorForActions,
  useStopTransitionColorForActions,
  usePlayTransitionColorForActions2,
  useStopTransitionColorForActions2,
} from "./useTransitionForActions";
import CustomizedDialogs from "./dialog";
import LocalSeeIcon from "@mui/icons-material/LocalSee";
import { useFaceMesh } from "./useFaceMesh";
import "./ObjectDetection.scss";
import { useVideRecording } from "./useVideoRecording";

const ObjectDetection = ({
  actions,
  handleGetRecordFile,
  startPlaySound,
  handleGetfrontPredit,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const centerPointOfFace = useRef("");
  const arrowSvg = useRef("");
  const cancelSequenceRef = useRef(false); // Ref to store the cancel flag
  const [firstClick, setFirstClick] = useState(false);
  // const [stepsForAction,setStepForAction] = useState("")
  const [open, setOpen] = React.useState(false);
  const [multipleHeadDialogOpen, setMultipleHeadDialogOpen] =
    React.useState(false);
  const [interruptDialogOpen, setInterruptDialogOpen] = useState(false);
  // const [firstStepIsCenterIsCompleted, setFirstStepIsCenterIsCompleted] =
  //   useState(false);
  const removeToggleForArrowSvgUp = useRef();
  const removeToggleForArrowSvgDown = useRef();
  const removeToggleForArrowSvgLeft = useRef();
  const removeToggleForArrowSvgRight = useRef();
  const removeToggle = useRef();
  const videoContainer = useRef("");

  const boxRef = useRef([]);
  const streamRef = useRef();
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [errorPost, setErrorPost] = useState(false);
  const [actionForArrowSvg, setActionForArrowSvg] = useState("");
  // const successAudio = new Audio(`/success.mp3`);
  // const warningAudio = new Audio(`/warning.mp3`);

  const handleVoiceTrack = (action) => {
    return new Promise((resolve) => {
      let audio;
      if (action === "center") {
        audio = new Audio(`/center.mp3`);
        audio.play();
      } else if (action === "left") {
        audio = new Audio(`/nowLeft.mp3`);
        audio.play();
        setActionForArrowSvg("left");
        startAnimationArrowLeft();
      } else if (action === "right") {
        audio = new Audio(`/pleaseRight.mp3`);
        audio.play();
        setActionForArrowSvg("right");
        startAnimationArrowRight();
      } else if (action === "up") {
        setActionForArrowSvg("up");
        startAnimationArrowUp();
        audio = new Audio(`/pleaseUp.mp3`);
        audio.play();
      } else if (action === "down") {
        audio = new Audio(`/nowDown.mp3`);
        audio.play();
        setActionForArrowSvg("down");
        startAnimationArrowDown();
      }

      // Resolve the promise when the audio finishes playing
      if (audio) {
        audio.onended = resolve;
      } else {
        resolve(); // If no audio is played, resolve immediately
      }
    });
  };

  const interruptSequence = () => {
    cancelSequenceRef.current = true; // Set the flag to cancel the sequence
  };

  const handleSequencesForJustHint = async (steps) => {
    for (const step of steps) {
      try {
        await step.action(); // Execute the action, allowing for async operations
      } catch (error) {
        console.error(`Error in ${step.name}:`, error);
        throw error; // Exit if any step fails
      }
    }
    console.log("All steps completed");
  };

  const startAnimationForAction = usePlayTransitionColorForActions(
    removeToggle,
    boxRef,
    "chip",
    "chip"
  );
  const stopAnimationForAction = useStopTransitionColorForActions(
    removeToggle,
    boxRef,
    "chip active"
  );

  const startAnimationArrowUp = usePlayTransitionColorForActions2(
    removeToggleForArrowSvgUp,
    arrowSvg,
    "svgArrow inactive",
    "svgArrow pendingActive"
  );

  const startAnimationArrowDown = usePlayTransitionColorForActions2(
    removeToggleForArrowSvgDown,
    arrowSvg,
    "svgArrow inactive",
    "svgArrow pendingActive"
  );

  const startAnimationArrowLeft = usePlayTransitionColorForActions2(
    removeToggleForArrowSvgLeft,
    arrowSvg,
    "svgArrow inactive",
    "svgArrow pendingActive"
  );

  const startAnimationArrowRight = usePlayTransitionColorForActions2(
    removeToggleForArrowSvgRight,
    arrowSvg,
    "svgArrow inactive",
    "svgArrow pendingActive"
  );
  const stepsSequences = [
    {
      name: "Step 1",
      action: async () => {
        startAnimationForAction(0); // Start first animation
        await handleVoiceTrack(actions[0].action); // Assume handleVoiceTrack returns a promise
      },
    },
    {
      name: "Step 2",
      action: async () => {
        containerRef.current.style.display = "none";
        stopAnimationForAction(0);
        startAnimationForAction(1);
        // setFirstStepIsCenterIsCompleted("finish");
        await handleVoiceTrack(actions[1].action); // Wait for voice track to finish
      },
    },
    {
      name: "Step 3",
      action: async () => {
        stopAnimationForAction(1);
        startAnimationForAction(2);
        await handleVoiceTrack(actions[2].action); // Wait for voice track
      },
    },
    {
      name: "Step 4",
      action: async () => {
        stopAnimationForAction(2);
        startAnimationForAction(3);
        await handleVoiceTrack(actions[3].action); // Wait for voice track
      },
    },
    {
      name: "Step 5",
      action: async () => {
        stopAnimationForAction(3);
        await new Promise((resolve) => {
          setTimeout(() => {
            setActionForArrowSvg("");
            handleGetRecordFile("", "finish");
            handleStopRecording();
            // successAudio.play();
            stopCamera();
            resolve(); // Ensure the step resolves after timeout
          }, 2000); // 1-second delay before resolving
        });
      },
    },
  ];

  const { message } = useFaceMesh(
    videoRef,
    centerPointOfFace,
    canvasRef,
    containerRef
  );
  const { stopCamera, startRecording } = useVideRecording(
    videoRef,
    streamRef,
    mediaRecorderRef
  );

  const [isTurnOn, setIsTurnOn] = useState(true);
  useEffect(() => {
    // Request access to the user's camera
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Set the video stream as the source of the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Play the video explicitly after the stream is set
          videoRef.current.play().catch((error) => {
            console.error("iOS autoplay restriction:", error);
            setIsTurnOn(false);
          });
        }
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
        setIsTurnOn(false);
      });
  }, []);

  const handleStartRecording = () => {
    cancelSequenceRef.current = false; // Reset the cancel flag before starting
    startPlaySound.pause();
    setFirstClick(true);
    startRecording(streamRef.current, mediaRecorderRef, handleGetRecordFile);

    handleSequencesForJustHint(stepsSequences)
      .then(() => console.log("All steps executed successfully"))
      .catch((error) =>
        console.error("An error occurred during step execution:", error)
      );
  };

  const handleTurnOnTheCamere = () => {
    // Request access to the user's camera
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Set the video stream as the source of the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Play the video explicitly after the stream is set
          videoRef.current.play().catch((error) => {
            console.error("iOS autoplay restriction:", error);
          });
        }
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
      });
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
  };

  const [isHeadCenter, setIsHeadCenter] = useState(false);
  const arrRef = useRef([]);

  useEffect(() => {
    if (firstClick) {
      arrRef.current.push(message.position);

      const uniqueArr = [];
      const seen = new Set();

      for (let i = arrRef.current.length - 1; i >= 0; i--) {
        if (!seen.has(arrRef.current[i])) {
          uniqueArr.push(arrRef.current[i]);
          seen.add(arrRef.current[i]);
        }
      }
      uniqueArr.reverse();
      const shortArr = uniqueArr.map((item) => item[0]);
      handleGetfrontPredit(shortArr);
    }
  }, [firstClick, message.position]);

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleStartAction = () => {
    setIsHeadCenter(true);
    // You can perform your custom action here
  };

  return (
    <>
      <div className="chipContainer">
        {actions.map((element, i) => (
          <div className="chip" key={i} ref={(el) => (boxRef.current[i] = el)}>
            <div class="chip-content"> {element.title}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="video-container" ref={videoContainer}>
          <div>
            <video ref={videoRef} width="600" autoPlay playsInline />
          </div>
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", top: 0, left: 0 }}
          />

          <FaceSvg
            ref={containerRef}
            // firstStepIsCenterIsCompleted={firstStepIsCenterIsCompleted}
          />
          {!isTurnOn && (
            <IconButton
              style={{
                position: "absolute",
                top: "22px",
                left: "22px",
                transform: "translate(-50%, -50%)",
              }}
              aria-label="delete"
              onClick={handleTurnOnTheCamere}
            >
              <LocalSeeIcon />
            </IconButton>
          )}

          {actionForArrowSvg === "right" && (
            <svg
              version="1.1"
              id="Layer_1"
              ref={arrowSvg}
              className="svgArrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              style={{
                position: "absolute",
                top: "50%",
                left: "85%",
                transform: "translate(-50%, -50%)",
                width: "60px",
              }}
            >
              <path
                d="M257,429.855v74.181c-117.1,0-211.946-94.846-211.946-211.946S139.901,80.145,257,80.145h84.779
	l-26.494-26.494l42.389-42.389l105.972,105.972L357.674,223.207l-42.389-42.389l26.494-26.494H257
	c-76.088,0-137.765,61.676-137.765,137.765S180.911,429.855,257,429.855z"
              />
              <g>
                <path
                  d="M384.663,122.534H257c-76.088,0-137.765,61.676-137.765,137.765c0,5.385,0.387,10.673,0.988,15.896
		c7.892-68.588,66.074-121.869,136.777-121.869h96.203L384.663,122.534z"
                />
                <path
                  d="M257,472.245c-111.733,0-202.994-86.408-211.144-196.05c-0.392,5.266-0.802,10.53-0.802,15.896
		c0,117.1,94.846,211.946,211.946,211.946V472.245z"
                />
              </g>
              <path
                d="M264.964,512H257c-58.762,0-113.993-22.868-155.517-64.393S37.091,350.852,37.091,292.09s22.868-113.993,64.393-155.517
	S198.239,72.181,257,72.181h65.551l-18.53-18.53L357.674,0l117.236,117.236L357.674,234.471l-53.652-53.652l18.53-18.53H257
	c-71.572,0-129.801,58.228-129.801,129.801S185.428,421.891,257,421.891h7.964V512L264.964,512z M257,88.11
	c-54.508,0-105.738,21.212-144.254,59.728s-59.728,89.747-59.728,144.254s21.212,105.738,59.728,144.254
	c36.636,36.636,84.77,57.615,136.29,59.576v-58.317c-76.665-4.151-137.765-67.831-137.765-145.514
	c0-80.355,65.374-145.729,145.729-145.729h104.005l-34.458,34.458l31.127,31.127l94.71-94.71l-94.71-94.71l-31.127,31.127
	l34.458,34.458L257,88.11L257,88.11z"
              />

              <rect
                x="357.292"
                y="82.773"
                transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 609.7358 434.0347)"
                style={{ fill: "#FFFFFF" }}
                width="74.935"
                height="15.928"
              />
            </svg>
          )}

          {actionForArrowSvg === "left" && (
            <svg
              version="1.1"
              id="Layer_1"
              ref={arrowSvg}
              className="svgArrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              style={{
                position: "absolute",
                top: "50%",
                left: "15%",
                transform: "translate(-50%, -50%)",
                width: "60px",
              }}
            >
              <path
                d="M256.113,429.722v74.315c117.312,0,212.329-95.017,212.329-212.329S373.424,79.379,256.113,79.379
	h-69.007V15.68L49.092,116.537l138.014,100.856v-63.699h69.007c76.226,0,138.014,61.788,138.014,138.014
	S332.339,429.722,256.113,429.722z"
              />
              <g>
                <path
                  d="M256.113,121.845c76.226,0,138.014,61.788,138.014,138.014c0,5.394-0.387,10.692-0.989,15.925
		c-7.906-68.713-66.193-122.089-137.025-122.089h-76.969l-0.264-31.849C178.879,121.845,256.113,121.845,256.113,121.845z"
                />
                <polygon points="187.106,217.393 49.092,116.537 70.883,100.612 187.106,185.544 	" />
                <path
                  d="M256.113,472.188c111.936,0,203.362-86.566,211.526-196.405c0.392,5.275,0.804,10.549,0.804,15.925
		c0,117.312-95.017,212.329-212.329,212.329V472.188z"
                />
              </g>
              <path
                d="M256.113,512h-7.962v-90.24h7.962c71.711,0,130.052-58.341,130.052-130.052s-58.341-130.052-130.052-130.052h-61.045v71.417
	L35.596,116.537L195.068,0v71.417h61.045c58.864,0,114.191,22.908,155.787,64.505s64.505,96.922,64.505,155.787
	S453.496,405.899,411.9,447.495S314.977,512,256.113,512z M264.075,437.47v58.454c51.621-1.963,99.857-22.983,136.564-59.69
	c38.59-38.589,59.841-89.916,59.841-144.526s-21.252-105.937-59.841-144.526s-89.916-59.841-144.526-59.841h-76.969V31.361
	L62.587,116.537l116.556,85.176v-55.981h76.969c80.491,0,145.976,65.484,145.976,145.976
	C402.089,369.527,340.876,433.32,264.075,437.47z"
              />
              <rect
                x="120.749"
                y="58.151"
                transform="matrix(-0.6 -0.8 0.8 -0.6 127.5691 259.7092)"
                style={{ fill: "#FFFFFF" }}
                width="15.925"
                height="79.623"
              />
            </svg>
          )}

          {actionForArrowSvg === "up" && (
            <svg
              style={{
                position: "absolute",
                top: "15%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60px",
              }}
              ref={arrowSvg}
              className="svgArrow"
              width="70px"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              enable-background="new 0 0 512 512"
            >
              <polygon points="245,0 74.3,213.3 202.3,213.3 202.3,512 287.7,512 287.7,213.3 415.7,213.3 " />
            </svg>
          )}

          {actionForArrowSvg === "down" && (
            <svg
              style={{
                position: "absolute",
                top: "85%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60px",
              }}
              ref={arrowSvg}
              className="svgArrow"
              width="70px"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              enable-background="new 0 0 512 512"
            >
              <polygon points="283.7,298.7 283.7,0 198.3,0 198.3,298.7 70.3,298.7 241,512 411.7,298.7 " />
            </svg>
          )}
        </div>

        <div className="controls">
          {!firstClick && errorPost === false && (
            <Button
              variant="outlined"
              onClick={handleStartRecording}
              disabled={!isHeadCenter}
            >
              شروع
            </Button>
          )}
        </div>
        <CustomizedDialogs
          open={open}
          isButton
          setOpen={setOpen}
          text={
            "لطفا سر خود را در مرکز تصویر قرار دهید و فقط یک شخص در تصویر باشد"
          }
        />
      </div>
    </>
  );
};

export default ObjectDetection;
