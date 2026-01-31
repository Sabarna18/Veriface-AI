import { useEffect, useState } from "react";
import {
  fetchUsers,
  deleteUser,
  deleteMultipleUsers,
  deleteAllUsers,
} from "../api";
import { useClassroom } from "../hooks/useClassroom";
import UsersTable from "../components/tables/UsersTable";
import { useToast } from "../components/ui/Toast";

/**
 * UsersPage
 * ---------
 * Classroom-scoped user management page
 */
const UsersPage = () => {
  const { classroomId } = useClassroom();
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     FETCH USERS
     ======================= */
  const loadUsers = async () => {
    if (!classroomId) return;

    setLoading(true);
    try {
      const response = await fetchUsers(classroomId);
      setUsers(response.users || []);
      toast.success("Users loaded successfully");
    } catch (err) {
      setUsers([]);
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [classroomId]);

  /* =======================
     ACTIONS
     ======================= */
  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Delete user ${userId}?`)) return;

    try {
      await deleteUser(userId, classroomId);
      toast.success(`User ${userId} deleted`);
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) {
      toast.info("No users selected");
      return;
    }

    if (
      !window.confirm(
        `Delete ${selectedUsers.length} selected users?`
      )
    )
      return;

    try {
      await deleteMultipleUsers(selectedUsers , classroomId);
      setSelectedUsers([]);
      toast.success("Selected users deleted");
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to delete users");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm("Delete ALL users in this classroom?")
    )
      return;

    try {
      await deleteAllUsers(classroomId);
      setSelectedUsers([]);
      toast.success("All users deleted");
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to delete all users");
    }
  };

  /* =======================
     RENDER
     ======================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* =======================
         PAGE HEADER
         ======================= */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Users
        </h1>
        <p className="text-sm text-gray-500">
          Manage users enrolled in this classroom
        </p>
      </div>

      {/* =======================
         ACTION BAR
         ======================= */}
      <div className="bg-white border rounded-lg shadow-sm px-4 py-3 flex flex-wrap gap-3 items-center">
        <button
          onClick={loadUsers}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
        >
          Refresh
        </button>

        <button
          onClick={handleDeleteSelected}
          disabled={selectedUsers.length === 0}
          className="px-4 py-2 rounded-md text-sm font-medium bg-red-50 text-red-600 border border-red-200
                     disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-100 transition"
        >
          Delete Selected
        </button>

        <button
          onClick={handleDeleteAll}
          className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete All
        </button>

        {/* Selected count */}
        {selectedUsers.length > 0 && (
          <span className="ml-auto text-sm text-gray-600">
            {selectedUsers.length} selected
          </span>
        )}
      </div>

      {/* =======================
         CONTENT
         ======================= */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        {loading && (
          <div className="py-10 text-center text-sm text-gray-500">
            Loading users...
          </div>
        )}

        {!loading && (
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
