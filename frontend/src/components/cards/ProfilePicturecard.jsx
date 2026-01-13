import { useState } from "react";
import { Download, User } from "lucide-react";

export default function ProfilePictureCard({ user, classroomId }) {
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    const imageUrl = `http://localhost:8002/users/${user.user_id}/image?classroom_id=${classroomId}`;

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Image Container */}
            <div className="relative aspect-square bg-gray-50">
                {!imageError ? (
                    <>
                        <img
                            src={imageUrl}
                            alt={`${user.name}'s profile`}
                            className="w-full h-full object-cover"
                            onLoad={() => setLoading(false)}
                            onError={(e) => {
                                e.target.onerror = null;
                                setImageError(true);
                                setLoading(false);
                            }}
                        />
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <User className="w-20 h-20 mb-2" strokeWidth={1.5} />
                        <span className="text-sm font-medium">No image available</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                        {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">Profile Picture</p>
                </div>

                {!imageError && (
                    <a
                        href={imageUrl}
                        download={`${user.user_id.replace(/\s+/g, '_')}_profile.jpg`}
                        className="ml-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Download image"
                    >
                        <Download className="w-5 h-5" />
                    </a>
                )}
            </div>
        </div>
    );
}