import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Search, X, Lock } from "lucide-react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { useTheme } from "../../hooks/useTheme";

const UserManagement = ({ theme, darkMode }) => {
  const { currentUser } = useSelector((state) => state.auth);
  const { theme: hookTheme } = useTheme();
  const displayTheme = theme || hookTheme;

  // Role-based access control - SUPER_ADMIN only
  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");

  if (normalizedRole !== "superadmin") {
    return (
      <div
        className={`${displayTheme?.bg} min-h-screen flex items-center justify-center p-4`}
      >
        <div
          className={`${displayTheme?.card} rounded-lg border ${displayTheme?.border} shadow-md p-8 text-center max-w-md`}
        >
          <Lock className='w-16 h-16 mx-auto mb-4 text-yellow-600' />
          <h2 className={`${displayTheme?.text} text-2xl font-bold mb-2`}>
            Access Restricted
          </h2>
          <p className={displayTheme?.textMuted}>
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
        // Create new user - need password
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
    <div className={`p-6 ${theme?.bg}`}>
      <div className='mx-auto w-full border border-red-800'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className={`text-3xl font-bold ${theme?.text}`}>
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
            className='flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition'
          >
            <Plus size={20} /> Add User
          </button>
        </div>

        {error && (
          <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center'>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className='text-red-700 hover:text-red-900'
            >
              <X size={20} />
            </button>
          </div>
        )}

        {showForm && (
          <div
            className={`mb-6 p-6 ${theme?.card} border ${theme?.border} rounded-lg`}
          >
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <input
                  type='text'
                  placeholder='Full Name'
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={`px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
                  required
                />
                <input
                  type='email'
                  placeholder='Email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
                  required
                />
              </div>

              {!editingId && (
                <input
                  type='password'
                  placeholder='Password'
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
                  required
                />
              )}

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={`w-full px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {formData.role.startsWith("POLICY_MAKER") && (
                <input
                  type='text'
                  placeholder='Organization'
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
                  required={formData.role.startsWith("POLICY_MAKER")}
                />
              )}

              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className='rounded'
                />
                <span className={theme?.text}>Active</span>
              </label>

              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition'
                >
                  {editingId ? "Update User" : "Create User"}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className={`flex-1 border ${theme?.border} ${theme?.text} py-2 rounded-lg hover:${theme?.hover} transition`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div
          className={`p-4 ${theme?.card} border ${theme?.border} rounded-lg mb-6 flex gap-4`}
        >
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Search by name or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input} flex items-center gap-2`}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value='all'>All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={`text-center text-lg ${theme?.text}`}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={`text-center text-lg ${theme?.text}`}>
            No users found
          </div>
        ) : (
          <div className={`overflow-x-auto border ${theme?.border} rounded-lg`}>
            <table className='w-full'>
              <thead className={theme?.card}>
                <tr className={`border-b ${theme?.border}`}>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>Name</th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>Role</th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>
                    Organization
                  </th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-center ${theme?.text}`}>
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
                    <td className={`px-6 py-3 ${theme?.text}`}>
                      {user.fullName}
                    </td>
                    <td className={`px-6 py-3 ${theme?.textMuted}`}>
                      {user.email}
                    </td>
                    <td className={`px-6 py-3 ${theme?.text}`}>
                      <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                        {user.role}
                      </span>
                    </td>
                    <td className={`px-6 py-3 ${theme?.textMuted}`}>
                      {user.organization || "-"}
                    </td>
                    <td className={`px-6 py-3`}>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-center`}>
                      <div className='flex justify-center gap-2'>
                        <button
                          onClick={() => handleEdit(user)}
                          className='text-blue-500 hover:text-blue-700 transition'
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className='text-red-500 hover:text-red-700 transition'
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
        )}
      </div>
    </div>
  );
};

export default UserManagement;
