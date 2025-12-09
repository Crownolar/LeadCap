import { useState, useEffect } from "react";

const UserFormModal = ({ theme = {}, onClose, onCreateUser, loading }) => {
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "HEAD_RESEARCHER",
  });

  const defaultTheme = {
    bg: "bg-gray-900",
    text: "text-gray-100",
    card: "bg-gray-800",
    border: "border-gray-700",
    textMuted: "text-gray-400",
  };
  const currentTheme = { ...defaultTheme, ...theme };

  const handleSubmit = () => {
    if (!newUser.fullName || !newUser.email || !newUser.password) return;
    onCreateUser(newUser);
    setNewUser({
      fullName: "",
      email: "",
      password: "",
      role: "HEAD_RESEARCHER",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-3xl p-6 rounded-2xl shadow-xl ${currentTheme.card} border ${currentTheme.border}`}
      >
        <h2 className="text-xl font-bold mb-4">Register New User</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.fullName}
            onChange={(e) =>
              setNewUser({ ...newUser, fullName: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-teal-600"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-teal-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-teal-600"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-teal-600"
          >
            <option value="SUPER_ADMIN">Super Administrator</option>
            <option value="HEAD_RESEARCHER">Head Researcher</option>
            <option value="ADMIN">Administrator</option>
            <option value="DATA_COLLECTOR">Data Collector</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="POLICY_MAKER_SON">Policy Maker - SON</option>
            <option value="POLICY_MAKER_NAFDAC">Policy Maker - NAFDAC</option>
            <option value="POLICY_MAKER_RESOLVE">Policy Maker - RESOLVE</option>
            <option value="POLICY_MAKER_UNIVERSITY">
              Policy Maker - University
            </option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-lg transition"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
