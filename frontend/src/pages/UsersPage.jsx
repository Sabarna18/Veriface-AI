import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import {
  fetchUsers,
  deleteUser,
  deleteMultipleUsers,
  deleteAllUsers,
} from "../api";

import UsersTable from "../components/tables/UsersTable";
import { useToast } from "../components/ui/useToast";

/**
 * UsersPage
 * ---------
 * Classroom-scoped user management page.
 *
 * Route:
 * /classrooms/:classroomId/users
 */
const UsersPage = () => {
  // Get classroom ID directly from the route.
  const { classroomId } = useParams();

  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     FETCH USERS
     ======================= */

  const loadUsers = useCallback(async () => {
    if (!classroomId) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetchUsers(classroomId);

      setUsers(response?.users ?? []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setUsers([]);

      toast.error(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [classroomId, toast]);

  /* =======================
     LOAD ON CLASSROOM CHANGE
     ======================= */

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* =======================
     DELETE SINGLE USER
     ======================= */

  const handleDeleteUser = async (userId) => {
    if (!classroomId) return;

    if (!window.confirm(`Delete user ${userId}?`)) {
      return;
    }

    try {
      await deleteUser(userId, classroomId);

      toast.success(`User ${userId} deleted`);

      await loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  /* =======================
     DELETE SELECTED USERS
     ======================= */

  const handleDeleteSelected = async () => {
    if (!classroomId) return;

    if (selectedUsers.length === 0) {
      toast.info("No users selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedUsers.length} selected users?`)) {
      return;
    }

    try {
      await deleteMultipleUsers(selectedUsers, classroomId);

      setSelectedUsers([]);

      toast.success("Selected users deleted");

      await loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to delete users");
    }
  };

  /* =======================
     DELETE ALL USERS
     ======================= */

  const handleDeleteAll = async () => {
    if (!classroomId) return;

    if (!window.confirm("Delete ALL users in this classroom?")) {
      return;
    }

    try {
      await deleteAllUsers(classroomId);

      setSelectedUsers([]);

      toast.success("All users deleted");

      await loadUsers();
    } catch (err) {
      toast.error(err?.message || "Failed to delete all users");
    }
  };

  /* =======================
     MISSING CLASSROOM
     ======================= */

  if (!classroomId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">
            Classroom ID is missing from the URL.
          </p>
        </div>
      </div>
    );
  }

  /* =======================
     RENDER
     ======================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>

        <p className="text-sm text-gray-500">
          Manage users enrolled in classroom{" "}
          <span className="font-medium">{classroomId}</span>
        </p>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white border rounded-lg shadow-sm px-4 py-3 flex flex-wrap gap-3 items-center">
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

        <button
          onClick={handleDeleteSelected}
          disabled={loading || selectedUsers.length === 0}
          className="px-4 py-2 rounded-md text-sm font-medium bg-red-50 text-red-600 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-100 transition"
        >
          Delete Selected
        </button>

        <button
          onClick={handleDeleteAll}
          disabled={loading}
          className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete All
        </button>

        {selectedUsers.length > 0 && (
          <span className="ml-auto text-sm text-gray-600">
            {selectedUsers.length} selected
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : (
          <UsersTable
            users={users}
            selectedUsers={selectedUsers}
            onSelectChange={setSelectedUsers}
            onDeleteUser={handleDeleteUser}
            enableNavigation={true}
            basePath={`/classrooms/${classroomId}`}
            classroomId={classroomId}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage;
