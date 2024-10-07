import React, { useState, useEffect } from "react";

export const Countdown = ({ onComplete }) => {
  const [count, setCount] = useState(3); // Start the countdown at 3

  useEffect(() => {
    // If the count is greater than 0, set a timeout to decrease it
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000); // Decrease the count every 1 second
      return () => clearTimeout(timer); // Clean up the timer
    } else {
      // Call the onComplete function when the countdown reaches 0
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div
      style={{
        zIndex: "200",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <h1>{count > 0 && count}</h1>{" "}
    </div>
  );
};
