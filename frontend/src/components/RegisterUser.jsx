import { useState } from "react";
import { registerUser } from "../api";

export default function RegisterUser() {
  const [userId, setUserId] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleRegister() {
    if (!userId || !image) {
      alert("User ID and image are required");
      return;
    }

    setLoading(true);
    await registerUser(userId, image);
    setLoading(false);

    alert("User registered successfully");

    // Reset state
    setUserId("");
    setImage(null);
    setPreview(null);
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Register New User
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Create a new user profile with facial recognition</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Enter unique User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl
                     focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100
                     transition-all duration-200 text-gray-900 placeholder-gray-400
                     font-medium shadow-sm"
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Face Image
        </label>
        <div className="relative group">
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer
                     bg-white hover:bg-gray-50 hover:border-green-400 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {image ? image.name : "Click to upload image"}
              </p>
              <p className="text-xs text-gray-500">
                JPG or PNG format • Max 10MB
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="mb-6 bg-white rounded-xl p-5 border-2 border-gray-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-gray-700">Image Preview</p>
            </div>
            <button
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex justify-center">
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-xl border-4 border-gray-100 shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      )}

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={!userId || !image || loading}
        className={`relative w-full py-4 rounded-xl text-white font-bold text-lg
          transition-all duration-300 shadow-lg overflow-hidden group
          ${
            !userId || !image || loading
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Registering User...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Register User</span>
            </>
          )}
        </span>
        {!loading && image && userId && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        )}
      </button>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">Registration Tips</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use a clear, front-facing photo with good lighting</li>
              <li>• Ensure the face is clearly visible without obstructions</li>
              <li>• User ID must be unique for each individual</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}