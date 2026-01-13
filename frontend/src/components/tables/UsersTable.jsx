import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import Button from "../ui/Button";

const UsersTable = ({
    users = [],
    selectedUsers = [],
    onSelectChange,
    onDeleteUser,
    basePath,
    enableNavigation = false,
    classroomId,
}) => {
    /* =======================
       STATE
       ======================= */
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    /* =======================
       SEARCH FILTER
       ======================= */
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        return users.filter((u) =>
            u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    /* =======================
       PAGINATION
       ======================= */
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / pageSize);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    const startEntry =
        totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endEntry = Math.min(currentPage * pageSize, totalUsers);

    /* =======================
       SELECTION LOGIC (UNCHANGED)
       ======================= */
    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            onSelectChange(selectedUsers.filter((id) => id !== userId));
        } else {
            onSelectChange([...selectedUsers, userId]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            onSelectChange([]);
        } else {
            onSelectChange(filteredUsers.map((u) => u.user_id));
        }
    };

    /* =======================
       PAGE BUTTONS (MAX 5)
       ======================= */
    const pageNumbers = useMemo(() => {
        const pages = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + 4);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }, [currentPage, totalPages]);

    /* =======================
       EMPTY STATE
       ======================= */
    if (!users || users.length === 0) {
        return (
            <div className="mt-8 bg-white border rounded-2xl p-10 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">
                    No Users Found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    This classroom does not have any registered users.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* =======================
         HEADER
         ======================= */}
            <div className="px-6 py-4 bg-gray-50 border-b flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Classroom Users
                    </h2>
                    <p className="text-sm text-gray-500">
                        Showing {startEntry}–{endEntry} of {totalUsers}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search user ID..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Page Size */}
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border rounded-md px-2 py-1.5 text-sm"
                    >
                        {[10, 25, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* =======================
         TABLE
         ======================= */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3">
                                <input
                                    type="checkbox"
                                    checked={
                                        filteredUsers.length > 0 &&
                                        selectedUsers.length === filteredUsers.length
                                    }
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 accent-blue-600"
                                />
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                Avatar
                            </th>

                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                User ID
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {paginatedUsers.map((user) => (
                            <tr
                                key={user.user_id}
                                className="hover:bg-blue-50 transition"
                            >
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.user_id)}
                                        onChange={() => toggleUser(user.user_id)}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center">
                                        <img
                                            src={`http://localhost:8002/users/${user.user_id}/image?classroom_id=${classroomId}`}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = "none";
                                            }}
                                        />

                                    </div>
                                </td>


                                <td className="px-6 py-4 font-medium">
                                    {enableNavigation ? (
                                        <NavLink
                                            to={`${basePath}/users/${user.user_id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {user.user_id}
                                        </NavLink>
                                    ) : (
                                        user.user_id
                                    )}
                                </td>

                                <td className="px-6 py-4 text-gray-600">
                                    {user.created_at
                                        ? new Date(user.created_at).toLocaleString()
                                        : "-"}
                                </td>

                                <td className="px-6 py-4">
                                    <Button
                                        variant="danger"
                                        onClick={() => onDeleteUser(user.user_id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* =======================
         PAGINATION FOOTER
         ======================= */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-100"
                        >
                            Prev
                        </button>

                        {pageNumbers.map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 border rounded-md text-sm
                  ${page === currentPage
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "hover:bg-gray-100"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTable;
