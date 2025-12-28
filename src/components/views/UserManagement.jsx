import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Search, X, Lock } from "lucide-react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";

const UserManagement = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");

  if (normalizedRole !== "superadmin") {
    return (
      <div
        className={`${theme?.bg} min-h-screen flex items-center justify-center p-4`}
      >
        <div
          className={`${theme?.card} rounded-lg border ${theme?.border} shadow-md p-6 sm:p-8 text-center max-w-md`}
        >
          <Lock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-yellow-600" />
          <h2 className={`${theme?.text} text-xl sm:text-2xl font-bold mb-2`}>
            Access Restricted
          </h2>
          <p className={`${theme?.textMuted} text-sm sm:text-base`}>
            User management is only available to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "DATA_COLLECTOR",
    organization: "",
    isActive: true,
  });

  const roles = [
    "SUPER_ADMIN",
    "HEAD_RESEARCHER",
    "DATA_COLLECTOR",
    "SUPERVISOR",
    "POLICY_MAKER_SON",
    "POLICY_MAKER_NAFDAC",
    "POLICY_MAKER_RESOLVE",
    "POLICY_MAKER_UNIVERSITY",
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch users: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/users/${editingId}`, formData);
      } else {
        if (!formData.password) {
          setError("Password is required for new users");
          return;
        }
        await api.post("/users", formData);
      }
      fetchUsers();
      setShowForm(false);
      setFormData({
        fullName: "",
        email: "",
        role: "DATA_COLLECTOR",
        organization: "",
        isActive: true,
      });
      setEditingId(null);
    } catch (err) {
      setError(
        "Failed to save user: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      organization: user.organization || "",
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        setError(
          "Failed to delete user: " + (err.response?.data?.error || err.message)
        );
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className={`p-3 sm:p-4 md:p-6 ${theme?.bg}`}>
      <div className="mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1
            className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme?.text}`}
          >
            User Management
          </h1>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                fullName: "",
                email: "",
                role: "DATA_COLLECTOR",
                organization: "",
                isActive: true,
              });
              setShowForm(!showForm);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" /> Add User
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex justify-between items-start gap-2 text-sm sm:text-base">
            <span className="break-words flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 flex-shrink-0"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {showForm && (
          <div
            className={`mb-4 sm:mb-6 p-4 sm:p-6 ${theme?.card} border ${theme?.border} rounded-lg`}
          >
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={`px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
                  required
                />
              </div>

              {!editingId && (
                <input
                  type="password"
                  placeholder="Password"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
                  required
                />
              )}

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {formData.role.startsWith("POLICY_MAKER") && (
                <input
                  type="text"
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
                  required={formData.role.startsWith("POLICY_MAKER")}
                />
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <span className={`${theme?.text} text-sm sm:text-base`}>
                  Active
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition text-sm sm:text-base"
                >
                  {editingId ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className={`flex-1 border ${theme?.border} ${theme?.text} py-2 rounded-lg hover:${theme?.hover} transition text-sm sm:text-base`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div
          className={`p-3 sm:p-4 ${theme?.card} border ${theme?.border} rounded-lg mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4`}
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div
            className={`text-center text-base sm:text-lg ${theme?.text} py-8`}
          >
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div
            className={`text-center text-base sm:text-lg ${theme?.text} py-8`}
          >
            No users found
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div
              className={`hidden md:block overflow-x-auto border ${theme?.border} rounded-lg`}
            >
              <table className="w-full">
                <thead className={theme?.card}>
                  <tr className={`border-b ${theme?.border}`}>
                    <th
                      className={`px-4 py-3 text-left text-sm ${theme?.text}`}
                    >
                      Name
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-sm ${theme?.text}`}
                    >
                      Email
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-sm ${theme?.text}`}
                    >
                      Role
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-sm ${theme?.text}`}
                    >
                      Organization
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-sm ${theme?.text}`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-4 py-3 text-center text-sm ${theme?.text}`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b ${theme?.border} hover:${theme?.hover}`}
                    >
                      <td className={`px-4 py-3 text-sm ${theme?.text}`}>
                        {user.fullName}
                      </td>
                      <td className={`px-4 py-3 text-sm ${theme?.textMuted}`}>
                        {user.email}
                      </td>
                      <td className={`px-4 py-3`}>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${theme?.textMuted}`}>
                        {user.organization || "-"}
                      </td>
                      <td className={`px-4 py-3`}>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-center`}>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`${theme?.card} border ${theme?.border} rounded-lg p-4 space-y-3`}
                >
                  {/* Name and Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`${theme?.text} font-semibold text-base truncate`}
                      >
                        {user.fullName}
                      </h3>
                      <p className={`${theme?.textMuted} text-sm truncate`}>
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        user.isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Role */}
                  <div>
                    <p
                      className={`${theme?.textMuted} text-xs font-semibold uppercase mb-1`}
                    >
                      Role
                    </p>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                      {user.role}
                    </span>
                  </div>

                  {/* Organization */}
                  {user.organization && (
                    <div>
                      <p
                        className={`${theme?.textMuted} text-xs font-semibold uppercase mb-1`}
                      >
                        Organization
                      </p>
                      <p className={`${theme?.text} text-sm`}>
                        {user.organization}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
