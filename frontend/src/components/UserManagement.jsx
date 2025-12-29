import { useState } from "react";
import { getUser, deleteUser, deleteAllUsers } from "../api";

export default function UserManagement() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchUser() {
    if (!userId) return;
    setLoading(true);
    try {
      setData(await getUser(userId));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!userId) return;
    if (!confirm(`Delete user "${userId}"?`)) return;
    await deleteUser(userId);
    setData(null);
    alert("User deleted");
  }

  async function handleDeleteAll() {
    if (!confirm("⚠️ Delete ALL users? This cannot be undone.")) return;
    await deleteAllUsers();
    setData(null);
    setUserId("");
    alert("All users deleted");
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 mt-6 transition-all duration-300 hover:shadow-2xl">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            User Management
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">View, search, and manage user profiles</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search User
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Enter User ID to search"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchUser()}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl
                     focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                     transition-all duration-200 text-gray-900 placeholder-gray-400
                     font-medium shadow-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={fetchUser}
          disabled={!userId || loading}
          className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl text-white font-semibold
            transition-all duration-300 shadow-md flex items-center justify-center gap-2
            ${
              !userId || loading
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Get User</span>
            </>
          )}
        </button>

        <button
          onClick={handleDeleteUser}
          disabled={!userId}
          className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl text-white font-semibold
            transition-all duration-300 shadow-md flex items-center justify-center gap-2
            ${
              !userId
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete User</span>
        </button>

        <button
          onClick={handleDeleteAll}
          className="flex-1 min-w-[140px] px-6 py-3 rounded-xl text-white font-semibold
                     bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950
                     transition-all duration-300 shadow-md hover:shadow-lg
                     flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]
                     border-2 border-red-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Delete All</span>
        </button>
      </div>

      {/* Warning Banner for Delete All */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Caution</p>
            <p className="text-xs text-amber-700 mt-1">
              Delete All will permanently remove all user data. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Data Display */}
      {data && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner animate-fadeIn">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h4 className="font-bold text-gray-900">User Data</h4>
            </div>
            <button
              onClick={() => setData(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg p-5 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No user data to display</p>
          <p className="text-sm text-gray-400 mt-1">Enter a User ID and click "Get User" to view details</p>
        </div>
      )}
    </div>
  );
}