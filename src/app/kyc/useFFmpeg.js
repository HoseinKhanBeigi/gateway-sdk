"use client";

import { useState, useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressCompress, setProgress] = useState(0); // Add progress state
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

        // Parse log messages to update progress percentage
        const timeMatch = message.match(/time=\s*(\d+:\d+:\d+)/);
        console.log(timeMatch[1]);
        setProgress(timeMatch[1]);
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

    console.log(inputFile);
    setProgress(0); // Reset progress before starting the transcoding

    // Write the input file to FFmpeg's virtual file system
    await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));

    // Run the FFmpeg command to transcode the video with progress logging
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

    // Read the output file from FFmpeg's virtual file system
    const data = await ffmpeg.readFile("output.mp4");

    // Return the transcoded video as a Blob
    return new Blob([data.buffer], { type: "video/mp4" });
  };

  return {
    loaded,
    isLoading,
    message,
    progressCompress, // Return progress to track it in the UI
    transcode,
  };
}
