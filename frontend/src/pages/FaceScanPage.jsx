import { useState } from "react";
import { recognizeUser, markAttendance } from "../api";
import { useClassroom } from "../hooks/useClassroom";
import WebcamCapture from "../components/camera/WebcamCapture";

const FaceScanPage = () => {
  const { classroomId } = useClassroom();

  const [userId, setUserId] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!userId || !imageFile) {
      setError("User ID and face image are required");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1️⃣ Face recognition
      const recognition = await recognizeUser(userId, imageFile);

      if (!recognition.verified) {
        setResult({
          status: "FAILED",
          message: "Face not verified",
          distance: recognition.distance,
        });
        return;
      }

      // 2️⃣ Mark attendance
      const attendance = await markAttendance(userId, classroomId);

      setResult({
        status: "SUCCESS",
        message: attendance.message,
        distance: recognition.distance,
      });
    } catch (err) {
      setError(err.message || "Face scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mb-4 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Face Scan & Attendance
          </h1>
          <p className="text-gray-600 text-lg">Verify your identity and mark your attendance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input & Webcam */}
          <div className="space-y-6">
            {/* User ID Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900">User ID</label>
                  <p className="text-xs text-gray-500">Enter your unique identifier</p>
                </div>
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g., student_12345"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-900 placeholder-gray-400 font-medium"
              />
            </div>

            {/* Webcam Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900">Face Capture</label>
                  <p className="text-xs text-gray-500">Position your face in the frame</p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-900">
                <WebcamCapture onCapture={setImageFile} />
              </div>
              {imageFile && (
                <div className="mt-3 flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Image captured successfully</span>
                </div>
              )}
            </div>

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={loading || !userId || !imageFile}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-5 rounded-2xl shadow-2xl hover:shadow-3xl disabled:shadow-none transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg">Scanning...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg">Scan & Mark Attendance</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column - Results & Status */}
          <div className="space-y-6">
            {/* Status Display */}
            {result && (
              <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 ${result.status === "SUCCESS"
                ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                : "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
                } animate-in fade-in slide-in-from-right-5 duration-500`}>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${result.status === "SUCCESS"
                    ? "bg-green-100"
                    : "bg-orange-100"
                    }`}>
                    {result.status === "SUCCESS" ? (
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>

                  <h3 className={`text-2xl font-bold mb-2 ${result.status === "SUCCESS" ? "text-green-900" : "text-orange-900"
                    }`}>
                    {result.status === "SUCCESS" ? "Verification Successful" : "Verification Failed"}
                  </h3>

                  <p className={`text-lg mb-6 ${result.status === "SUCCESS" ? "text-green-700" : "text-orange-700"
                    }`}>
                    {result.message}
                  </p>

                  <div className={`inline-block px-6 py-3 rounded-xl ${result.status === "SUCCESS"
                    ? "bg-green-100 border-2 border-green-300"
                    : "bg-orange-100 border-2 border-orange-300"
                    }`}>
                    <div className="flex items-center space-x-2">
                      <svg className={`w-5 h-5 ${result.status === "SUCCESS" ? "text-green-700" : "text-orange-700"
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className={`font-bold ${result.status === "SUCCESS" ? "text-green-800" : "text-orange-800"
                        }`}>
                        Match Distance: {result.distance?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 animate-in fade-in slide-in-from-right-5 duration-500">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-2">Error Occurred</h3>
                  <p className="text-lg text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Info Card */}
            {!result && !error && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">How it works</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">1</span>
                        <span>Enter your User ID in the field above</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">2</span>
                        <span>Position your face clearly in the webcam frame</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs mt-0.5">3</span>
                        <span>Click the scan button to verify and mark attendance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-bold">Pro Tips</h3>
              </div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Ensure good lighting for accurate recognition</li>
                <li>• Look directly at the camera</li>
                <li>• Remove any face coverings if possible</li>
                <li>• Stay still during the scan process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceScanPage;