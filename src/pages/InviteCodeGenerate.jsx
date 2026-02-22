import {
  KeyRound,
  Users,
  Beaker,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  MapPin,
  Plus,
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

const InviteCodeGenerate = ({ theme: themeProp = {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme: contextTheme } = useTheme();

  const { users, selectedUser, loading, error, pagination } = useSelector(
    (state) => state.users
  );
  const { userRoles, userRoleLabels } = useEnums();

  const defaultTheme = {
    bg: "bg-gray-900",
    text: "text-gray-100",
    card: "bg-gray-800",
    border: "border-gray-700",
    textMuted: "text-gray-400",
  };
  const currentTheme = { ...defaultTheme, ...contextTheme, ...themeProp };

  const [activeTab, setActiveTab] = useState("invite");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [message, setMessage] = useState("");
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

  useEffect(() => {
    dispatch(getAllUsers({ page: 1, limit: 20 })).then((res) =>
      console.log("Fetched Users (dispatch result):", res.payload)
    );
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

  useEffect(() => {
    if (selectedUser) {
      setEditableUser({ ...selectedUser });
      setIsEditing(false);
    } else {
      setEditableUser(null);
      setIsEditing(false);
    }
  }, [selectedUser]);

  const handleGenerateInviteCode = async (role) => {
    setInviteLoading(true);
    setGeneratedCode("");
    setMessage("");

    try {
      const res = await api.post("/auth/generate-invite", {
        role: role.toUpperCase(),
      });
      const data = res.data;

      if (!data.success)
        throw new Error(data.message || "Failed to generate invite code");

      const code = data.data?.code || data.code;
      setGeneratedCode(code);
      await navigator.clipboard.writeText(code);
      setMessage(`✅ Invite code for ${role} copied to clipboard!`);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "❌ Failed to generate invite code.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateUser = () => {
    setMessage("");

    if (
      !newUser.fullName.trim() ||
      !newUser.email.trim() ||
      !newUser.password.trim()
    ) {
      setMessage("❌ Full name, email and password are required.");
      return;
    }

    dispatch(createUser(newUser)).then((res) => {
      console.log("CreateUser Dispatch Result:", res);

      if (!res.error) {
        setMessage("✅ User created successfully!");
        setNewUser({
          fullName: "",
          email: "",
          password: "",
          role: "HEAD_RESEARCHER",
        });
        dispatch(getAllUsers({ page: 1, limit: 20 }));
      } else {
        setMessage(
          `❌ ${res.payload || res.error?.message || "Failed to create user"}`
        );
      }
    });
  };

  const handleViewUser = (userId) => {
    dispatch(getUserById(userId)).then((res) => {
      if (!res.error) {
        setActiveTab("viewUser");
      } else {
        setMessage(`❌ ${res.payload || "Failed to fetch user"}`);
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Deactivate this user? They will no longer be able to sign in."))
      return;
    try {
      await api.delete(`/users/${userId}`);
      setMessage("User deactivated successfully.");
      dispatch(getAllUsers({ page: 1, limit: 20 }));
    } catch (err) {
      setMessage(
        err.response?.data?.error || err.message || "Failed to deactivate user"
      );
    }
  };

  const handleToggleEdit = () => {
    setIsEditing((v) => !v);
    if (!editableUser && selectedUser) setEditableUser({ ...selectedUser });
  };

  const handleSaveUser = () => {
    if (!editableUser) return;
    setMessage("");

    const updatedData = {
      fullName: editableUser.fullName,
      role: editableUser.role,
      isActive: editableUser.status === "active",
    };

    dispatch(updateUser({ id: editableUser.id, updatedData })).then((res) => {
      console.log("UpdateUser Dispatch Result:", res);
      if (!res.error) {
        setMessage("✅ User updated successfully!");
        setIsEditing(false);
        dispatch(getAllUsers({ page: 1, limit: 20 }));
        dispatch(getUserById(editableUser.id));
      } else {
        setMessage(`❌ ${res.payload || "Failed to update user"}`);
      }
    });
  };

  const supervisorsList = (adminUsers || []).filter((u) => u.role === "SUPERVISOR");

  const openAssignModalForEdit = (supervisor) => {
    setSelectedSupervisor(supervisor.id);
    setSelectedStates(
      (supervisor.supervisorStates || []).map((ss) => ss.state?.id ?? ss.stateId)
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
      setMessage("States assigned successfully.");
      dispatch(getAllUsers({ page: 1, limit: 20 }));
    } catch (err) {
      setAssignError(
        err.response?.data?.error || err.response?.data?.message || "Failed to assign states"
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
      setMessage("State unassigned.");
      dispatch(getAllUsers({ page: 1, limit: 20 }));
    } catch (err) {
      setMessage(
        err.response?.data?.error || err.response?.data?.message || "Failed to unassign"
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      inactive: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs border ${
          statusStyles[status] || statusStyles.inactive
        }`}
      >
        {status}
      </span>
    );
  };

  const tabs = [
    { id: "invite", label: "Invite Codes", icon: KeyRound },
    { id: "users", label: "Users", icon: Users },
    { id: "supervisors", label: "Supervisors & States", icon: MapPin },
    { id: "samples", label: "Samples", icon: Beaker },
    { id: "comments", label: "Comments", icon: MessageSquare },
    { id: "viewUser", label: "View User", icon: Eye },
  ];

  const filteredUsers = users?.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} p-6`}>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2'>
            Super Admin Dashboard
          </h1>
          <p className={currentTheme.textMuted}>
            Manage users, samples, and system settings
          </p>
        </div>

        <div
          role='tablist'
          aria-label='Dashboard sections'
          className='flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-gray-700/50 -mx-1 px-1'
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role='tab'
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all whitespace-nowrap border-b-2 -mb-px focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 font-semibold"
                    : `border-transparent ${currentTheme.text} ${currentTheme.textMuted} hover:text-gray-200 hover:bg-gray-700/50`
                }`}
              >
                <Icon size={18} className='flex-shrink-0' />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`panel-${activeTab}`}
          role='tabpanel'
          aria-labelledby={`tab-${activeTab}`}
          className={`${currentTheme.card} rounded-2xl shadow-xl border ${currentTheme.border} p-6`}
        >
          {activeTab === "invite" && (
            <div>
              <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                <KeyRound className='text-emerald-500' /> Generate Invite Codes
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 '>
                {["POLICY_MAKER", "HEAD_RESEARCHER", "ADMIN"].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleGenerateInviteCode(role)}
                    disabled={inviteLoading}
                    className='bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:shadow-none disabled:cursor-not-allowed [@media(max-width:350px)]: text-sm'
                  >
                    {inviteLoading ? (
                      <>
                        <span className='inline-block animate-spin mr-2'>
                          ⏳
                        </span>
                        Generating...
                      </>
                    ) : (
                      `Generate ${role.replace(/_/g, " ")}`
                    )}
                  </button>
                ))}
              </div>

              {generatedCode && (
                <div className='p-5 bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-500/30 rounded-lg backdrop-blur-sm'>
                  <p className='text-xs font-medium text-emerald-400 mb-3 uppercase tracking-wide'>
                    Generated Invite Code
                  </p>
                  <p className='text-emerald-300 font-mono text-lg text-center p-3 bg-gray-800/50 rounded border border-emerald-500/20 select-all cursor-pointer hover:bg-gray-800 transition-colors duration-200'>
                    {generatedCode}
                  </p>
                </div>
              )}

              {message && (
                <div className='mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg'>
                  <p className='text-sm text-center text-emerald-400 font-medium'>
                    {message}
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/dashboard")}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 '
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                  />
                </svg>
                Go to Dashboard
              </button>
            </div>
          )}

          {activeTab === "supervisors" && (
            <div>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6'>
                <h2 className='text-xl font-bold flex items-center gap-2'>
                  <MapPin className='text-emerald-500' /> Supervisor Management
                </h2>
                <button
                  onClick={openAssignModalNew}
                  className='flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-md'
                >
                  <Plus size={18} />
                  Assign States
                </button>
              </div>
              {message && (
                <div className='mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm'>
                  {message}
                </div>
              )}
              <div className='space-y-4'>
                {supervisorsList.length === 0 ? (
                  <p className={currentTheme.textMuted}>
                    No supervisors found. Create a user with role SUPERVISOR first.
                  </p>
                ) : (
                  supervisorsList.map((supervisor) => (
                    <div
                      key={supervisor.id}
                      className={`rounded-xl border ${currentTheme.border} p-4 ${currentTheme.card} hover:shadow-md transition`}
                    >
                      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-lg truncate'>
                            {supervisor.fullName}
                          </h3>
                          <p className={`text-sm truncate ${currentTheme.textMuted}`}>
                            {supervisor.email}
                          </p>
                        </div>
                        <button
                          onClick={() => openAssignModalForEdit(supervisor)}
                          className='self-end sm:self-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 text-sm font-medium transition'
                        >
                          <Edit size={16} />
                          Edit states
                        </button>
                      </div>
                      <div className='mt-3 pt-3 border-t border-gray-700/50'>
                        <p className={`text-xs font-semibold mb-2 ${currentTheme.textMuted}`}>
                          Assigned States ({supervisor.supervisorStates?.length ?? 0})
                        </p>
                        {supervisor.supervisorStates && supervisor.supervisorStates.length > 0 ? (
                          <div className='flex flex-wrap gap-2'>
                            {supervisor.supervisorStates.map((ss) => (
                              <span
                                key={ss.stateId}
                                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm'
                              >
                                <MapPin size={14} />
                                {ss.state?.name ?? ss.stateId}
                                <button
                                  type='button'
                                  onClick={() => handleUnassignState(supervisor.id, ss.stateId)}
                                  className='ml-1 p-0.5 rounded hover:bg-emerald-500/30 text-emerald-200'
                                  aria-label='Unassign'
                                >
                                  <Trash2 size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm ${currentTheme.textMuted}`}>
                            No states assigned
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold flex items-center gap-2'>
                  <Users className='text-emerald-500' /> User Management
                </h2>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search users...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  />
                  <Eye
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={18}
                  />
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden'>
                <div className=' bg-gradient-to-r from-emerald-400 to-teal-500 px-8 py-6 border-b border-teal-700'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm'>
                      <svg
                        className='w-6 h-6 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className='text-2xl font-bold text-white'>
                        Register New User
                      </h3>
                      <p className='text-blue-200 text-sm mt-1'>
                        LeadCap Agents.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='p-8'>
                  <div className='mb-8'>
                    <h4 className='text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-emerald-600'>
                      User Credentials
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                          Full Name <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='text'
                          placeholder='Enter full name'
                          value={newUser.fullName}
                          onChange={(e) =>
                            setNewUser({ ...newUser, fullName: e.target.value })
                          }
                          className='w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-800 placeholder-gray-400 font-medium transition'
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                          Email Address <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='email'
                          placeholder='user@example.com'
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          className='w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-800 placeholder-gray-400 font-medium transition'
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                          Password <span className='text-red-500'>*</span>
                        </label>
                        <input
                          type='password'
                          placeholder='Enter secure password'
                          value={newUser.password}
                          onChange={(e) =>
                            setNewUser({ ...newUser, password: e.target.value })
                          }
                          className='w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-800 placeholder-gray-400 font-medium transition'
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                          System Role <span className='text-red-500'>*</span>
                        </label>
                        <select
                          value={newUser.role}
                          onChange={(e) =>
                            setNewUser({ ...newUser, role: e.target.value })
                          }
                          className='w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-800 font-medium transition'
                        >
                          {(userRoles.length ? userRoles : ['SUPER_ADMIN', 'HEAD_RESEARCHER', 'DATA_COLLECTOR', 'SUPERVISOR', 'LAB_ANALYST', 'POLICY_MAKER_SON', 'POLICY_MAKER_NAFDAC', 'POLICY_MAKER_RESOLVE', 'POLICY_MAKER_UNIVERSITY']).map((role) => (
                            <option key={role} value={role}>
                              {userRoleLabels[role] || role.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className='mt-6 bg-blue-50 border-l-4 border-emerald-600 p-4 rounded-r-lg'>
                      <div className='flex items-start gap-3'>
                        <svg
                          className='w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <div>
                          <p className='text-sm font-semibold text-emerald-800 mb-1'>
                            Important Information
                          </p>
                          <p className='text-sm text-emerald-700'>
                            Please ensure all information is accurate. The user
                            will receive credentials via email and must change
                            their password on first login.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-6 border-t border-gray-200'>
                    <div className='flex gap-3'>
                      <button
                        onClick={handleCreateUser}
                        disabled={loading}
                        className={`${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg"
                        } text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2`}
                      >
                        {loading ? (
                          <>
                            <svg
                              className='animate-spin h-5 w-5 text-white'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                            >
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                              ></circle>
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              ></path>
                            </svg>
                            Creating User...
                          </>
                        ) : (
                          <>
                            <svg
                              className='w-5 h-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 4v16m8-8H4'
                              />
                            </svg>
                            Create User Account
                          </>
                        )}
                      </button>
                    </div>

                    {message && (
                      <div className='bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg flex items-center gap-2'>
                        <svg
                          className='w-5 h-5 text-emerald-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <span className='font-medium text-sm'>{message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='overflow-x-auto rounded-lg border border-gray-700'>
                <table className='w-full'>
                  <thead className='bg-gray-700/50'>
                    <tr className='border-b border-gray-600 pt-24'>
                      <th className='text-left py-4 px-6 text-sm font-semibold text-emerald-400'>
                        Name
                      </th>
                      <th className='text-left py-4 px-6 text-sm font-semibold text-emerald-400'>
                        Email
                      </th>
                      <th className='text-left py-4 px-6 text-sm font-semibold text-emerald-400'>
                        Role
                      </th>
                      <th className='text-left py-4 px-6 text-sm font-semibold text-emerald-400'>
                        Status
                      </th>
                      <th className='text-left py-4 px-6 text-sm font-semibold text-emerald-400'>
                        Joined
                      </th>
                      <th className='text-center py-4 px-6 text-sm font-semibold text-emerald-400'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredUsers && filteredUsers.length > 0
                      ? filteredUsers
                      : users
                    ).map((user) => (
                      <tr
                        key={user.id}
                        className='border-b border-gray-700/50 hover:bg-gray-700/30 transition'
                      >
                        <td className='py-3 px-4'>{user.fullName}</td>
                        <td className='py-3 px-4 text-sm text-gray-400'>
                          {user.email}
                        </td>
                        <td className='py-3 px-4'>
                          <span className='text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded'>
                            {user.role}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          {getStatusBadge(user.status)}
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-400'>
                          {user.joinedDate}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex gap-2 justify-center'>
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className='p-1 hover:bg-emerald-500/20 rounded transition'
                            >
                              <Eye size={16} className='text-emerald-400' />
                            </button>

                            <button
                              onClick={() => handleViewUser(user.id)}
                              title='View / Edit'
                              className='p-1 hover:bg-blue-500/20 rounded transition'
                            >
                              <Edit size={16} className='text-blue-400' />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              title='Deactivate user'
                              className='p-1 hover:bg-red-500/20 rounded transition'
                            >
                              <Trash2 size={16} className='text-red-400' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "viewUser" && editableUser && (
            <div className='bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden'>
              <div className='bg-gradient-to-r from-emerald-400 to-teal-500 px-8 py-6 border-b border-teal-700'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm'>
                      <Eye className='text-white w-6 h-6' />
                    </div>
                    <div>
                      <h2 className='text-2xl font-bold text-white'>
                        User Profile
                      </h2>
                      <p className='text-blue-200 text-sm mt-1'>
                        National Health Information System
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        editableUser.status === "active"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                          : "bg-red-500/20 text-red-300 border border-red-400/30"
                      }`}
                    >
                      {editableUser.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='p-8'>
                <div className='mb-8'>
                  <h3 className='text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-600'>
                    Personal Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          value={editableUser.fullName}
                          onChange={(e) =>
                            setEditableUser({
                              ...editableUser,
                              fullName: e.target.value,
                            })
                          }
                          className='w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-teal-600 focus:outline-none bg-white text-gray-800 font-medium transition'
                        />
                      ) : (
                        <p className='text-gray-900 font-medium text-base px-4 py-2.5 bg-gray-50 rounded-lg'>
                          {editableUser.fullName}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                        Email Address
                      </label>
                      <p className='text-gray-900 font-medium text-base px-4 py-2.5 bg-gray-50 rounded-lg'>
                        {editableUser.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-emerald-600'>
                    Role & Access Level
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                        System Role
                      </label>
                      {isEditing ? (
                        <select
                          value={editableUser.role}
                          onChange={(e) =>
                            setEditableUser({
                              ...editableUser,
                              role: e.target.value,
                            })
                          }
                          className='w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-teal-600 focus:outline-none bg-white text-gray-800 font-medium transition'
                        >
                          {(userRoles.length ? userRoles : ['SUPER_ADMIN', 'HEAD_RESEARCHER', 'DATA_COLLECTOR', 'SUPERVISOR', 'LAB_ANALYST', 'POLICY_MAKER_SON', 'POLICY_MAKER_NAFDAC', 'POLICY_MAKER_RESOLVE', 'POLICY_MAKER_UNIVERSITY']).map((role) => (
                            <option key={role} value={role}>
                              {userRoleLabels[role] || role.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className='text-gray-900 font-medium text-base px-4 py-2.5 bg-gray-50 rounded-lg'>
                          {editableUser.role
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                        Account Status
                      </label>
                      {isEditing ? (
                        <select
                          value={editableUser.status}
                          onChange={(e) =>
                            setEditableUser({
                              ...editableUser,
                              status: e.target.value,
                            })
                          }
                          className='w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-teal-600 focus:outline-none bg-white text-gray-800 font-medium transition'
                        >
                          <option value='active'>Active</option>
                          <option value='inactive'>Inactive</option>
                        </select>
                      ) : (
                        <p className='text-gray-900 font-medium text-base px-4 py-2.5 bg-gray-50 rounded-lg capitalize'>
                          {editableUser.status}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-600'>
                    Account Timeline
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                        Date Registered
                      </label>
                      <p className='text-gray-900 font-medium text-base px-4 py-2.5 bg-gray-50 rounded-lg'>
                        {editableUser.joinedDate}
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                        Last Updated
                      </label>
                      <p className='text-gray-900 font-medium text-base px-4 py-2.5 bg-gray-50 rounded-lg'>
                        {editableUser.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='mb-8'>
                  <h3 className='text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-600'>
                    Activity Statistics
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-semibold text-teal-700 uppercase tracking-wide mb-1'>
                            Total Samples
                          </p>
                          <p className='text-3xl font-bold text-teal-900'>
                            {editableUser.counts?.samples ?? 0}
                          </p>
                        </div>
                        <div className='w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center'>
                          <span className='text-white text-xl font-bold'>
                            {editableUser.counts?.samples ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-1'>
                            Total Comments
                          </p>
                          <p className='text-3xl font-bold text-emerald-900'>
                            {editableUser.counts?.comments ?? 0}
                          </p>
                        </div>
                        <div className='w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center'>
                          <span className='text-white text-xl font-bold'>
                            {editableUser.counts?.comments ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-6 border-t border-gray-200'>
                  <div className='flex gap-3'>
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveUser}
                          className='bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditableUser({ ...selectedUser });
                          }}
                          className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleToggleEdit}
                          className='bg-teal-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                            />
                          </svg>
                          Edit Profile
                        </button>
                        <button
                          onClick={() => setActiveTab("users")}
                          className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M10 19l-7-7m0 0l7-7m-7 7h18'
                            />
                          </svg>
                          Back to Users
                        </button>
                      </>
                    )}
                  </div>

                  {message && (
                    <div className='bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg flex items-center gap-2'>
                      <svg
                        className='w-5 h-5 text-emerald-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <span className='font-medium text-sm'>{message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign States modal */}
      {showAssignModal && (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50'>
          <div
            className={`${currentTheme.card} rounded-2xl shadow-2xl border ${currentTheme.border} p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}
          >
            <h2 className='text-xl font-bold mb-4'>Assign States to Supervisor</h2>

            <div className='mb-4'>
              <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>
                Select Supervisor
              </label>
              <select
                value={selectedSupervisor ?? ''}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setSelectedSupervisor(id);
                  if (id) {
                    const sup = supervisorsList.find((s) => s.id === id);
                    setSelectedStates(
                      (sup?.supervisorStates || []).map((ss) => ss.state?.id ?? ss.stateId)
                    );
                  } else {
                    setSelectedStates([]);
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg border ${currentTheme.input}`}
              >
                <option value=''>Choose a supervisor...</option>
                {supervisorsList.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.fullName} ({sup.email})
                  </option>
                ))}
              </select>
            </div>

            <div className='mb-6'>
              <label className={`block text-sm font-semibold mb-2 ${currentTheme.text}`}>
                Select States
              </label>
              <div
                className={`border rounded-lg p-3 max-h-48 overflow-y-auto ${currentTheme.bg}`}
              >
                {statesList.map((state) => (
                  <label
                    key={state.id}
                    className='flex items-center gap-2 py-2 cursor-pointer text-sm'
                  >
                    <input
                      type='checkbox'
                      checked={selectedStates.includes(state.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStates([...selectedStates, state.id]);
                        } else {
                          setSelectedStates(selectedStates.filter((id) => id !== state.id));
                        }
                      }}
                      className='rounded border-gray-400'
                    />
                    <span>{state.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {assignError && (
              <div className='mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
                {assignError}
              </div>
            )}

            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSupervisor(null);
                  setSelectedStates([]);
                  setAssignError(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg border ${currentTheme.border} ${currentTheme.text} hover:opacity-90 transition`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStates}
                disabled={assignLoading || !selectedSupervisor || selectedStates.length === 0}
                className='flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition'
              >
                {assignLoading ? 'Assigning...' : 'Assign States'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteCodeGenerate;
