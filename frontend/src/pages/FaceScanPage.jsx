import { useState } from "react";

import { recognizeUser, markAttendance } from "../api";

import { useClassroom } from "../hooks/useClassroom";

import WebcamCapture from "../components/camera/WebcamCapture";

const FaceScanPage = () => {
  const { classroomId } = useClassroom();

  // =================================================
  // STATE
  // =================================================

  const [userId, setUserId] = useState("");

  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState(null);

  const [processingStage, setProcessingStage] = useState("");

  // =================================================
  // FACE VERIFICATION
  // =================================================

  const handleScan = async () => {
    if (!userId || !imageFile) {
      setError("User ID and face image are required");

      return;
    }

    setLoading(true);

    setError(null);

    setResult(null);

    try {
      // =================================================
      // STEP 1 — GENERATE EMBEDDING
      // =================================================

      setProcessingStage("Generating facial embedding...");

      // =================================================
      // STEP 2 — VERIFY FACE
      // =================================================

      setProcessingStage("Verifying identity...");

      const recognition = await recognizeUser(userId, imageFile);

      // =================================================
      // OUTDATED EMBEDDING
      // =================================================

      if (recognition.reason === "OUTDATED_EMBEDDING") {
        setResult({
          status: "OUTDATED",

          message:
            "Face data outdated. Please contact administrator for re-registration.",

          requiredVersion: recognition.required_version,

          currentVersion: recognition.current_version,
        });

        return;
      }

      // =================================================
      // VERIFICATION FAILED
      // =================================================

      if (!recognition.verified) {
        setResult({
          status: "FAILED",

          message: recognition.reason || "Face verification failed",

          distance: recognition.distance,

          threshold: recognition.threshold,
        });

        return;
      }

      // =================================================
      // STEP 3 — MARK ATTENDANCE
      // =================================================

      setProcessingStage("Marking attendance...");

      const attendance = await markAttendance(userId, classroomId);

      // =================================================
      // SUCCESS
      // =================================================

      setResult({
        status: "SUCCESS",

        message: attendance.message,

        distance: recognition.distance,

        threshold: recognition.threshold,

        embeddingVersion: recognition.embedding_version,

        model: recognition.model,
      });
    } catch (err) {
      setError(err.message || "Face verification failed");
    } finally {
      setLoading(false);

      setTimeout(() => {
        setProcessingStage("");
      }, 1200);
    }
  };

  // =================================================
  // UI
  // =================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Face Verification
          </h1>

          <p className="text-gray-600 text-lg">
            Verify identity and mark attendance
          </p>
        </div>

        {/* ================================================= */}
        {/* GRID */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="space-y-6">
            {/* ================================================= */}
            {/* USER ID */}
            {/* ================================================= */}

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900">
                    User ID
                  </label>

                  <p className="text-xs text-gray-500">
                    Enter your registered ID
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={userId}
                disabled={loading}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. student_123"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-900 placeholder-gray-400 font-medium disabled:bg-gray-100"
              />
            </div>

            {/* ================================================= */}
            {/* WEBCAM */}
            {/* ================================================= */}

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900">
                    Face Scanner
                  </label>

                  <p className="text-xs text-gray-500">
                    Position face inside frame
                  </p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 bg-black">
                <WebcamCapture onCapture={setImageFile} />
              </div>

              {imageFile && (
                <div className="mt-3 flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                  <span className="font-medium">
                    Face captured successfully
                  </span>
                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* PROCESSING */}
            {/* ================================================= */}

            {loading && processingStage && (
              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                <div className="flex items-center space-x-3">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 
                      0 0 5.373 0 12h4z"
                    />
                  </svg>

                  <p className="text-blue-800 font-medium">{processingStage}</p>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* BUTTON */}
            {/* ================================================= */}

            <button
              onClick={handleScan}
              disabled={loading || !userId || !imageFile}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-5 rounded-2xl shadow-2xl hover:shadow-3xl disabled:shadow-none transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 
                      0 0 5.373 0 12h4z"
                    />
                  </svg>

                  <span className="text-lg">
                    {processingStage || "Scanning..."}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <span className="text-lg">Verify & Mark Attendance</span>
                </>
              )}
            </button>
          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="space-y-6">
            {/* ================================================= */}
            {/* SUCCESS */}
            {/* ================================================= */}

            {result?.status === "SUCCESS" && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    Verification Successful
                  </h3>

                  <p className="text-lg text-green-700 mb-6">
                    {result.message}
                  </p>

                  <div className="space-y-3 text-sm text-green-800">
                    <p>
                      Match Distance:
                      <span className="font-bold ml-1">
                        {result.distance?.toFixed(4)}
                      </span>
                    </p>

                    <p>
                      Threshold:
                      <span className="font-bold ml-1">{result.threshold}</span>
                    </p>

                    <p>
                      Embedding Model:
                      <span className="font-bold ml-1">{result.model}</span>
                    </p>

                    <p>
                      Embedding Version:
                      <span className="font-bold ml-1">
                        {result.embeddingVersion}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* FAILED */}
            {/* ================================================= */}

            {result?.status === "FAILED" && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01"
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-orange-900 mb-2">
                    Verification Failed
                  </h3>

                  <p className="text-lg text-orange-700 mb-4">
                    {result.message}
                  </p>

                  {result.distance && (
                    <p className="text-orange-800 font-medium">
                      Distance: {result.distance.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* OUTDATED */}
            {/* ================================================= */}

            {result?.status === "OUTDATED" && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-yellow-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01"
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-yellow-900 mb-3">
                    Re-Registration Required
                  </h3>

                  <p className="text-yellow-800">{result.message}</p>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                    <svg
                      className="w-10 h-10 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-red-900 mb-2">
                    Verification Error
                  </h3>

                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* GUIDE */}
            {/* ================================================= */}

            {!result && !error && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Verification Guidelines
                </h3>

                <ul className="space-y-3 text-sm text-gray-600">
                  <li>• Look directly into the camera</li>

                  <li>• Ensure only one face is visible</li>

                  <li>• Maintain proper lighting</li>

                  <li>• Keep face centered inside frame</li>

                  <li>• Avoid masks or sunglasses</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceScanPage;
