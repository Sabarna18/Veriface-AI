import { useState } from "react";
import WebcamCapture from "./WebcamCapture";
import { recognizeUser, markAttendance } from "../api";
import AttendanceTable from "./AttendanceTable";

export default function RecognizeUser({onAttendanceMarked}) {
  const [userId, setUserId] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleRecognize() {
    if (!image || !userId) return;

    setLoading(true);

    try {
      const res = await recognizeUser(userId, image);
      setResult(res);

      // ✅ Verified identity → mark attendance
      if (res.verified) {
        await markAttendance(userId);
        onAttendanceMarked?.()
      }
    } finally {
      setLoading(false);
      
    }
  }

  const isVerified = result?.verified === true;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 mt-6 transition-all duration-300 hover:shadow-2xl">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Identity Verification
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Verify your identity and mark attendance</p>
        </div>
      </div>

      {/* User ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          User ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Enter your User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl
                     focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                     transition-all duration-200 text-gray-900 placeholder-gray-400
                     font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Webcam Capture Section */}
      <div className="mb-6 bg-white rounded-xl p-4 border-2 border-dashed border-gray-200">
        <WebcamCapture
          onCapture={setImage}
          disabled={!userId}
        />
      </div>

      {/* Verify Button */}
      <button
        onClick={handleRecognize}
        disabled={!image || !userId || loading}
        className={`relative w-full py-4 rounded-xl text-white font-bold text-lg
          transition-all duration-300 shadow-lg overflow-hidden group
          ${
            !image || !userId || loading
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verifying Identity...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verify & Mark Attendance</span>
            </>
          )}
        </span>
        {!loading && image && userId && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        )}
      </button>

      {/* Result Box */}
      {result && (
        <div
          className={`mt-6 rounded-xl overflow-hidden border-2 transition-all duration-300 animate-fadeIn
            ${
              isVerified
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg shadow-green-100"
                : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300 shadow-lg shadow-red-100"
            }`}
        >
          <div className={`px-6 py-4 flex items-start gap-3 ${
            isVerified ? "bg-green-500" : "bg-red-500"
          }`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center">
              {isVerified ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold text-lg">
                {isVerified ? "Verification Successful" : "Verification Failed"}
              </h4>
              <p className="text-white text-sm opacity-90 mt-0.5">
                {isVerified 
                  ? "Identity verified. Attendance has been marked successfully." 
                  : "Face does not match the provided User ID. Please try again."}
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <details className="cursor-pointer group">
              <summary className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2 hover:text-gray-900">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Technical Details
              </summary>
              <pre className="mt-3 p-4 bg-white rounded-lg text-xs font-mono text-gray-600 overflow-x-auto border border-gray-200 shadow-inner">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}