import { useEffect, useRef, useState } from "react";

/**
 * useCamera Hook
 * --------------
 * Handles:
 * - Accessing webcam
 * - Capturing image as Blob
 * - Camera lifecycle (start / stop)
 */
const useCamera = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [error, setError] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(false);

    // Start camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setIsCameraOn(true);
        } catch (err) {
            setError("Unable to access camera");
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraOn(false);
    };

    // Capture image from video
    const captureImage = () => {
        if (!videoRef.current) return null;

        const video = videoRef.current;
        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/jpeg");
        });
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return {
        videoRef,
        startCamera,
        stopCamera,
        captureImage,
        isCameraOn,
        error,
    };
};

export default useCamera;
