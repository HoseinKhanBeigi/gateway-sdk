"use client";

import { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressCompress, setProgress] = useState(0); // Track progress
  const [message, setMessage] = useState("");
  const ffmpegRef = useRef(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      setIsLoading(true);
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      // Handle FFmpeg log events to show messages and track progress
      ffmpeg.on("log", ({ message }) => {
        setMessage(message);

        // Progress estimation based on FFmpeg log output (extracting percentage)
        const timeMatch = message.match(/time=(\d+:\d+:\d+.\d+)/);
        if (timeMatch) {
          const [hours, minutes, seconds] = timeMatch[1].split(":");
          const totalSeconds =
            +hours * 3600 + +minutes * 60 + parseFloat(seconds);
          // Here, replace `estimatedTotalDuration` with the estimated duration in seconds of the input file
          const progress = (totalSeconds / estimatedTotalDuration) * 100;
          setProgress(progress);
        }
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      setLoaded(true);
      setIsLoading(false);
    };

    loadFFmpeg();
  }, []);

  const transcode = async (inputFile) => {
    const ffmpeg = ffmpegRef.current;
    setProgress(0); // Reset progress before starting transcoding

    // Load the file as an ArrayBuffer
    const arrayBuffer = await fetchFile(inputFile);

    // Write the ArrayBuffer to FFmpeg's virtual filesystem
    await ffmpeg.writeFile("input.mp4", new Uint8Array(arrayBuffer));

    // Run FFmpeg command to transcode video with logging enabled
    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vcodec",
      "libx264",
      "-crf",
      "28",
      "-preset",
      "fast",
      "-vf",
      "scale=640:-2", // Resize to 640px width
      "-b:v",
      "1000k", // Set video bitrate
      "output.mp4",
    ]);

    // Read the output file from FFmpeg's virtual filesystem
    const outputData = await ffmpeg.readFile("output.mp4");

    // Create a Blob from the transcoded video data
    return new Blob([outputData.buffer], { type: "video/mp4" });
  };

  return {
    loaded,
    isLoading,
    message,
    progressCompress, // Return progress to track it in the UI
    transcode,
  };
}
