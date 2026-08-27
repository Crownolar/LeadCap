import {
  KeyRound,
  Users,
  Trash2,
  Edit,
  Eye,
  MapPin,
  Plus,
  Settings,
  Check,
  X,
  Loader2,
  Search,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
} from "../redux/slice/userSlice";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useEnums } from "../context/EnumsContext";
import { useTheme } from "../context/ThemeContext";
import { normalizeRole } from "../hooks/useRoleDataLoader";

/* ------------------------------------------------------------------ */
/*  Small shared UI primitives — keep this file self-contained but    */
/*  reduce repeated markup for a cleaner, more consistent surface.    */
/* ------------------------------------------------------------------ */
/* The systematic study of human nature */

const formatLabel = (value = "") =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

const Alert = ({ tone = "success", children, className = "" }) => {
  const styles =
    tone === "error"
      ? "bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400"
      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium ${styles} ${className}`}
      role="status"
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

const StatusPill = ({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
      active
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        : "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20"
    }`}
  >
    {active ? <Check size={11} /> : <X size={11} />}
    {active ? activeLabel : inactiveLabel}
  </span>
);

const SectionHeading = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <h2 className="text-lg font-bold flex items-center gap-2">
        {Icon && <Icon className="text-emerald-500" size={20} />}
        {title}
      </h2>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}
    </div>
    {action}
  </div>
);

