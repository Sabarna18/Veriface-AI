import { useRef, useState } from "react";

export default function WebcamCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [captured, setCaptured] = useState(false);

  // ---------------- START CAMERA ----------------
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCameraOn(true);
      setCaptured(false);
    } catch (err) {
      alert("Unable to access camera");
      console.error(err);
    }
  }

  // ---------------- STOP CAMERA ----------------
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setCaptured(false);
  }

  // ---------------- CAPTURE IMAGE ----------------
  function capture() {
    if (!cameraOn) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(onCapture, "image/jpeg");
    setCaptured(true);

    // Reset captured state after animation
    setTimeout(() => setCaptured(false), 300);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* CAMERA PREVIEW */}
      <div className="relative w-full">
        {/* Status Indicator */}
        {cameraOn && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg animate-fadeIn">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
          </div>
        )}

        {/* Camera Frame */}
        <div className={`relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-300 ${
          cameraOn 
            ? 'border-purple-500/50 shadow-purple-500/20' 
            : 'border-gray-700'
        } ${captured ? 'scale-[0.97] brightness-150' : 'scale-100'}`}>

          {/* Camera Corner Overlays */}
          {cameraOn && (
            <>
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-[3px] border-l-[3px] border-purple-400/80 rounded-tl-2xl"></div>
                {/* Top Right */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t-[3px] border-r-[3px] border-purple-400/80 rounded-tr-2xl"></div>
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[3px] border-l-[3px] border-purple-400/80 rounded-bl-2xl"></div>
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[3px] border-r-[3px] border-purple-400/80 rounded-br-2xl"></div>
              </div>

              {/* Scanning Line Effect */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan"></div>
              </div>

              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="w-32 h-32 border border-purple-400/40 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400/60 rounded-full"></div>
              </div>
            </>
          )}

          {/* Flash Effect */}
          {captured && (
            <div className="absolute inset-0 bg-white animate-flash pointer-events-none z-20"></div>
          )}

          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Placeholder when camera is off */}
          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="relative">
                <svg className="w-20 h-20 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-red-400 rounded-full"></div>
                  <div className="absolute w-4 h-0.5 bg-red-400 rotate-45"></div>
                </div>
              </div>
              <p className="text-base font-semibold text-gray-300">Camera Inactive</p>
              <p className="text-xs mt-1 text-gray-500">Press start to activate</p>
            </div>
          )}
        </div>

        {/* Capture Guide */}
        {cameraOn && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg animate-fadeIn border border-purple-400/30">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white text-xs font-medium">Align your face in the center</p>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} hidden />

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-2 justify-center w-full">
        <button
          onClick={startCamera}
          disabled={cameraOn}
          className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl font-bold text-sm
            transition-all duration-300 shadow-lg flex items-center justify-center gap-2
            ${cameraOn
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Start Camera</span>
        </button>

        <button
          onClick={capture}
          disabled={!cameraOn}
          className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl font-bold text-sm
            transition-all duration-300 shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group
            ${!cameraOn
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="relative z-10">Capture</span>
        </button>

        <button
          onClick={stopCamera}
          disabled={!cameraOn}
          className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl font-bold text-sm
            transition-all duration-300 shadow-lg flex items-center justify-center gap-2
            ${!cameraOn
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Stop Camera</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flash {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 0.9;
          }
        }

        @keyframes scan {
          0% {
            top: 0;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-flash {
          animation: flash 0.3s ease-out;
        }

        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}