import React, { useState, useEffect } from "react";
import { Copy, Trash2, Plus, X, Lock } from "lucide-react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";

const InviteCodeManagement = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  // Role-based access control - SUPER_ADMIN only
  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");

  if (normalizedRole !== "superadmin") {
    return (
      <div
        className={`${theme?.bg} min-h-screen flex items-center justify-center p-4`}
      >
        <div
          className={`${theme?.card} rounded-lg border ${theme?.border} shadow-md p-8 text-center max-w-md`}
        >
          <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <h2 className={`${theme?.text} text-2xl font-bold mb-2`}>
            Access Restricted
          </h2>
          <p className={theme?.textMuted}>
            Invite code management is only available to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  const [inviteCodes, setInviteCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    role: "DATA_COLLECTOR",
    organization: "",
  });

  const roles = [
    "HEAD_RESEARCHER",
    "DATA_COLLECTOR",
    "SUPERVISOR",
    "POLICY_MAKER_SON",
    "POLICY_MAKER_NAFDAC",
    "POLICY_MAKER_RESOLVE",
    "POLICY_MAKER_UNIVERSITY",
  ];

  useEffect(() => {
    fetchInviteCodes();
  }, []);

  const fetchInviteCodes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/invites");
      setInviteCodes(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch invite codes: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        role: formData.role,
        ...(formData.role.startsWith("POLICY_MAKER") && {
          organization: formData.organization,
        }),
      };

      const response = await api.post("/auth/generate-invite", payload);

      setSuccess(`Invite code generated: ${response.data.data.code}`);
      fetchInviteCodes();
      setShowForm(false);
      setFormData({ role: "DATA_COLLECTOR", organization: "" });

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        "Failed to generate invite code: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const handleDeleteInvite = async (id) => {
    if (confirm("Are you sure you want to delete this invite code?")) {
      try {
        await api.delete(`/auth/invites/${id}`);
        fetchInviteCodes();
        setSuccess("Invite code deleted");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(
          "Failed to delete invite code: " +
            (err.response?.data?.error || err.message)
        );
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCodes = inviteCodes.filter((ic) => {
    const matchesRole = filterRole === "all" || ic.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "used" ? ic.isUsed : !ic.isUsed);
    return matchesRole && matchesStatus;
  });

  return (
    <div className={`p-6 ${theme?.bg}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${theme?.text}`}>
            Invite Code Management
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} /> Generate Invite
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-700 hover:text-green-900"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {showForm && (
          <div
            className={`mb-6 p-6 ${theme?.card} border ${theme?.border} rounded-lg`}
          >
            <form onSubmit={handleGenerateInvite} className="space-y-4">
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
                  type="text"
                  placeholder="Organization Name"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
                  required
                />
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition"
                >
                  Generate Invite Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ role: "DATA_COLLECTOR", organization: "" });
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
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`flex-1 px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`flex-1 px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Status</option>
            <option value="unused">Unused</option>
            <option value="used">Used</option>
          </select>
        </div>

        {loading ? (
          <div className={`text-center text-lg ${theme?.text}`}>
            Loading invite codes...
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className={`text-center text-lg ${theme?.text}`}>
            No invite codes found
          </div>
        ) : (
          <div className={`overflow-x-auto border ${theme?.border} rounded-lg`}>
            <table className="w-full">
              <thead className={theme?.card}>
                <tr className={`border-b ${theme?.border}`}>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>Code</th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>Role</th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>
                    Organization
                  </th>
                  <th className={`px-6 py-3 text-center ${theme?.text}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>
                    Generated By
                  </th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>
                    Created
                  </th>
                  <th className={`px-6 py-3 text-center ${theme?.text}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((ic) => (
                  <tr
                    key={ic.id}
                    className={`border-b ${theme?.border} hover:${theme?.hover}`}
                  >
                    <td
                      className={`px-6 py-3 ${theme?.text} font-mono text-sm`}
                    >
                      <div className="flex items-center gap-2">
                        {ic.code}
                        <button
                          onClick={() => handleCopyCode(ic.code)}
                          className={`p-1 rounded ${
                            copiedCode === ic.code
                              ? "bg-green-100"
                              : theme?.hover
                          }`}
                          title="Copy to clipboard"
                        >
                          <Copy
                            size={16}
                            className={
                              copiedCode === ic.code ? "text-green-600" : ""
                            }
                          />
                        </button>
                      </div>
                    </td>
                    <td className={`px-6 py-3 ${theme?.text}`}>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {ic.role}
                      </span>
                    </td>
                    <td className={`px-6 py-3 ${theme?.textMuted}`}>
                      {ic.organization || "-"}
                    </td>
                    <td className={`px-6 py-3 text-center`}>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          ic.isUsed
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {ic.isUsed ? "Used" : "Unused"}
                      </span>
                    </td>
                    <td className={`px-6 py-3 ${theme?.textMuted}`}>
                      {ic.createdBy?.fullName || "Unknown"}
                    </td>
                    <td className={`px-6 py-3 ${theme?.textMuted}`}>
                      {new Date(ic.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-3 text-center`}>
                      <button
                        onClick={() => handleDeleteInvite(ic.id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          className={`mt-6 p-4 ${theme?.card} border ${theme?.border} rounded-lg`}
        >
          <h3 className={`font-semibold ${theme?.text} mb-2`}>How to use:</h3>
          <ol
            className={`space-y-1 ${theme?.textMuted} list-decimal list-inside`}
          >
            <li>Generate a unique invite code for the desired role</li>
            <li>Share the code with the person who needs to register</li>
            <li>
              They will enter this code during signup to get the specified role
            </li>
            <li>Once used, the code cannot be reused</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default InviteCodeManagement;
