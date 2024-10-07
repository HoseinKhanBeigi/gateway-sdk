"use client";
import React from "react";
import { useSnackbar } from "notistack";

const Notifier = ({ messages }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  React.useEffect(() => {
    messages.forEach((message) => {
      enqueueSnackbar(message.message, {
        variant: message.type,
        anchorOrigin: { vertical: "top", horizontal: "right" },
        onExited: (event, myKey) => {
          // dispatch(clearMessage());
        },
      });
    });
  }, [messages, closeSnackbar, enqueueSnackbar]);

  return null;
};

export default Notifier;
