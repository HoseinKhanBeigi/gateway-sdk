import react, { useEffect, useRef, useState } from "react";
import loadFaceMesh from "./faceMesh";
export const useFaceMesh = (
  videoRef,
  centerPointOfFace,
  canvasRef,
  containerRef
) => {
  const [positionMessage, setPositionMessage] = useState({
    message: "لطفا سر خود را در مرکز کادر سبز قرار دهید",
    type: "warning",
    position: "",
  }); // Store the current position message

  const previousPosition = useRef(""); // Store the previous position

  useEffect(() => {
    // centerPointOfFace.current.style.stroke = "#00db5e";

    const initializeFaceMesh = async () => {
      try {
        const FaceMesh = await loadFaceMesh();
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 3,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        const onResults = (results) => {
          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            // if (results.multiFaceLandmarks.length > 1) {
            //   // console.log("More than one face detected!");
            // } else if (results.multiFaceLandmarks.length === 1) {
            //   // console.log("One face detected.");
            // }
            const landmarks = results.multiFaceLandmarks[0];
            const faceLandmarks = results.multiFaceLandmarks[0];
            const noseLandmark = faceLandmarks[1]; // Nose tip position
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const faceMinX = Math.min(...faceLandmarks.map((l) => l.x));
            const faceMaxX = Math.max(...faceLandmarks.map((l) => l.x));
            const faceMinY = Math.min(...faceLandmarks.map((l) => l.y));
            const faceMaxY = Math.max(...faceLandmarks.map((l) => l.y));
            const gridWidth = (faceMaxX - faceMinX) / 2;
            const gridHeight = (faceMaxY - faceMinY) / 2;
            const scaleX = canvas.width;
            const scaleY = canvas.height;
            const convertToCanvasCoords = (landmark) => ({
              x: landmark.x * scaleX,
              y: landmark.y * scaleY,
            });

            const nosePosition = convertToCanvasCoords(noseLandmark);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Define grid lines

            // for (let i = 1; i < 2; i++) {
            //   const verticalLineX =
            //     nosePosition.x - gridWidth * scaleX + i * gridWidth * scaleX;

            //   ctx.beginPath();
            //   ctx.moveTo(verticalLineX, faceMinY * scaleY);
            //   ctx.lineTo(verticalLineX, faceMaxY * scaleY);
            //   ctx.strokeStyle = "green";
            //   ctx.lineWidth = 2;
            //   ctx.stroke();
            // }

            let position = {
              message: "سر خود را به سمت اشتباه گرفته اید",
              position: "info",
              type: "warning",
            };

            for (let i = 1; i < 2; i++) {
              const horizontalLineY =
                nosePosition.y - gridHeight * scaleY + i * gridHeight * scaleY;

              const verticalLineX =
                nosePosition.x - gridWidth * scaleX + i * gridWidth * scaleX;

              if (
                horizontalLineY >= 68 &&
                horizontalLineY <= 82 &&
                verticalLineX <= 155 &&
                verticalLineX >= 145
              ) {
                position = {
                  position: "center",
                  message: "صحیح است",
                  type: "success",
                };
                containerRef.current.style.stroke = "#00db5e";
              } else if (verticalLineX > 155) {
                position = {
                  message: "سر خود را به سمت چپ گرفته اید",
                  position: "left",
                  type: "error",
                };
              } else if (verticalLineX < 145) {
                position = {
                  message: "سر خود را به سمت راست گرفته اید",
                  position: "right",
                  type: "error",
                };
              } else if (horizontalLineY > 82) {
                position = {
                  message: "سر خود را به سمت پایین گرفته اید",
                  position: "down",
                  type: "error",
                };
              } else if (horizontalLineY < 68) {
                position = {
                  message: "سر خود را به سمت بالا گرفته اید",
                  position: "up",
                  type: "error",
                };
              }
            }
            let notify = {
              message: "سر خود را به سمت اشتباه گرفته اید",
              position: "info",
              type: "warning",
            };

            // Only update if the position has changed
            if (position.position !== previousPosition.current) {
              previousPosition.current = position.position;
              setPositionMessage(position); // Update the message state
            }

            // for (let i = 1; i < 2; i++) {
            //   const horizontalLineY =
            //     nosePosition.y - gridHeight * scaleY + i * gridHeight * scaleY;

            //   ctx.beginPath();
            //   ctx.moveTo(faceMinX * scaleX, horizontalLineY);
            //   ctx.lineTo(faceMaxX * scaleX, horizontalLineY);
            //   ctx.strokeStyle = "green";
            //   ctx.lineWidth = 2;
            //   ctx.stroke();
            // }
          }
        };

        faceMesh.onResults(onResults);

        video.addEventListener("loadeddata", async () => {
          const detect = async () => {
            await faceMesh.send({ image: video });
            requestAnimationFrame(detect);
          };
          detect();
        });
      } catch (error) {
        console.error(error);
      }
    };

    initializeFaceMesh();
  }, []);

  return { message: positionMessage };
};
