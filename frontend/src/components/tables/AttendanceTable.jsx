import { useMemo, useState, useEffect } from "react";

const AttendanceTable = ({
    records = [],
    usersInClassroom,
    classroomId,
    mode,
    selectedDate,
    onPrevDate,
    onNextDate,
}) => {
    /* =======================
       PAGINATION
       ======================= */
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    /* Reset page when page size changes */
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize, mode, selectedDate]);

    /* =======================
       NORMALIZE USERS
       ======================= */
    const users = useMemo(() => {
        if (!usersInClassroom) return [];
        if (Array.isArray(usersInClassroom)) return usersInClassroom;
        if (usersInClassroom.users) return usersInClassroom.users;
        return [];
    }, [usersInClassroom]);

    /* =======================
       PRESENT MAP
       ======================= */
    const presentMap = useMemo(() => {
        const map = {};
        records.forEach((r) => (map[r.user_id] = r.time));
        return map;
    }, [records]);

    /* =======================
       SPECIAL CASE:
       DATE WITH ZERO ATTENDANCE
       ======================= */
    const noAttendanceOnDate = mode === "date" && records.length === 0;

    /* =======================
       BUILD ROWS
       ======================= */
    const rows = useMemo(() => {
        if (mode === "all") {
            return records.map((r) => ({
                user_id: r.user_id,
                date: r.date || "-",
                time: r.time,
            }));
        }

        if (noAttendanceOnDate) {
            return [];
        }

        return users.map((u) => ({
            user_id: u.user_id,
            status: presentMap[u.user_id] ? "Present" : "Absent",
            time: presentMap[u.user_id] || "-",
        }));
    }, [mode, users, records, presentMap, noAttendanceOnDate]);

    /* =======================
       STATISTICS
       ======================= */
    const stats = useMemo(() => {
        if (mode === "all") {
            const totalAttendance = records.length;
            const uniqueStudents = new Set(records.map(r => r.user_id)).size;
            const uniqueDates = new Set(records.map(r => r.date)).size;
            return { totalAttendance, uniqueStudents, uniqueDates };
        } else {
            const present = rows.filter(r => r.status === "Present").length;
            const absent = rows.filter(r => r.status === "Absent").length;
            const total = rows.length;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
            return { present, absent, total, percentage };
        }
    }, [mode, records, rows]);

    /* =======================
       PAGINATION CALCULATION
       ======================= */
    const totalRecords = rows.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);

    const paginatedRows = rows.slice(startIndex, endIndex);

    /* =======================
       SMART PAGINATION NUMBERS
       ======================= */
    const getPaginationRange = () => {
        const maxButtons = 7;
        const pages = [];

        if (totalPages <= maxButtons) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    /* =======================
       FORMAT DATE
       ======================= */
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    /* =======================
       EMPTY / NOTICE STATES
       ======================= */
    if (noAttendanceOnDate) {
        return (
            <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Attendance Records</h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                {classroomId} • {formatDate(selectedDate)}
                            </p>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onPrevDate}
                                className="bg-white/10 hover:bg-white/20 hover:cursor-pointer backdrop-blur-sm p-2 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-sm font-medium px-3">Navigate Date</span>
                            <button
                                onClick={onNextDate}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm hover:cursor-pointer p-2 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="p-16 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        No Attendance Recorded
                    </h3>
                    <p className="text-gray-600">
                        No students were present on {formatDate(selectedDate)}
                    </p>
                </div>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="mt-8 bg-white rounded-3xl shadow-xl p-16 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        No Data Available
                    </h3>
                    <p className="text-gray-600">
                        There are no attendance records to display.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* ================= HEADER WITH STATS ================= */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Attendance Records</h2>
                        <p className="text-indigo-100 text-sm mt-1">
                            {classroomId}
                            {mode === "date" && ` • ${formatDate(selectedDate)}`}
                        </p>
                    </div>

                    {/* Date Navigation (only in date mode) */}
                    {mode === "date" && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onPrevDate}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                                aria-label="Previous date"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={onNextDate}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                                aria-label="Next date"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mode === "all" ? (
                        <>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Total Records</p>
                                        <p className="text-2xl font-bold">{stats.totalAttendance}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Unique Students</p>
                                        <p className="text-2xl font-bold">{stats.uniqueStudents}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Unique Dates</p>
                                        <p className="text-2xl font-bold">{stats.uniqueDates}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Page Size</p>
                                        <p className="text-2xl font-bold">{pageSize}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Present</p>
                                        <p className="text-2xl font-bold">{stats.present}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Absent</p>
                                        <p className="text-2xl font-bold">{stats.absent}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Total Students</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100 uppercase tracking-wide font-medium">Attendance Rate</p>
                                        <p className="text-2xl font-bold">{stats.percentage}%</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Controls Row */}
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-indigo-100">
                        Showing {startIndex + 1}–{endIndex} of {totalRecords} records
                    </div>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <span className="text-sm font-medium">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="bg-white text-gray-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
                        >
                            {[10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ================= TABLE ================= */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                #
                            </th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Student ID
                            </th>
                            {mode === "all" ? (
                                <>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Time
                                    </th>
                                </>
                            ) : (
                                <>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Time
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {paginatedRows.map((r, i) => {
                            const rowNumber = startIndex + i + 1;
                            const isPresent = r.status === "Present";

                            return (
                                <tr
                                    key={i}
                                    className={`transition-all duration-150 hover:bg-indigo-50/50 ${mode === "date" && !isPresent ? 'bg-red-50/30' : ''
                                        }`}
                                >
                                    <td className="px-8 py-4 text-sm text-gray-500 font-medium">
                                        {rowNumber}
                                    </td>

                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {r.user_id.slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-gray-900">
                                                {r.user_id}
                                            </span>
                                        </div>
                                    </td>

                                    {mode === "all" ? (
                                        <>
                                            <td className="px-8 py-4 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(r.date)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="font-mono text-sm text-gray-700">
                                                        {r.time}
                                                    </span>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-8 py-4">
                                                {isPresent ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Present
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        Absent
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4">
                                                {r.time !== "-" ? (
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="font-mono text-sm text-gray-700">
                                                            {r.time}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ================= ENHANCED PAGINATION FOOTER ================= */}
            {totalPages > 1 && (
                <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        {/* Info Text */}
                        <div className="text-sm text-gray-600 font-medium">
                            Page <span className="font-bold text-gray-900">{currentPage}</span> of{" "}
                            <span className="font-bold text-gray-900">{totalPages}</span>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center gap-2">
                            {/* First Page */}
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200"
                                aria-label="First page"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Previous */}
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200"
                            >
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="hidden sm:flex items-center gap-1">
                                {getPaginationRange().map((page, idx) => {
                                    if (page === 'ellipsis') {
                                        return (
                                            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">
                                                ⋯
                                            </span>
                                        );
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200
                                                ${currentPage === page
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg scale-105"
                                                    : "border-gray-300 hover:bg-white hover:shadow-md"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next */}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200"
                            >
                                Next
                            </button>

                            {/* Last Page */}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                                className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200"
                                aria-label="Last page"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceTable;