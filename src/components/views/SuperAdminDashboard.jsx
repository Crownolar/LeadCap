import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  MapPin,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  Search,
} from "lucide-react";
import StatCard from "../common/StatCard";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";

const SuperAdminDashboard = ({ theme: propTheme }) => {
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.auth);

  // State management
  const [supervisors, setSupervisors] = useState([]);
  const [states, setStates] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateSupervisor, setShowCreateSupervisor] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [selectedStates, setSelectedStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("supervisors");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const usersRes = await api.get("/users");
        const allUsers = usersRes.data.data || [];
        setUsers(allUsers);

        const statesRes = await api.get("/management/states", { params: { activeOnly: "true" } });
        const allStates = statesRes.data.data || [];
        setStates(allStates);

        const supervisorUsers = allUsers.filter((u) => u.role === "SUPERVISOR");
        setSupervisors(supervisorUsers);

        const supervisorCount =
          allUsers.filter((u) => u.role === "SUPERVISOR").length || 0;
        const dataCollectorCount =
          allUsers.filter((u) => u.role === "DATA_COLLECTOR").length || 0;
        const labAnalystCount =
          allUsers.filter((u) => u.role === "LAB_ANALYST").length || 0;
        const stateCount = allStates.length || 0;

        setStats({
          supervisors: supervisorCount,
          dataCollectors: dataCollectorCount,
          labAnalysts: labAnalystCount,
          states: stateCount,
        });

        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasPermission = () => {
    if (!currentUser) return false;
    const normalizedRole = currentUser.role
      ?.toLowerCase()
      .replace(/[\s_]/g, "");
    return (
      normalizedRole === "superadmin" || normalizedRole === "headresearcher"
    );
  };

  const handleAssignStates = async () => {
    if (!hasPermission()) {
      setError(
        "You don't have permission to assign states. Only SUPER_ADMIN or HEAD_RESEARCHER can perform this action."
      );
      return;
    }

    if (!selectedSupervisor || selectedStates.length === 0) {
      alert("Please select a supervisor and at least one state");
      return;
    }

    try {
      await api.post(`/supervisor/${selectedSupervisor}/states`, {
        stateIds: selectedStates,
      });

      const res = await api.get("/users");
      const allUsers = res.data.data || [];
      setUsers(allUsers);
      const supervisorUsers = allUsers.filter((u) => u.role === "SUPERVISOR");
      setSupervisors(supervisorUsers);

      setShowAssignModal(false);
      setSelectedSupervisor(null);
      setSelectedStates([]);
      alert("States assigned successfully!");
    } catch (err) {
      console.error("Failed to assign states:", err);
      const errorMsg =
        err.response?.data?.details ||
        err.response?.data?.message ||
        "Failed to assign states";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleUnassignState = async (supervisorId, stateId) => {
    if (!hasPermission()) {
      setError(
        "You don't have permission to unassign states. Only SUPER_ADMIN or HEAD_RESEARCHER can perform this action."
      );
      return;
    }

    if (!window.confirm("Are you sure you want to unassign this state?"))
      return;

    try {
      await api.delete(`/supervisor/${supervisorId}/states/${stateId}`);

      const res = await api.get("/users");
      const allUsers = res.data.data || [];
      setUsers(allUsers);
      const supervisorUsers = allUsers.filter((u) => u.role === "SUPERVISOR");
      setSupervisors(supervisorUsers);
      alert("State unassigned successfully!");
    } catch (err) {
      console.error("Failed to unassign state:", err);
      const errorMsg =
        err.response?.data?.details ||
        err.response?.data?.message ||
        "Failed to unassign state";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const getSupervisorByRole = (role) => {
    return users.filter((u) => u.role === role);
  };

  const filterUsers = (role) => {
    const filtered = users.filter((u) => u.role === role);
    if (searchTerm) {
      return filtered.filter(
        (u) =>
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  if (loading) {
    return (
      <p
        className={`text-center mt-6 sm:mt-10 text-base sm:text-lg animate-pulse ${theme?.text} px-4`}
      >
        Loading SuperAdmin dashboard...
      </p>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* HEADER */}
      <div className="mb-4 sm:mb-6">
        <h1
          className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme.text}`}
        >
          SuperAdmin Dashboard
        </h1>
        <p className={`${theme.textMuted} mt-1 text-sm sm:text-base`}>
          Manage supervisors, states, and users
        </p>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex gap-2 items-start text-sm sm:text-base">
          <AlertTriangle
            size={18}
            className="sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
          />
          <p className="break-words">{error}</p>
        </div>
      )}

      {/* PERMISSION INFO */}
      {!hasPermission() && (
        <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex gap-2 sm:gap-3">
            <AlertTriangle
              size={18}
              className="sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1 text-sm sm:text-base">
                Limited Permissions
              </h4>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                Your current role (<strong>{currentUser?.role}</strong>) does
                not have permission to manage supervisor state assignments. Only{" "}
                <strong>SUPER_ADMIN</strong> or <strong>HEAD_RESEARCHER</strong>{" "}
                roles can perform these actions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Users}
          label="Supervisors"
          value={stats.supervisors || 0}
          color="bg-blue-600"
          theme={theme}
        />
        <StatCard
          icon={Users}
          label="Data Collectors"
          value={stats.dataCollectors || 0}
          color="bg-green-600"
          theme={theme}
        />
        <StatCard
          icon={Users}
          label="Lab Analysts"
          value={stats.labAnalysts || 0}
          color="bg-purple-600"
          theme={theme}
        />
        <StatCard
          icon={MapPin}
          label="States"
          value={stats.states || 0}
          color="bg-orange-600"
          theme={theme}
        />
      </div>

      {/* TABS */}
      <div
        className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6`}
      >
        <div className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("supervisors")}
            className={`px-3 py-2 sm:px-4 text-sm sm:text-base font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "supervisors"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-600 dark:text-gray-400"
            }`}
          >
            Supervisors & States
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-2 sm:px-4 text-sm sm:text-base font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "users"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-600 dark:text-gray-400"
            }`}
          >
            All Users
          </button>
        </div>

        {/* SUPERVISORS TAB */}
        {activeTab === "supervisors" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between sm:items-center mb-4">
              <h3
                className={`text-base sm:text-lg font-semibold ${theme.text}`}
              >
                Supervisor Management
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(true);
                  setSelectedSupervisor(null);
                  setSelectedStates([]);
                }}
                disabled={!hasPermission()}
                title={
                  !hasPermission()
                    ? "Only SUPER_ADMIN or HEAD_RESEARCHER can assign states"
                    : ""
                }
                className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg transition ${
                  hasPermission()
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="truncate">Assign States</span>
              </button>
            </div>

            {/* SUPERVISORS LIST */}
            <div className="space-y-3">
              {getSupervisorByRole("SUPERVISOR").length > 0 ? (
                getSupervisorByRole("SUPERVISOR").map((supervisor) => (
                  <div
                    key={supervisor.id}
                    className={`${theme.bg} p-3 sm:p-4 rounded-lg border ${theme?.border}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold text-base sm:text-lg ${theme.text} truncate`}
                        >
                          {supervisor.fullName}
                        </h4>
                        <p
                          className={`text-xs sm:text-sm ${theme?.textMuted} truncate`}
                        >
                          {supervisor.email}
                        </p>
                        {supervisor.phone && (
                          <p
                            className={`text-xs sm:text-sm ${theme?.textMuted}`}
                          >
                            {supervisor.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            if (!hasPermission()) {
                              setError(
                                "You don't have permission to edit supervisor states"
                              );
                              return;
                            }
                            setSelectedSupervisor(supervisor.id);
                            const currentStateIds = (supervisor.supervisorStates || []).map(
                              (ss) => ss.state?.id ?? ss.stateId
                            );
                            setSelectedStates(currentStateIds);
                            setShowAssignModal(true);
                          }}
                          disabled={!hasPermission()}
                          title={
                            !hasPermission()
                              ? "Only SUPER_ADMIN or HEAD_RESEARCHER can edit"
                              : "Edit states"
                          }
                          className={`${theme.text} p-2 rounded transition ${
                            hasPermission()
                              ? "hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Edit2
                            size={16}
                            className="sm:w-[18px] sm:h-[18px]"
                          />
                        </button>
                      </div>
                    </div>

                    {/* ASSIGNED STATES */}
                    {supervisor.supervisorStates &&
                    supervisor.supervisorStates.length > 0 ? (
                      <div className="mt-3 sm:mt-4">
                        <p
                          className={`text-xs sm:text-sm font-semibold mb-2 ${theme?.textMuted}`}
                        >
                          Assigned States ({supervisor.supervisorStates.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {supervisor.supervisorStates.map((ss) => (
                            <div
                              key={ss.stateId}
                              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded-full text-xs sm:text-sm"
                            >
                              <MapPin
                                size={12}
                                className="sm:w-[14px] sm:h-[14px]"
                              />
                              <span className="truncate max-w-[120px] sm:max-w-none">
                                {ss.state?.name || "Unknown"}
                              </span>
                              <button
                                onClick={() =>
                                  handleUnassignState(supervisor.id, ss.stateId)
                                }
                                disabled={!hasPermission()}
                                title={
                                  !hasPermission()
                                    ? "Only SUPER_ADMIN or HEAD_RESEARCHER can remove"
                                    : "Remove state assignment"
                                }
                                className={`ml-1 transition ${
                                  hasPermission()
                                    ? "hover:text-red-600 cursor-pointer"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <Trash2
                                  size={12}
                                  className="sm:w-[14px] sm:h-[14px]"
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`text-xs sm:text-sm mt-3 ${theme?.textMuted}`}
                      >
                        No states assigned
                      </p>
                    )}

                    {/* STATUS */}
                    <div className="mt-3 flex items-center gap-2">
                      {supervisor.isActive ? (
                        <>
                          <CheckCircle
                            size={14}
                            className="sm:w-4 sm:h-4 text-green-600"
                          />
                          <span className="text-xs sm:text-sm text-green-600">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle
                            size={14}
                            className="sm:w-4 sm:h-4 text-red-600"
                          />
                          <span className="text-xs sm:text-sm text-red-600">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p
                  className={`text-center py-6 sm:py-8 text-sm ${theme?.textMuted}`}
                >
                  No supervisors found
                </p>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border rounded-lg ${theme?.input}`}
              />
            </div>

            {/* DATA COLLECTORS */}
            <div>
              <h4
                className={`${theme.text} text-sm sm:text-base font-semibold mb-3 flex items-center gap-2`}
              >
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" /> Data
                Collectors ({filterUsers("DATA_COLLECTOR").length})
              </h4>
              <div className="space-y-2 ml-2 sm:ml-4">
                {filterUsers("DATA_COLLECTOR").map((user) => (
                  <div
                    key={user.id}
                    className={`${theme.bg} p-2.5 sm:p-3 rounded border ${theme?.border} flex flex-col sm:flex-row justify-between sm:items-center gap-2`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${theme.text} text-sm sm:text-base font-semibold truncate`}
                      >
                        {user.fullName}
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${theme?.textMuted} truncate`}
                      >
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {user.supervisorId && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                          Assigned
                        </span>
                      )}
                      {user.isActive ? (
                        <CheckCircle
                          size={14}
                          className="sm:w-4 sm:h-4 text-green-600"
                        />
                      ) : (
                        <AlertTriangle
                          size={14}
                          className="sm:w-4 sm:h-4 text-red-600"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LAB ANALYSTS */}
            <div>
              <h4
                className={`${theme.text} text-sm sm:text-base font-semibold mb-3 flex items-center gap-2`}
              >
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" /> Lab
                Analysts ({filterUsers("LAB_ANALYST").length})
              </h4>
              <div className="space-y-2 ml-2 sm:ml-4">
                {filterUsers("LAB_ANALYST").map((user) => (
                  <div
                    key={user.id}
                    className={`${theme.bg} p-2.5 sm:p-3 rounded border ${theme?.border} flex flex-col sm:flex-row justify-between sm:items-center gap-2`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${theme.text} text-sm sm:text-base font-semibold truncate`}
                      >
                        {user.fullName}
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${theme?.textMuted} truncate`}
                      >
                        {user.email}
                      </p>
                    </div>
                    <div className="self-end sm:self-auto">
                      {user.isActive ? (
                        <CheckCircle
                          size={14}
                          className="sm:w-4 sm:h-4 text-green-600"
                        />
                      ) : (
                        <AlertTriangle
                          size={14}
                          className="sm:w-4 sm:h-4 text-red-600"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* POLICY MAKERS */}
            <div>
              <h4
                className={`${theme.text} text-sm sm:text-base font-semibold mb-3 flex items-center gap-2`}
              >
                <Users size={16} className="sm:w-[18px] sm:h-[18px]" /> Policy
                Makers (
                {filterUsers("POLICY_MAKER_SON").length +
                  filterUsers("POLICY_MAKER_NAFDAC").length +
                  filterUsers("POLICY_MAKER_RESOLVE").length +
                  filterUsers("POLICY_MAKER_UNIVERSITY").length}
                )
              </h4>
              <div className="space-y-2 ml-2 sm:ml-4">
                {[
                  ...filterUsers("POLICY_MAKER_SON"),
                  ...filterUsers("POLICY_MAKER_NAFDAC"),
                  ...filterUsers("POLICY_MAKER_RESOLVE"),
                  ...filterUsers("POLICY_MAKER_UNIVERSITY"),
                ].map((user) => (
                  <div
                    key={user.id}
                    className={`${theme.bg} p-2.5 sm:p-3 rounded border ${theme?.border} flex flex-col sm:flex-row justify-between sm:items-center gap-2`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${theme.text} text-sm sm:text-base font-semibold truncate`}
                      >
                        {user.fullName}
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${theme.textMuted} truncate`}
                      >
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.role.replace("POLICY_MAKER_", "")}
                      </p>
                    </div>
                    <div className="self-end sm:self-auto">
                      {user.isActive ? (
                        <CheckCircle
                          size={14}
                          className="sm:w-4 sm:h-4 text-green-600"
                        />
                      ) : (
                        <AlertTriangle
                          size={14}
                          className="sm:w-4 sm:h-4 text-red-600"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN STATES MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div
            className={`${theme?.card} rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}
          >
            <h2
              className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${theme.text}`}
            >
              Assign States to Supervisor
            </h2>

            {/* SELECT SUPERVISOR */}
            <div className="mb-3 sm:mb-4">
              <label
                className={`${theme.text} block text-xs sm:text-sm font-semibold mb-2`}
              >
                Select Supervisor
              </label>
              <select
                value={selectedSupervisor || ""}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setSelectedSupervisor(id);
                  if (id) {
                    const sup = getSupervisorByRole("SUPERVISOR").find((s) => s.id === id);
                    const currentStateIds = (sup?.supervisorStates || []).map(
                      (ss) => ss.state?.id ?? ss.stateId
                    );
                    setSelectedStates(currentStateIds);
                  } else {
                    setSelectedStates([]);
                  }
                }}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg ${theme?.input}`}
              >
                <option value="">Choose a supervisor...</option>
                {getSupervisorByRole("SUPERVISOR").map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.fullName} ({sup.email})
                  </option>
                ))}
              </select>
            </div>

            {/* SELECT STATES */}
            <div className="mb-4 sm:mb-6">
              <label
                className={`block text-xs sm:text-sm font-semibold mb-2 ${theme.text}`}
              >
                Select States
              </label>
              <div
                className={`${theme.text} border rounded-lg p-2 sm:p-3 max-h-48 sm:max-h-64 overflow-y-auto ${theme.bg}`}
              >
                {states.map((state) => (
                  <label
                    key={state.id}
                    className="flex items-center gap-2 py-1.5 sm:py-2 cursor-pointer text-sm sm:text-base"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStates([...selectedStates, state.id]);
                        } else {
                          setSelectedStates(
                            selectedStates.filter((id) => id !== state.id)
                          );
                        }
                      }}
                      className="rounded"
                    />
                    <span>{state.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSupervisor(null);
                  setSelectedStates([]);
                }}
                className={`flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${theme.text}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStates}
                className="flex-1 px-4 py-2 text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
              >
                Assign States
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