const EmptyState = ({ children }) => (
  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
    {children}
  </div>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

/* ------------------------------------------------------------------ */

const InviteCodeGenerate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { users, selectedUser, loading } = useSelector((state) => state.users);
  const { currentUser } = useSelector((state) => state.auth);

  const allowedRolesForDashboard = ["superadmin"];
  const isSuperadmin = allowedRolesForDashboard.includes(
    normalizeRole(currentUser?.role),
  );

  const FALLBACK_USER_ROLES = [
    "SUPER_ADMIN",
    "HEAD_RESEARCHER",
    "SUPERVISOR",
    "DATA_COLLECTOR",
    "LAB_ANALYST",
    "POLICY_MAKER_FMOHSW",
    "POLICY_MAKER_NAFDAC",
    "POLICY_MAKER_SON",
    "POLICY_MAKER_RESOLVE",
    "POLICY_MAKER_UNIVERSITY",
  ];

  const roles = [
    { role: "HEAD_RESEARCHER" },
    { role: "DATA_COLLECTOR" },
    { role: "LAB_ANALYST" },
    { role: "SUPERVISOR" },
    { role: "POLICY_MAKER_SON", org: "SON" },
    { role: "POLICY_MAKER_NAFDAC", org: "NAFDAC" },
    { role: "POLICY_MAKER_RESOLVE", org: "RESOLVE" },
    { role: "POLICY_MAKER_UNIVERSITY", org: "UNIVERSITY" },
    { role: "POLICY_MAKER_FMOHSW", org: "FMOHSW" },
    // Superadmin excluded
  ];

  const { userRoles, userRoleLabels } = useEnums();

  const [activeTab, setActiveTab] = useState("invite");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatingRole, setGeneratingRole] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null); // { tone, text }
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "HEAD_RESEARCHER",
  });

  const [editableUser, setEditableUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Supervisors & States tab
  const [statesList, setStatesList] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [selectedStates, setSelectedStates] = useState([]);
  const [assignError, setAssignError] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  // State activation tab
  const [activationStates, setActivationStates] = useState([]);
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [selectedStateIds, setSelectedStateIds] = useState([]);
  const [activationBusyId, setActivationBusyId] = useState(null);
  const [activationBulkBusy, setActivationBulkBusy] = useState(false);
  const [stateSearch, setStateSearch] = useState("");

  useEffect(() => {
    dispatch(getAllUsers({ page: 1, limit: 50 }));
  }, [activeTab, dispatch]);

  // Fetch full users (with supervisorStates) and active states for Supervisors tab
  useEffect(() => {
    if (activeTab !== "supervisors") return;
    const fetchAdminData = async () => {
      try {
        const [usersRes, statesRes] = await Promise.all([
          api.get("/users", { params: { limit: 200 } }),
          api.get("/management/states", { params: { activeOnly: "true" } }),
        ]);
        setAdminUsers(usersRes.data?.data || []);
        setStatesList(statesRes.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setAdminUsers([]);
        setStatesList([]);
      }
    };
    fetchAdminData();
  }, [activeTab]);

  // Fetch all states (no activeOnly) for State activation tab
  useEffect(() => {
    if (activeTab !== "stateActivation") return;
    const fetchActivationStates = async () => {
      try {
        setActivationLoading(true);
        setActivationError(null);
        const res = await api.get("/management/states");
        setActivationStates(res.data?.data || []);
      } catch (err) {
        setActivationError(
          "Failed to load states: " + (err.response?.data?.error || err.message),
        );
        setActivationStates([]);
      } finally {
        setActivationLoading(false);
      }
    };
    fetchActivationStates();
  }, [activeTab]);

  useEffect(() => {
    if (selectedUser) {
      setEditableUser({ ...selectedUser });
      setIsEditing(false);
    } else {
      setEditableUser(null);
      setIsEditing(false);
    }
  }, [selectedUser]);

  const handleGenerateInviteCode = async (role, organization) => {
    setInviteLoading(true);
    setGeneratingRole(role);
    setGeneratedCode("");
    setCopied(false);
    setMessage(null);

    try {
      const body = organization ? { role, organization } : { role };
      const res = await api.post("/auth/generate-invite", body);
      const data = res.data;

      if (!data.success)
        throw new Error(data.message || "Failed to generate invite code");

      const code = data.data?.code || data.code;
      setGeneratedCode(code);
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setMessage({
        tone: "success",
        text: `Invite code for ${formatLabel(role)}${
          organization ? ` (${organization})` : ""
        } copied to clipboard.`,
      });
    } catch (err) {
      console.error(err);
      setMessage({
        tone: "error",
        text:
          err.response?.data?.error ||
          err.message ||
          "Failed to generate invite code.",
      });
    } finally {
      setInviteLoading(false);
      setGeneratingRole(null);
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateUser = () => {
    setMessage(null);

    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setMessage({ tone: "error", text: "Full name, email and password are required." });
      return;
    }

    dispatch(createUser(newUser)).then((res) => {
      if (!res.error) {
        setMessage({ tone: "success", text: "User created successfully." });
        setNewUser({ fullName: "", email: "", password: "", role: "HEAD_RESEARCHER" });
        dispatch(getAllUsers({ page: 1, limit: 20 }));
      } else {
        setMessage({
          tone: "error",
          text: res.payload || res.error?.message || "Failed to create user",
        });
      }
    });
  };

  const handleViewUser = (userId) => {
    dispatch(getUserById(userId)).then((res) => {
      if (!res.error) {
        setActiveTab("viewUser");
      } else {
        setMessage({ tone: "error", text: res.payload || "Failed to fetch user" });
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Deactivate this user? They will no longer be able to sign in."))
      return;
    try {
      await api.delete(`/users/${userId}`);
      setMessage({ tone: "success", text: "User deactivated successfully." });
      dispatch(getAllUsers({ page: 1, limit: 20 }));
    } catch (err) {
      setMessage({
        tone: "error",
        text: err.response?.data?.error || err.message || "Failed to deactivate user",
      });
    }
  };

  const handleToggleEdit = () => {
    setIsEditing((v) => !v);
    if (!editableUser && selectedUser) setEditableUser({ ...selectedUser });
  };

  const handleSaveUser = () => {
    if (!editableUser) return;
    setMessage(null);

    const updatedData = {
      fullName: editableUser.fullName,
      role: editableUser.role,
      isActive: editableUser.status === "active",
    };

    dispatch(updateUser({ id: editableUser.id, updatedData })).then((res) => {
      if (!res.error) {
        setMessage({ tone: "success", text: "User updated successfully." });
        setIsEditing(false);
        dispatch(getAllUsers({ page: 1, limit: 20 }));
        dispatch(getUserById(editableUser.id));
      } else {
        setMessage({ tone: "error", text: res.payload || "Failed to update user" });
      }
    });
  };

  const supervisorsList = (adminUsers || []).filter((u) => u.role === "SUPERVISOR");

  const openAssignModalForEdit = (supervisor) => {
    setSelectedSupervisor(supervisor.id);
    setSelectedStates(
      (supervisor.supervisorStates || []).map((ss) => ss.state?.id ?? ss.stateId),
    );
    setShowAssignModal(true);
    setAssignError(null);
  };

  const openAssignModalNew = () => {
    setSelectedSupervisor(null);
    setSelectedStates([]);
    setShowAssignModal(true);
    setAssignError(null);
  };

  const handleAssignStates = async () => {
    setAssignError(null);
    if (!selectedSupervisor || selectedStates.length === 0) {
      setAssignError("Please select a supervisor and at least one state.");
      return;
    }
    setAssignLoading(true);
    try {
      await api.post(`/supervisor/${selectedSupervisor}/states`, {
        stateIds: selectedStates,
      });
      const usersRes = await api.get("/users", { params: { limit: 200 } });
      setAdminUsers(usersRes.data?.data || []);
      setShowAssignModal(false);
      setSelectedSupervisor(null);
      setSelectedStates([]);
      setMessage({ tone: "success", text: "States assigned successfully." });
      dispatch(getAllUsers({ page: 1, limit: 20 }));
    } catch (err) {
      setAssignError(
        err.response?.data?.error || err.response?.data?.message || "Failed to assign states",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassignState = async (supervisorId, stateId) => {
    if (!window.confirm("Unassign this state from the supervisor?")) return;
    try {
      await api.delete(`/supervisor/${supervisorId}/states/${stateId}`);
      const usersRes = await api.get("/users", { params: { limit: 200 } });
      setAdminUsers(usersRes.data?.data || []);
      setMessage({ tone: "success", text: "State unassigned." });
      dispatch(getAllUsers({ page: 1, limit: 20 }));
    } catch (err) {
      setMessage({
        tone: "error",
        text: err.response?.data?.error || err.response?.data?.message || "Failed to unassign",
      });
    }
  };

  const filteredActivationStates = stateSearch.trim()
    ? activationStates.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(stateSearch.toLowerCase()) ||
          (s.code || "").toLowerCase().includes(stateSearch.toLowerCase()),
      )
    : activationStates;

  const handleActivationToggleOne = async (state) => {
    setActivationBusyId(state.id);
    try {
      await api.patch(`/management/states/${state.id}/active`, {
        isActive: !state.isActive,
      });
      const res = await api.get("/management/states");
      setActivationStates(res.data?.data || []);
      setSelectedStateIds((prev) => prev.filter((id) => id !== state.id));
      setActivationError(null);
    } catch (err) {
      setActivationError("Failed to update: " + (err.response?.data?.error || err.message));
    } finally {
      setActivationBusyId(null);
    }
  };

  const handleActivationBulk = async (isActive) => {
    if (selectedStateIds.length === 0) return;
    setActivationBulkBusy(true);
    try {
      await api.patch("/management/states/bulk-active", {
        stateIds: selectedStateIds,
        isActive,
      });
      const res = await api.get("/management/states");
      setActivationStates(res.data?.data || []);
      setSelectedStateIds([]);
      setActivationError(null);
      setMessage({
        tone: "success",
        text: `${selectedStateIds.length} state(s) ${isActive ? "activated" : "deactivated"}.`,
      });
    } catch (err) {
      setActivationError("Bulk update failed: " + (err.response?.data?.error || err.message));
    } finally {
      setActivationBulkBusy(false);
    }
  };

  const toggleActivationSelect = (id) => {
    setSelectedStateIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleActivationSelectAll = () => {
    if (selectedStateIds.length === filteredActivationStates.length) {
      setSelectedStateIds([]);
    } else {
      setSelectedStateIds(filteredActivationStates.map((s) => s.id));
    }
  };

  const tabs = [
    { id: "invite", label: "Invite codes", icon: KeyRound },
    isSuperadmin ? { id: "users", label: "Users", icon: Users } : null,
    { id: "supervisors", label: "Supervisors & states", icon: MapPin },
    { id: "stateActivation", label: "State activation", icon: Settings },
  ].filter(Boolean);

  const filteredUsers = users?.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const visibleUsers = filteredUsers && filteredUsers.length > 0 ? filteredUsers : users;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin console</h1>
            <p className={`text-sm mt-1 ${theme.textMuted}`}>
              Manage users, invite codes, and state coverage
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border ${theme.border} text-sm font-medium hover:bg-gray-500/5 transition-colors`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className={`inline-flex flex-wrap gap-1 p-1 rounded-2xl border ${theme.border} ${theme.card} mb-6`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : `${theme.textMuted} hover:bg-gray-500/10`
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className={`${theme.card} rounded-3xl border ${theme.border} p-6 sm:p-8`}
        >
          {/* ---------------------------- INVITE CODES ---------------------------- */}
          {activeTab === "invite" && (
            <div>
              <SectionHeading
                icon={KeyRound}
                title="Generate invite codes"
                description="Select a role to generate a one-time invite code. It's copied to your clipboard automatically."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {roles.map(({ role, org }) => {
                  const isBusy = inviteLoading && generatingRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleGenerateInviteCode(role, org)}
                      disabled={inviteLoading}
                      className={`group flex flex-col gap-2 p-4 rounded-2xl border ${theme.border} text-left transition-all hover:border-emerald-500 hover:bg-emerald-500/5 disabled:opacity-50 disabled:pointer-events-none`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          {org || "General"}
                        </span>
                        {isBusy ? (
                          <Loader2 size={14} className="animate-spin text-emerald-500" />
                        ) : (
                          <Plus
                            size={14}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                      <span className="font-semibold text-sm">{formatLabel(role)}</span>
                    </button>
                  );
                })}
              </div>

              {generatedCode && (
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 mb-4">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3">
                    Generated invite code
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-base sm:text-lg text-center py-3 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-500/20">
                      {generatedCode}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      className="shrink-0 p-3 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check size={18} className="text-emerald-500" />
                      ) : (
                        <Copy size={18} className="text-emerald-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {message && <Alert tone={message.tone}>{message.text}</Alert>}
            </div>
          )}

          {/* ------------------------- SUPERVISORS & STATES ------------------------ */}
          {activeTab === "supervisors" && (
            <div>
              <SectionHeading
                icon={MapPin}
                title="Supervisor management"
                description="Assign the states each supervisor is responsible for."
                action={
                  <button
                    onClick={openAssignModalNew}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                  >
                    <Plus size={16} />
                    Assign states
                  </button>
                }
              />

              {message && <Alert tone={message.tone} className="mb-4">{message.text}</Alert>}

              <div className="space-y-3">
                {supervisorsList.length === 0 ? (
                  <EmptyState>
                    No supervisors found. Create a user with the supervisor role first.
                  </EmptyState>
                ) : (
                  supervisorsList.map((supervisor) => (
                    <div
                      key={supervisor.id}
                      className={`rounded-2xl border ${theme.border} p-4`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{supervisor.fullName}</h3>
                          <p className={`text-sm truncate ${theme.textMuted}`}>
                            {supervisor.email}
                          </p>
                        </div>
                        <button
                          onClick={() => openAssignModalForEdit(supervisor)}
                          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-sm font-medium transition-colors"
                        >
                          <Edit size={14} />
                          Edit states
                        </button>
                      </div>
                      <div className={`mt-3 pt-3 border-t ${theme.border}`}>
                        <p className={`text-xs font-semibold mb-2 ${theme.textMuted}`}>
                          Assigned states ({supervisor.supervisorStates?.length ?? 0})
                        </p>
                        {supervisor.supervisorStates && supervisor.supervisorStates.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {supervisor.supervisorStates.map((ss) => (
                              <span
                                key={ss.stateId}
                                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm"
                              >
                                <MapPin size={13} />
                                {ss.state?.name ?? ss.stateId}
                                <button
                                  type="button"
                                  onClick={() => handleUnassignState(supervisor.id, ss.stateId)}
                                  className="p-0.5 rounded-full hover:bg-emerald-500/20"
                                  aria-label="Unassign"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm ${theme.textMuted}`}>No states assigned</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* --------------------------- STATE ACTIVATION -------------------------- */}
          {activeTab === "stateActivation" && (
            <div>
              <SectionHeading
                icon={Settings}
                title="State activation"
                description="Only active states appear in dropdowns, such as Add Sample."
              />

              {activationError && (
                <Alert tone="error" className="mb-4">{activationError}</Alert>
              )}
              {message && <Alert tone={message.tone} className="mb-4">{message.text}</Alert>}

              {selectedStateIds.length > 0 && (
                <div className="mb-4 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mr-1">
                    {selectedStateIds.length} selected
                  </span>
                  <button
                    type="button"
                    disabled={activationBulkBusy}
                    onClick={() => handleActivationBulk(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium"
                  >
                    {activationBulkBusy ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Check size={15} />
                    )}
                    Activate
                  </button>
                  <button
                    type="button"
                    disabled={activationBulkBusy}
                    onClick={() => handleActivationBulk(false)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border ${theme.border} disabled:opacity-50 text-sm font-medium hover:bg-gray-500/10`}
                  >
                    {activationBulkBusy ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <X size={15} />
                    )}
                    Deactivate
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStateIds([])}
                    className={`text-sm ${theme.textMuted} hover:opacity-80 ml-1`}
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by state name or code"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {activationLoading ? (
                <div className="flex items-center justify-center gap-2 py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className={theme.textMuted}>Loading states…</span>
                </div>
              ) : (
                <div className={`rounded-2xl border ${theme.border} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-500/5">
                        <tr>
                          <th className="px-4 py-3 text-left w-10">
                            <input
                              type="checkbox"
                              checked={
                                filteredActivationStates.length > 0 &&
                                selectedStateIds.length === filteredActivationStates.length
                              }
                              onChange={toggleActivationSelectAll}
                              className="rounded border-gray-400 w-4 h-4 accent-emerald-600"
                              aria-label="Select all"
                            />
                          </th>
                          <th className={`px-4 py-3 text-left font-semibold ${theme.textMuted}`}>
                            Name
                          </th>
                          <th className={`px-4 py-3 text-left font-semibold ${theme.textMuted}`}>
                            Code
                          </th>
                          <th className={`px-4 py-3 text-left font-semibold ${theme.textMuted}`}>
                            Status
                          </th>
                          <th className={`px-4 py-3 text-right font-semibold ${theme.textMuted}`}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme.border}`}>
                        {filteredActivationStates.map((state) => (
                          <tr key={state.id} className="hover:bg-gray-500/5 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedStateIds.includes(state.id)}
                                onChange={() => toggleActivationSelect(state.id)}
                                className="rounded border-gray-400 w-4 h-4 accent-emerald-600"
                                aria-label={`Select ${state.name}`}
                              />
                            </td>
                            <td className="px-4 py-3 font-medium">{state.name}</td>
                            <td className={`px-4 py-3 ${theme.textMuted}`}>{state.code}</td>
                            <td className="px-4 py-3">
                              <StatusPill active={state.isActive} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                disabled={activationBusyId === state.id}
                                onClick={() => handleActivationToggleOne(state)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-50 ${
                                  state.isActive
                                    ? "text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                                    : "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                }`}
                              >
                                {activationBusyId === state.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : state.isActive ? (
                                  "Deactivate"
                                ) : (
                                  "Activate"
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredActivationStates.length === 0 && (
                    <div className={`px-4 py-10 text-center ${theme.textMuted}`}>
                      {stateSearch.trim() ? "No states match your search." : "No states found."}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------- USERS -------------------------------- */}
          {activeTab === "users" && (
            <div>
              <SectionHeading
                icon={Users}
                title="User management"
                description="Create accounts and manage existing users."
              />

              {/* Create user */}
              <div className={`rounded-2xl border ${theme.border} p-5 sm:p-6 mb-8`}>
                <h3 className="font-semibold mb-4">Create a new user</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Full name</FieldLabel>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Email address</FieldLabel>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Password</FieldLabel>
                    <input
                      type="password"
                      placeholder="Temporary password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                  <div>
                    <FieldLabel required>System role</FieldLabel>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    >
                      {(userRoles?.length ? userRoles : FALLBACK_USER_ROLES).map((role) => (
                        <option key={role} value={role}>
                          {userRoleLabels[role] || formatLabel(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className={`text-xs mt-4 ${theme.textMuted}`}>
                  The new user will need to change their password on first login.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5">
                  <button
                    onClick={handleCreateUser}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create user
                      </>
                    )}
                  </button>
                  {message && (
                    <Alert tone={message.tone} className="sm:flex-1">
                      {message.text}
                    </Alert>
                  )}
                </div>
              </div>

              {/* User list */}
              <div className="flex items-center justify-between mb-3 gap-3">
                <h3 className="font-semibold">All users</h3>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
              </div>

              <div className={`rounded-2xl border ${theme.border} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-500/5">
                      <tr>
                        <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>
                          Name
                        </th>
                        <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>
                          Email
                        </th>
                        <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>
                          Role
                        </th>
                        <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>
                          Status
                        </th>
                        <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>
                          Joined
                        </th>
                        <th className={`text-right py-3 px-4 font-semibold ${theme.textMuted}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme.border}`}>
                      {(visibleUsers || []).map((user) => (
                        <tr key={user.id} className="hover:bg-gray-500/5 transition-colors">
                          <td className="py-3 px-4 font-medium">{user.fullName}</td>
                          <td className={`py-3 px-4 ${theme.textMuted}`}>{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-medium">
                              {userRoleLabels[user.role] || formatLabel(user.role)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <StatusPill active={user.status === "active"} />
                          </td>
                          <td className={`py-3 px-4 ${theme.textMuted}`}>{user.joinedDate}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleViewUser(user.id)}
                                title="View / edit"
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                              >
                                <Eye size={15} className="text-emerald-500" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                title="Deactivate user"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={15} className="text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!visibleUsers || visibleUsers.length === 0) && (
                  <div className={`px-4 py-10 text-center ${theme.textMuted}`}>
                    No users found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------- VIEW / EDIT USER ----------------------------- */}
          {activeTab === "viewUser" && editableUser && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`inline-flex items-center gap-2 text-sm font-medium ${theme.textMuted} hover:text-emerald-500 transition-colors`}
                >
                  <ArrowLeft size={16} />
                  Back to users
                </button>
                <StatusPill active={editableUser.status === "active"} />
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  {editableUser.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{editableUser.fullName}</h2>
                  <p className={`text-sm ${theme.textMuted}`}>{editableUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <FieldLabel>Full name</FieldLabel>
                  {isEditing ? (
                    <input
                      value={editableUser.fullName}
                      onChange={(e) =>
                        setEditableUser({ ...editableUser, fullName: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  ) : (
                    <p className="text-sm font-medium py-2.5">{editableUser.fullName}</p>
                  )}
                </div>

                <div>
                  <FieldLabel>Email address</FieldLabel>
                  <p className={`text-sm font-medium py-2.5 ${theme.textMuted}`}>
                    {editableUser.email}
                  </p>
                </div>

                <div>
                  <FieldLabel>System role</FieldLabel>
                  {isEditing ? (
                    <select
                      value={editableUser.role}
                      onChange={(e) =>
                        setEditableUser({ ...editableUser, role: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    >
                      {(userRoles?.length ? userRoles : FALLBACK_USER_ROLES).map((role) => (
                        <option key={role} value={role}>
                          {userRoleLabels[role] || formatLabel(role)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-medium py-2.5">
                      {userRoleLabels[editableUser.role] || formatLabel(editableUser.role)}
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel>Account status</FieldLabel>
                  {isEditing ? (
                    <select
                      value={editableUser.status}
                      onChange={(e) =>
                        setEditableUser({ ...editableUser, status: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium py-2.5 capitalize">
                      {editableUser.status}
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel>Date registered</FieldLabel>
                  <p className={`text-sm font-medium py-2.5 ${theme.textMuted}`}>
                    {editableUser.joinedDate}
                  </p>
                </div>

                <div>
                  <FieldLabel>Last updated</FieldLabel>
                  <p className={`text-sm font-medium py-2.5 ${theme.textMuted}`}>
                    {editableUser.updatedAt}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className={`rounded-2xl border ${theme.border} p-5`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${theme.textMuted}`}>
                    Total samples
                  </p>
                  <p className="text-2xl font-bold">{editableUser.counts?.samples ?? 0}</p>
                </div>
                <div className={`rounded-2xl border ${theme.border} p-5`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${theme.textMuted}`}>
                    Total comments
                  </p>
                  <p className="text-2xl font-bold">{editableUser.counts?.comments ?? 0}</p>
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t ${theme.border}`}>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveUser}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                      >
                        <Check size={16} />
                        Save changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditableUser({ ...selectedUser });
                        }}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border ${theme.border} text-sm font-semibold hover:bg-gray-500/10 transition-colors`}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleToggleEdit}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                    >
                      <Edit size={16} />
                      Edit profile
                    </button>
                  )}
                </div>
                {message && <Alert tone={message.tone}>{message.text}</Alert>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign States modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div
            className={`${theme.card} rounded-3xl border ${theme.border} p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}
          >
            <h2 className="text-lg font-bold mb-5">Assign states to supervisor</h2>

            <div className="mb-4">
              <FieldLabel>Supervisor</FieldLabel>
              <select
                value={selectedSupervisor ?? ""}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setSelectedSupervisor(id);
                  if (id) {
                    const sup = supervisorsList.find((s) => s.id === id);
                    setSelectedStates(
                      (sup?.supervisorStates || []).map((ss) => ss.state?.id ?? ss.stateId),
                    );
                  } else {
                    setSelectedStates([]);
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${theme.border} bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <option value="">Choose a supervisor…</option>
                {supervisorsList.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.fullName} ({sup.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <FieldLabel>States</FieldLabel>
              <div className={`border ${theme.border} rounded-xl p-3 max-h-48 overflow-y-auto`}>
                {statesList.map((state) => (
                  <label
                    key={state.id}
                    className="flex items-center gap-2.5 py-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStates([...selectedStates, state.id]);
                        } else {
                          setSelectedStates(selectedStates.filter((id) => id !== state.id));
                        }
                      }}
                      className="rounded border-gray-400 w-4 h-4 accent-emerald-600"
                    />
                    <span>{state.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {assignError && <Alert tone="error" className="mb-4">{assignError}</Alert>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSupervisor(null);
                  setSelectedStates([]);
                  setAssignError(null);
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl border ${theme.border} text-sm font-medium hover:bg-gray-500/10 transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStates}
                disabled={assignLoading || !selectedSupervisor || selectedStates.length === 0}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {assignLoading ? "Assigning…" : "Assign states"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteCodeGenerate;