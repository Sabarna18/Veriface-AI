import { useState , useMemo } from "react";


const AttendanceTable = ({ records = [], showDate = false }) => {
    /* =======================
       PAGINATION STATE (UI ONLY)
       ======================= */
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalRecords = records.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return records.slice(start, start + pageSize);
    }, [records, currentPage, pageSize]);

    const startEntry = (currentPage - 1) * pageSize + 1;
    const endEntry = Math.min(currentPage * pageSize, totalRecords);

    /* =======================
       EMPTY STATE
       ======================= */
    if (!records || records.length === 0) {
        return (
            <div className="mt-8 bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No Records Found</h3>
                    <p className="text-gray-500 mt-1">
                        There are no attendance records to display.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

            {/* =======================
               TABLE HEADER
               ======================= */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Attendance Records</h2>
                        <p className="text-indigo-100 text-sm">
                            Showing {startEntry}–{endEntry} of {totalRecords}
                        </p>
                    </div>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                        <span className="text-sm font-medium">Rows:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white text-gray-800 text-sm rounded-md px-2 py-1 focus:outline-none"
                        >
                            {[10, 25, 50, 100].map(size => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* =======================
               TABLE
               ======================= */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                                User ID
                            </th>
                            {showDate && (
                                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                                    Date
                                </th>
                            )}
                            <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                                Time
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {paginatedRecords.map((record, index) => (
                            <tr
                                key={index}
                                className="hover:bg-indigo-50 transition"
                            >
                                <td className="px-8 py-4 font-medium text-gray-900">
                                    {record.user_id}
                                </td>

                                {showDate && (
                                    <td className="px-8 py-4 text-gray-700">
                                        {record.date || "-"}
                                    </td>
                                )}

                                <td className="px-8 py-4 text-gray-700">
                                    {record.time}
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
                <div className="px-8 py-4 bg-gray-50 border-t flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-3 py-1.5 text-sm rounded-md border disabled:opacity-40 hover:bg-gray-100"
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages })
                            .slice(0, 5)
                            .map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1.5 text-sm rounded-md border
                                            ${currentPage === page
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-3 py-1.5 text-sm rounded-md border disabled:opacity-40 hover:bg-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceTable;
