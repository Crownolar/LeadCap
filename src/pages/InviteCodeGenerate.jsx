import {
  KeyRound,
  Users,
  Beaker,
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE_URL = "/api";

const InviteCodeGenerate = ({ theme = {} }) => {
  // Default theme if not provided
  const defaultTheme = {
    bg: "bg-gray-900",
    text: "text-gray-100",
    card: "bg-gray-800",
    border: "border-gray-700",
    textMuted: "text-gray-400",
  };

  const currentTheme = { ...defaultTheme, ...theme };

  const [activeTab, setActiveTab] = useState("invite");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [samples, setSamples] = useState([]);
  const [comments, setComments] = useState([]);

  const handleGenerateInviteCode = async (role) => {
    setInviteLoading(true);
    setGeneratedCode("");
    setMessage("");

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${API_BASE_URL}/auth/generate-invite`,
        { role: role.toUpperCase() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const code = res.data.data.code;
      setGeneratedCode(code);

      await navigator.clipboard.writeText(code);
      setMessage(`✅ Invite code for ${role} copied to clipboard!`);
    } catch (err) {
      console.error("Error response:", err.response?.data);
      setMessage(
        err.response?.data?.message ||
          "❌ Failed to generate invite code. Check your token or permissions."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      inactive: "bg-red-500/20 text-red-400 border-red-500/50",
      analyzed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      "in-progress": "bg-purple-500/20 text-purple-400 border-purple-500/50",
      approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      flagged: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs border ${
          statusStyles[status] || statusStyles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const tabs = [
    { id: "invite", label: "Invite Codes", icon: KeyRound },
    { id: "users", label: "Users", icon: Users },
    { id: "samples", label: "Samples", icon: Beaker },
    { id: "comments", label: "Comments", icon: MessageSquare },
  ];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2">
            Super Admin Dashboard
          </h1>
          <p className={currentTheme.textMuted}>
            Manage users, samples, and system settings
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                    : `${currentTheme.card} ${currentTheme.text} hover:bg-gray-700`
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div
          className={`${currentTheme.card} rounded-2xl shadow-xl border ${currentTheme.border} p-6`}
        >
          {/* Invite Codes Tab */}
          {activeTab === "invite" && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <KeyRound className="text-emerald-500" /> Generate Invite Codes
              </h2>
              <p className={`text-sm mb-6 ${currentTheme.textMuted}`}>
                Generate secure invite codes for different user roles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {["POLICY_MAKER", "HEAD_RESEARCHER", "ADMIN"].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleGenerateInviteCode(role)}
                    disabled={inviteLoading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {inviteLoading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Generating...
                      </>
                    ) : (
                      `Generate ${role.replace(/_/g, " ")}`
                    )}
                  </button>
                ))}
              </div>

              {generatedCode && (
                <div className="p-5 bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-500/30 rounded-lg backdrop-blur-sm">
                  <p className="text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wide">
                    Generated Invite Code
                  </p>
                  <p className="text-emerald-300 font-mono text-lg text-center p-3 bg-gray-800/50 rounded border border-emerald-500/20 select-all cursor-pointer hover:bg-gray-800 transition-colors duration-200">
                    {generatedCode}
                  </p>
                </div>
              )}

              {message && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-center text-emerald-400 font-medium">
                    {message}
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-emerald-500/50"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-emerald-500" /> User Management
                </h2>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-emerald-400">
                        Name
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-emerald-400">
                        Email
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-emerald-400">
                        Role
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-emerald-400">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-emerald-400">
                        Joined
                      </th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-emerald-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 px-6 text-center text-gray-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-700/30 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 font-medium">{user.fullName}</td>
                          <td className="py-4 px-6 text-sm text-gray-400">
                            {user.email}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-medium">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-400">
                            {user.joinedDate}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2 justify-center">
                              <button className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors duration-200">
                                <Eye size={16} className="text-emerald-400" />
                              </button>
                              <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200">
                                <Edit size={16} className="text-blue-400" />
                              </button>
                              <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200">
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Samples Tab */}
          {activeTab === "samples" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Beaker className="text-emerald-500" /> Sample Management
                </h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition">
                    <Filter size={16} />
                    Filter
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {samples.length === 0 ? (
                  <div className="py-12 px-6 text-center text-gray-400">
                    <Beaker size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No samples available</p>
                  </div>
                ) : (
                  samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="p-5 bg-gradient-to-br from-gray-700/50 to-gray-700/20 rounded-lg border border-gray-600 hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-white">
                            {sample.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            <span className="font-medium">Type:</span> {sample.type} |{" "}
                            <span className="font-medium">Location:</span> {sample.location}
                          </p>
                        </div>
                        {getStatusBadge(sample.status)}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600">
                        <span className="text-sm text-gray-400">
                          Submitted by:{" "}
                          <span className="text-emerald-400 font-medium">
                            {sample.submittedBy}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500">{sample.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="text-emerald-500" /> Comment
                  Moderation
                </h2>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="py-12 px-6 text-center text-gray-400">
                    <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No comments to moderate</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-5 bg-gray-700/40 rounded-lg border border-gray-600 hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {comment.user.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{comment.user}</p>
                            <p className="text-xs text-gray-400">on {comment.sample}</p>
                          </div>
                        </div>
                        {getStatusBadge(comment.status)}
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {comment.comment}
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                        <span className="text-xs text-gray-500">{comment.date}</span>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors duration-200 text-sm font-medium">
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200 text-sm font-medium">
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteCodeGenerate;
