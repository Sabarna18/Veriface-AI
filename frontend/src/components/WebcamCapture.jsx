import { useRef, useState } from "react";

export default function WebcamCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null); // ✅ store stream
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
    <div className="flex flex-col items-center gap-6">
      {/* CAMERA PREVIEW */}
      <div className="relative w-full max-w-2xl">
        {/* Status Indicator */}
        {cameraOn && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full animate-fadeIn">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-semibold">LIVE</span>
          </div>
        )}

        {/* Camera Frame */}
        <div className={`relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
          cameraOn ? 'border-indigo-500 shadow-indigo-500/20' : 'border-gray-700'
        } ${captured ? 'scale-[0.98]' : 'scale-100'}`}>
          
          {/* Camera Overlay Effect */}
          {cameraOn && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-indigo-400 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-indigo-400 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-indigo-400 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-indigo-400 rounded-br-2xl"></div>
            </div>
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-semibold">Camera Off</p>
              <p className="text-sm mt-1">Click "Start Camera" to begin</p>
            </div>
          )}
        </div>

        {/* Capture Guide */}
        {cameraOn && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full animate-fadeIn">
            <p className="text-white text-xs font-medium">Position your face within the frame</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} hidden />

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 justify-center w-full max-w-2xl">
        <button
          onClick={startCamera}
          disabled={cameraOn}
          className={`flex-1 min-w-[160px] px-6 py-3.5 rounded-xl font-bold text-base
            transition-all duration-300 shadow-lg flex items-center justify-center gap-2
            ${
              cameraOn
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Start Camera</span>
        </button>

        <button
          onClick={capture}
          disabled={!cameraOn}
          className={`flex-1 min-w-[160px] px-6 py-3.5 rounded-xl font-bold text-base
            transition-all duration-300 shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group
            ${
              !cameraOn
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="relative z-10">Capture</span>
          {cameraOn && (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          )}
        </button>

        <button
          onClick={stopCamera}
          disabled={!cameraOn}
          className={`flex-1 min-w-[160px] px-6 py-3.5 rounded-xl font-bold text-base
            transition-all duration-300 shadow-lg flex items-center justify-center gap-2
            ${
              !cameraOn
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Stop Camera</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="w-full max-w-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">Camera Tips</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Ensure good lighting for better image quality</li>
              <li>• Position your face centered in the frame</li>
              <li>• Remove glasses or face coverings for best results</li>
            </ul>
          </div>
        </div>
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
            opacity: 0.8;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-flash {
          animation: flash 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}