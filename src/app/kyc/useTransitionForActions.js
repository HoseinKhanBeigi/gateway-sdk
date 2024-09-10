import { useRef } from "react";

export const usePlayTransitionColorForActions = (
  removeToggle,
  boxRef,
  pendingActiveClass,
  inactiveClass
) => {
  const isActiveRef = useRef();
  return (id) => {
    let start;
    const toggleClass = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      if (elapsed >= 500) {
        isActiveRef.current = !isActiveRef.current;
        if (boxRef.current[id]) {
          boxRef.current[id].className = isActiveRef.current
            ? pendingActiveClass
            : inactiveClass;
        }
        start = timestamp; // Reset the start time
      }

      // Request the next frame
      removeToggle.current = requestAnimationFrame(toggleClass);
    };

    // Start the animation
    removeToggle.current = requestAnimationFrame(toggleClass);
  };
};

export const useStopTransitionColorForActions = (
  removeToggle,
  boxRef,
  active
) => {
  return (id) => {
    if (removeToggle.current) {
      cancelAnimationFrame(removeToggle.current);
      boxRef.current[id].className = active;
    }
  };
};

export const usePlayTransitionColorForActions2 = (
  removeToggle,
  boxRef,
  pendingActiveClass,
  inactiveClass
) => {
  const isActiveRef = useRef();
  return () => {
    let start;
    const toggleClass = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      if (elapsed >= 500) {
        isActiveRef.current = !isActiveRef.current;
        if (boxRef.current) {
          boxRef.current.setAttribute(
            "class",
            isActiveRef.current ? pendingActiveClass : inactiveClass
          );
        }
        start = timestamp; // Reset the start time
      }

      // Request the next frame
      removeToggle.current = requestAnimationFrame(toggleClass);
    };

    // Start the animation
    removeToggle.current = requestAnimationFrame(toggleClass);
  };
};

export const useStopTransitionColorForActions2 = (
  removeToggle,

  active
) => {
  return (boxRef) => {
    console.log(boxRef.current);
    if (removeToggle.current) {
      if (boxRef.current.getAttribute("class")) {
        boxRef.current.removeAttribute("class");
      } else {
        boxRef.current.setAttribute("class", active);
      }
    }
  };
};
