import { useState } from "react";
import { registerUser } from "../api";
import { useClassroom } from "../hooks/useClassroom";

const RegisterUserPage = () => {
  const { classroomId } = useClassroom();

  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------

  const [userId, setUserId] = useState("");

  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(null);

  const [error, setError] = useState(null);

  const [processingStage, setProcessingStage] = useState("");

  const [registrationData, setRegistrationData] = useState(null);

  // ---------------------------------------------------
  // REGISTER USER
  // ---------------------------------------------------

  const handleRegister = async () => {
    if (!userId || !imageFile) {
      setError("User ID and face image are required");

      return;
    }

    setLoading(true);

    setError(null);

    setMessage(null);

    setRegistrationData(null);

    try {
      // ---------------------------------------------------
      // STAGE 1
      // ---------------------------------------------------

      setProcessingStage("Uploading face image...");

      // ---------------------------------------------------
      // STAGE 2
      // ---------------------------------------------------

      setProcessingStage("Generating facial embedding...");

      const response = await registerUser(userId, classroomId, imageFile);

      // ---------------------------------------------------
      // STAGE 3
      // ---------------------------------------------------

      setProcessingStage("Embedding stored successfully");

      setRegistrationData(response);

      setMessage(`User ${response.user_id} registered successfully`);

      // reset form
      setUserId("");

      setImageFile(null);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);

      setTimeout(() => {
        setProcessingStage("");
      }, 1200);
    }
  };

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Register New User
          </h1>

          <p className="text-gray-600">
            Add a new user to the biometric attendance system
          </p>
        </div>

        {/* ================================================= */}
        {/* MAIN CARD */}
        {/* ================================================= */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 space-y-6">
            {/* ================================================= */}
            {/* USER ID */}
            {/* ================================================= */}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                User ID
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900 placeholder-gray-400 disabled:bg-gray-100"
              />
            </div>

            {/* ================================================= */}
            {/* IMAGE UPLOAD */}
            {/* ================================================= */}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Face Image
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="file"
                accept="image/*"
                disabled={loading}
                onChange={(e) => setImageFile(e.target.files[0] || null)}
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center w-full px-4 py-4 border-2 border-dashed rounded-xl transition-all group
                ${
                  loading
                    ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                }`}
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>

                <span className="text-gray-600 font-medium">
                  {imageFile ? imageFile.name : "Click to upload image"}
                </span>
              </label>
            </div>

            {/* ================================================= */}
            {/* IMAGE PREVIEW */}
            {/* ================================================= */}

            {imageFile && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Face Preview
                </label>

                <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-full h-72 object-contain"
                  />

                  {!loading && (
                    <button
                      onClick={() => setImageFile(null)}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <svg
                        className="w-5 h-5"
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
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* PROCESSING STATUS */}
            {/* ================================================= */}

            {loading && processingStage && (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
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
            {/* REGISTER BUTTON */}
            {/* ================================================= */}

            <div className="pt-2">
              <button
                onClick={handleRegister}
                disabled={loading || !userId || !imageFile}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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

                    <span>{processingStage || "Registering..."}</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>

                    <span>Register User</span>
                  </>
                )}
              </button>
            </div>

            {/* ================================================= */}
            {/* SUCCESS */}
            {/* ================================================= */}

            {message && registrationData && (
              <div className="rounded-xl bg-green-50 border-2 border-green-200 p-5 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600"
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

                <div className="flex-1 space-y-2">
                  <p className="text-green-800 font-semibold">{message}</p>

                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      Embedding Model:
                      <span className="font-medium ml-1">
                        {registrationData.embedding_model}
                      </span>
                    </p>

                    <p>
                      Embedding Version:
                      <span className="font-medium ml-1">
                        {registrationData.embedding_version}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* INFO CARD */}
        {/* ================================================= */}

        <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Registration Guidelines
              </h3>

              <ul className="text-sm text-blue-700 space-y-1 list-disc ml-4">
                <li>Ensure only one face is visible</li>

                <li>Face should occupy most of the frame</li>

                <li>Avoid blurry or dark images</li>

                <li>Remove sunglasses or masks</li>

                <li>Supported formats: JPG, PNG</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUserPage;
