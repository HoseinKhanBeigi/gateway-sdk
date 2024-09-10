"use client";
import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Image from "next/image";

import { FaceSvg } from "./faceSvg";
import {
  usePlayTransitionColorForActions,
  useStopTransitionColorForActions,
  usePlayTransitionColorForActions2,
  useStopTransitionColorForActions2,
} from "./useTransitionForActions";
import "./ObjectDetection.scss";
import { useVideRecording } from "./useVideoRecording";

const ObjectDetection = ({ actions, handleGetRecordFile, startPlaySound }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const arrowSvg = useRef("");

  const [firstClick, setFirstClick] = useState(false);
  const [firstStepIsCenterIsCompleted, setFirstStepIsCenterIsCompleted] =
    useState(false);
  const removeToggleForArrowSvgUp = useRef();
  const removeToggleForArrowSvgDown = useRef();
  const removeToggleForArrowSvgLeft = useRef();
  const removeToggleForArrowSvgRight = useRef();
  const removeToggle = useRef();
  const videoContainer = useRef("");
  const boxRef = useRef([]);
  const streamRef = useRef();
  const mediaRecorderRef = useRef(null);
  const [errorPost, setErrorPost] = useState(false);
  const [actionForArrowSvg, setActionForArrowSvg] = useState("");

  const handleVoiceTrack = (action) => {
    if (action === "center") {
      const audio = new Audio(`/center.mp3`);
      audio.play();
    } else if (action === "left") {
      const audio = new Audio(`/nowLeft.mp3`);
      audio.play();
      setActionForArrowSvg("left");
      startAnimationArrowLeft();
    } else if (action === "right") {
      const audio = new Audio(`/pleaseRight.mp3`);
      audio.play();
      setActionForArrowSvg("right");
      startAnimationArrowRight();
    } else if (action === "up") {
      setActionForArrowSvg("up");
      startAnimationArrowUp();
      const audio = new Audio(`/pleaseUp.mp3`);
      audio.play();
    } else if (action === "down") {
      const audio = new Audio(`/nowDown.mp3`);
      audio.play();
      setActionForArrowSvg("down");
      startAnimationArrowDown();
    }
  };

  const handleSequencesForJustHint = (steps) => {
    const executeStep = (index) => {
      if (index >= steps.length) {
        return Promise.resolve();
      }

      const step = steps[index];
      return new Promise((resolve) => {
        step.action();
        setTimeout(() => {
          resolve();
        }, 4000);
      }).then(() => executeStep(index + 1));
    };
    setTimeout(() => {
      return executeStep(0);
    }, 0);
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
      action: () => {
        startAnimationForAction(0);
        handleVoiceTrack(actions[0].action);
      },
    },
    {
      name: "Step 2",
      action: () => {
        containerRef.current.style.display = "none";
        stopAnimationForAction(0);
        startAnimationForAction(1);
        setFirstStepIsCenterIsCompleted("finish");
        handleVoiceTrack(actions[1].action);
      },
    },
    {
      name: "Step 3",
      action: () => {
        stopAnimationForAction(1);
        startAnimationForAction(2);
        handleVoiceTrack(actions[2].action);
      },
    },
    {
      name: "Step 4",
      action: () => {
        stopAnimationForAction(2);
        startAnimationForAction(3);
        handleVoiceTrack(actions[3].action);
      },
    },
    {
      name: "Step 5",
      action: () => {
        stopAnimationForAction(3);
        setTimeout(() => {
          setActionForArrowSvg("");
          handleStopRecording();
          stopCamera();
        }, 1000);
      },
    },
  ];

  const { startVideo, stopCamera, startRecording } = useVideRecording(
    videoRef,
    streamRef,
    mediaRecorderRef
  );

  useEffect(() => {
    startVideo();
  }, []);

  const handleStartRecording = () => {
    startPlaySound.pause();
    setFirstClick(true);

    startRecording(streamRef.current, mediaRecorderRef, handleGetRecordFile);
    handleSequencesForJustHint(stepsSequences);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
  };

  return (
    <>
      {/* <div
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "center",
          marginTop: "30px",
        }}
      >
        {" "}
        حرکت های مورد انتظار
      </div> */}
      <div className="chipContainer">
        <div className="chip" ref={(el) => (boxRef.current[0] = el)}>
          <div class="chip-content"> {actions[0].title}</div>
        </div>
        <div class="chip" ref={(el) => (boxRef.current[1] = el)}>
          <div class="chip-content">{actions[1].title}</div>
        </div>
        <div class="chip" ref={(el) => (boxRef.current[2] = el)}>
          <div class="chip-content">{actions[2].title}</div>
        </div>
        <div class="chip" ref={(el) => (boxRef.current[3] = el)}>
          <div class="chip-content">{actions[3].title}</div>
        </div>
      </div>
      <div>
        <div className="video-container" ref={videoContainer}>
          <video ref={videoRef} width="640" height="780" playsinline={true} />
          <FaceSvg
            ref={containerRef}
            firstStepIsCenterIsCompleted={firstStepIsCenterIsCompleted}
          />
          {/* <Image
            style={{
              position: "absolute",
              top: "50%",
              left: "15%",
              transform: "translate(-50%, -50%)",
              // boxShadow: "0px 0px 78px 40px rgba(134, 212, 255, 1)",
            }}
            src="/turnLeft.svg"
            width={40}
            height={40}
            alt="Picture of the author"
          /> */}
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
          {/* <Image
            style={{
              position: "absolute",
              top: "85%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              // boxShadow: "0px 0px 78px 40px rgba(134, 212, 255, 1)",
            }}
            src="/turnDown.svg"
            width={40}
            height={40}
            alt="Picture of the author"
          /> */}
        </div>
        {/* <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="228"
          height="109.001"
          viewBox="0 0 118 130"
          style={{
            // display: "none",
            position: "absolute",

            top: "47%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "220px",
            border: "1px solid transparent",
            // borderRadius: "100%",
          }}
          xmlSpace="preserve"
        >
          <line
            x1="0.25"
            y1="0.25"
            x2="46"
            y2="0.25"
            stroke="black"
            stroke-width="0.5"
          />
          <line
            x1="76.88"
            y1="0.25"
            x2="122.38"
            y2="0.25"
            stroke="black"
            stroke-width="0.5"
          />
          <line
            x1="0.25"
            y1="113.38"
            x2="46"
            y2="113.38"
            stroke="black"
            stroke-width="0.5"
          />
          <line
            x1="76.88"
            y1="113.38"
            x2="122.38"
            y2="113.38"
            stroke="black"
            stroke-width="0.5"
          />

          <line
            x1="0.25"
            y1="0.25"
            x2="0.25"
            y2="46"
            stroke="black"
            stroke-width="0.5"
          />
          <line
            x1="0.25"
            y1="76.88"
            x2="0.25"
            y2="113.38"
            stroke="black"
            stroke-width="0.5"
          />

          <line
            x1="122.38"
            y1="0.25"
            x2="122.38"
            y2="46"
            stroke="black"
            stroke-width="0.5"
          />
          <line
            x1="122.38"
            y1="76.88"
            x2="122.38"
            y2="113.38"
            stroke="black"
            stroke-width="0.5"
          />
        </svg> */}
        <div className="controls">
          {!firstClick && errorPost === false && (
            <Button
              variant="outlined"
              onClick={handleStartRecording}
              // disabled={startAfterLoadMediPipe}
            >
              شروع
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ObjectDetection;
