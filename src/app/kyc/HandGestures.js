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

const HandGestures = ({ actions, handleGetRecordFile, startPlaySound }) => {
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

  const handleVoiceTrack = (action) => {
    return new Promise((resolve) => {
      let audio;
      if (action === "one") {
        audio = new Audio(`/success.mp3`);
        audio.play();
      } else if (action === "two") {
        audio = new Audio(`/success.mp3`);
        audio.play();
      } else if (action === "three") {
        audio = new Audio(`/success.mp3`);
        audio.play();
      } else if (action === "four") {
        audio = new Audio(`/success.mp3`);
        audio.play();
      } else if (action === "five") {
        audio = new Audio(`/success.mp3`);
        audio.play();
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
      if (cancelSequenceRef.current) {
        console.log("Sequence was interrupted");
        break; // Stop executing further steps if canceled
      }
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
    "chip pendingActive ",
    "chip inactive"
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
        // containerRef.current.style.display = "none";
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
        await new Promise((resolve) => {
          setTimeout(() => {
            setActionForArrowSvg("");
            handleGetRecordFile("", "finish");
            handleStopRecording();
            stopCamera();
            resolve(); // Ensure the step resolves after timeout
          }, 2000); // 1-second delay before resolving
        });
      },
    },
    // {
    //   name: "Step 5",
    //   action: async () => {
    //     stopAnimationForAction(3);
    //     await new Promise((resolve) => {
    //       setTimeout(() => {
    //         setActionForArrowSvg("");
    //         handleGetRecordFile("", "finish");
    //         handleStopRecording();
    //         stopCamera();
    //         resolve(); // Ensure the step resolves after timeout
    //       }, 2000); // 1-second delay before resolving
    //     });
    //   },
    // },
  ];

  // const { message, isMultipleHead } = useFaceMesh(
  //   videoRef,
  //   centerPointOfFace,
  //   canvasRef,
  //   containerRef
  // );
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

  // useEffect(() => {
  //   if (firstClick) {
  //     arrRef.current.push(message.position);

  //     const uniqueArr = [];
  //     const seen = new Set();

  //     for (let i = arrRef.current.length - 1; i >= 0; i--) {
  //       if (!seen.has(arrRef.current[i])) {
  //         uniqueArr.push(arrRef.current[i]);
  //         seen.add(arrRef.current[i]);
  //       }
  //     }
  //     uniqueArr.reverse();
  //     const shortArr = uniqueArr.map((item) => item[0]);
  //     handleGetfrontPredit(shortArr);
  //   }
  // }, [firstClick, message.position]);

  const handleInterrupt = () => {
    stopAnimationForAction(1);
    stopAnimationForAction(2);
    stopAnimationForAction(3);
    stopAnimationForAction(0);
    setActionForArrowSvg("");
    interruptSequence();
    handleStopRecording();
    boxRef.current[0].classList.remove("active");
    boxRef.current[1].classList.remove("active");
    boxRef.current[2].classList.remove("active");
    // boxRef.current[3].classList.remove("active");
    setFirstClick(false);
    setInterruptDialogOpen(false);
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleStartAction = () => {
    setIsHeadCenter(true);
    // You can perform your custom action here
  };
  return (
    <>
      <div
        className="chipContainer"
        style={{ justifyContent: "space-between" }}
      >
        {actions.map((element, i) => (
          <div className="chip" key={i} ref={(el) => (boxRef.current[i] = el)}>
            <img style={{ width: "50px" }} src={`/${element.action}.png`} />
            {/* <div class="chip-content"> {element.title}</div> */}
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
          {/* 
          <FaceSvg
            ref={containerRef}
            // firstStepIsCenterIsCompleted={firstStepIsCenterIsCompleted}
          /> */}
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
          {!open && <Countdown onComplete={handleStartAction} />}
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
        {/* {multipleHeadWarning} */}
        <CustomizedDialogs
          isButton
          open={interruptDialogOpen}
          setOpen={setInterruptDialogOpen}
          handleOpen={handleInterrupt}
          text={"بیش از یک سر در تصویر است لطفا مجدد شروع بفرمایید. "}
        />
      </div>
      {/* {!isHeadCenter && <Notifier messages={[notify]} />} */}
    </>
  );
};

export default HandGestures;
