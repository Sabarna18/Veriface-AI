import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    listClassrooms,
    createClassroom,
    deleteClassroom,
} from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";




/**
 * ClassroomListPage
 * -----------------
 * Displays list of available classrooms
 * Allows creating and deleting classrooms
 */
const ClassroomListPage = () => {

    const pageTheme = {
        normal: {
            pageBg: "bg-gradient-to-br from-indigo-50 via-white to-purple-50",
            card: "bg-white border-gray-100",
            heading: "text-gray-900",
            subText: "text-gray-600",
            adminBar: "bg-emerald-50 border-emerald-200 text-emerald-700",
        },
        admin: {
            // VERY subtle darkening – still bright
            pageBg: "bg-gradient-to-br from-slate-400 via-white to-indigo-500",

            // Cards slightly tinted instead of dark
            card: "bg-indigo-50/60 border-indigo-200",

            // Text stays readable
            heading: "text-gray-900",
            subText: "text-gray-700",

            // Admin bar feels “special” but not heavy
            adminBar: "bg-indigo-100 border-indigo-300 text-indigo-800",
        },
    };



    const navigate = useNavigate();
    const { isAdmin, isAuthenticated, logout } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [newClassroomId, setNewClassroomId] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    const theme = isAuthenticated && isAdmin
        ? pageTheme.admin
        : pageTheme.normal;


    // ------------------ LOAD CLASSROOMS ------------------

    const loadClassrooms = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await listClassrooms();
            setClassrooms(res.classrooms || []);
        } catch (err) {
            setError(err.message || "Failed to load classrooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClassrooms();
    }, []);

    // ------------------ CREATE CLASSROOM ------------------

    const handleCreateClassroom = async () => {
        if (!newClassroomId.trim()) {
            alert("Classroom ID cannot be empty");
            return;
        }

        setCreating(true);
        setError(null);

        try {
            await createClassroom(newClassroomId.trim());
            setNewClassroomId("");
            await loadClassrooms();
        } catch (err) {
            setError(err.message || "Failed to create classroom");
        } finally {
            setCreating(false);
        }
    };

    // ------------------ DELETE CLASSROOM ------------------

    const handleDeleteClassroom = async (classroomId) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete classroom "${classroomId}"?\n\nThis will delete ALL users and attendance records.`
        );

        if (!confirmed) return;

        setDeletingId(classroomId);
        setError(null);

        try {
            await deleteClassroom(classroomId);
            await loadClassrooms();
        } catch (err) {
            setError(err.message || "Failed to delete classroom");
        } finally {
            setDeletingId(null);
        }
    };

    // ------------------ RENDER ------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                    <p className="mt-4 text-lg text-gray-600 font-medium">Loading classrooms...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
                    <div className="flex items-center mb-4">
                        <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-red-800">Error</h3>
                    </div>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }



    return (

        <div className={`min-h-screen ${theme.pageBg} py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-700 mb-3">Classrooms</h1>
                    <p className="text-lg text-gray-500">Manage your classrooms and access attendance systems</p>
                </div>

                {/* ================= ADMIN ACTION BAR ================= */}
                <div className="flex justify-center mb-10">
                    {!isAuthenticated ? (
                        <button
                            onClick={() => navigate("/auth/login")}
                            className="inline-flex items-center cursor-pointer px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Admin Login
                        </button>
                    ) : (
                        <div className="flex items-center gap-4 hover:transition-normal 
                            cursor-pointer hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-lg">
                            <span className="text-emerald-700 font-semibold text-sm tracking-wide">
                                ADMIN MODE ACTIVE
                            </span>

                            <button
                                onClick={logout}
                                className="text-red-600 cursor-pointer text-sm font-medium hover:underline"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Classroom Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="bg-indigo-100 rounded-full p-3 mr-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Create New Classroom</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Classroom ID
                            </label>
                            <input
                                type="text"
                                placeholder="Enter classroom ID (e.g., CS101, Math-2024)"
                                value={newClassroomId}
                                onChange={(e) => setNewClassroomId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !creating) {
                                        handleCreateClassroom();
                                    }
                                }}
                            />
                        </div>

                        <button
                            onClick={handleCreateClassroom}
                            disabled={creating}
                            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${creating
                                ? "bg-indigo-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg"
                                }`}
                        >
                            {creating ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                <span className="flex cursor-pointer items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Classroom
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Classroom List */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="bg-purple-100 rounded-full p-3 mr-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Available Classrooms</h3>
                    </div>

                    {classrooms.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-gray-500 text-lg">No classrooms available yet.</p>
                            <p className="text-gray-400 text-sm mt-2">Create your first classroom to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classrooms.map((id) => (
                                <div
                                    key={id}
                                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50"
                                >
                                    <NavLink
                                        to={`/classrooms/${id}/dashboard`}
                                        className="block group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center flex-1">
                                                <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <span className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                                                    {id}
                                                </span>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </NavLink>

                                    <button
                                        onClick={() => handleDeleteClassroom(id)}
                                        disabled={deletingId === id}
                                        className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${deletingId === id
                                            ? "bg-red-100 text-red-400 cursor-not-allowed"
                                            : "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 border border-red-200"
                                            }`}
                                    >
                                        {deletingId === id ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete Classroom
                                            </span>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Back to Landing */}
                <nav className="mt-8 text-center">
                    <NavLink
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home Page
                    </NavLink>
                </nav>
            </div>
        </div>
    );
};

export default ClassroomListPage;