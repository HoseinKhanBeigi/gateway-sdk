import React, { useEffect, useRef, useState } from "react";

export const useStartTransitionBoxShadow = (
  removeToggleForBoxShadow,
  containerRef
) => {
  let start;
  let box = "";
  const isActiveRef = useRef(false);
  const boxShadowDown = useRef("0px 90px 80px -28px #007bff");
  const boxShadowUp = useRef("0px -90px 80px -28px #007bff");
  const boxShadowRight = useRef("90px 0px 80px -28px #007bff");
  const boxShadowLeft = useRef("-90px 0px 80px -28px #007bff");
  return (boxShadow) => {
    const toggleClass = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed >= 500) {
        if (boxShadow === "left") {
          box = boxShadowLeft.current;
        }
        if (boxShadow === "right") {
          box = boxShadowRight.current;
        }
        if (boxShadow === "up") {
          box = boxShadowUp.current;
        }
        if (boxShadow === "down") {
          box = boxShadowDown.current;
        }

        isActiveRef.current = !isActiveRef.current;
        if (containerRef.current) {
          containerRef.current.style.boxShadow = isActiveRef.current
            ? box
            : "0px 0px 29px -28px transparent";
        }
        start = timestamp; // Reset the start time
      }

      // Request the next frame
      removeToggleForBoxShadow.current = requestAnimationFrame(toggleClass);
    };

    // Start the animation
    removeToggleForBoxShadow.current = requestAnimationFrame(toggleClass);
  };
};

export const useStopTransitionBoxShadow = (
  removeToggleForBoxShadow,
  containerRef
) => {
  return () => {
    if (removeToggleForBoxShadow.current) {
      cancelAnimationFrame(removeToggleForBoxShadow.current);
      containerRef.current.style.boxShadow = "0px 0px 29px -28px transparent";
    }
  };
};
