import React, { useState, useEffect } from "react";
import { Copy, Trash2, Plus, X, Lock } from "lucide-react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";

const InviteCodeManagementContent = () => {
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
  });

  const { theme } = useTheme();

  const roles = {
    HEAD_RESEARCHER: "Head Researcher",
    SUPERVISOR: "Supervisor",
    DATA_COLLECTOR: "Data Collector",
    LAB_ANALYST: "Lab Analyst",
    POLICY_MAKER_FMOHSW: "Policy Maker - FMOHSW",
    POLICY_MAKER_NAFDAC: "Policy Maker - NAFDAC",
    POLICY_MAKER_SON: "Policy Maker - SON",
    POLICY_MAKER_RESOLVE: "Policy Maker - Resolve",
    POLICY_MAKER_UNIVERSITY: "Policy Maker - University",
  };

  const fetchInviteCodes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/invites");
      setInviteCodes(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch invite codes: " +
          (err.response?.data?.error || err.message),
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
      };

      const response = await api.post("/auth/generate-invite", payload);

      setSuccess(`Invite code generated: ${response.data.data.code}`);

      fetchInviteCodes();
      setShowForm(false);
      setFormData({ role: "DATA_COLLECTOR" });

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        "Failed to generate invite code: " +
          (err.response?.data?.error || err.message),
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
            (err.response?.data?.error || err.message),
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

  useEffect(() => {
    fetchInviteCodes();
  }, []);
  return (
    <div className={`p-6 ${theme?.bg}`}>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}

        <div className='flex justify-between items-center mb-6'>
          <h1 className={`text-3xl font-bold ${theme?.text}`}>
            Invite Code Management
          </h1>

          <button
            onClick={() => setShowForm(!showForm)}
            className='flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition'
          >
            <Plus size={20} /> Generate Invite
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between'>
            {error}
            <button onClick={() => setError(null)}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Success */}

        {success && (
          <div className='mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between'>
            {success}
            <button onClick={() => setSuccess(null)}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Generate Invite Form */}

        {showForm && (
          <div
            className={`mb-6 p-6 ${theme?.card} border ${theme?.border} rounded-lg`}
          >
            <form onSubmit={handleGenerateInvite} className='space-y-4'>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ role: e.target.value })}
                className={`w-full px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
              >
                {Object.entries(roles).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition'
                >
                  Generate Invite Code
                </button>

                <button
                  type='button'
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ role: "DATA_COLLECTOR" });
                  }}
                  className={`flex-1 border ${theme?.border} ${theme?.text} py-2 rounded-lg`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}

        <div
          className={`p-4 ${theme?.card} border ${theme?.border} rounded-lg mb-6 flex gap-4`}
        >
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`flex-1 px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value='all'>All Roles</option>

            {Object.entries(roles).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`flex-1 px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value='all'>All Status</option>
            <option value='unused'>Unused</option>
            <option value='used'>Used</option>
          </select>
        </div>

        {/* Table */}

        {loading ? (
          <div className={`text-center text-lg ${theme?.text} py-8`}>
            Loading invite codes...
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className={`text-center text-lg ${theme?.text} py-8`}>
            No invite codes found
          </div>
        ) : (
          <div className={`overflow-x-auto border ${theme?.border} rounded-lg`}>
            <table className='w-full'>
              <thead className={theme?.card}>
                <tr className={`border-b ${theme?.border}`}>
                  <th className='px-4 py-3 text-left'>Code</th>
                  <th className='px-4 py-3 text-left'>Role</th>
                  <th className='px-4 py-3 text-center'>Status</th>
                  <th className='px-4 py-3 text-left'>Created</th>
                  <th className='px-4 py-3 text-center'>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCodes.map((ic) => (
                  <tr key={ic.id} className={`border-b ${theme?.border}`}>
                    <td className='px-4 py-3 font-mono text-sm'>
                      <div className='flex items-center gap-2'>
                        {ic.code}

                        <button
                          onClick={() => handleCopyCode(ic.code)}
                          className={`p-1 rounded ${
                            copiedCode === ic.code ? "bg-green-100" : ""
                          }`}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>

                    <td className='px-4 py-3'>{roles[ic.role] || ic.role}</td>

                    <td className='px-4 py-3 text-center'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          ic.isUsed
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {ic.isUsed ? "Used" : "Unused"}
                      </span>
                    </td>

                    <td className='px-4 py-3 text-sm'>
                      {new Date(ic.createdAt).toLocaleDateString()}
                    </td>

                    <td className='px-4 py-3 text-center'>
                      <button
                        onClick={() => handleDeleteInvite(ic.id)}
                        className='text-red-500 hover:text-red-700'
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
      </div>
    </div>
  );
};

const InviteCodeManagement = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();
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
          <p className={`${theme?.textMuted}`}>
            Invite code management is only available to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  return <InviteCodeManagementContent />;
};

export default InviteCodeManagement;
