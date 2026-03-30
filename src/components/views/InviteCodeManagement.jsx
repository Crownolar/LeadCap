// import React, { useState, useEffect } from "react";
// import { Copy, Trash2, Plus, X, Lock } from "lucide-react";
// import api from "../../utils/api";
// import { useSelector } from "react-redux";
// import { useTheme } from "../../context/ThemeContext";

// const InviteCodeManagement = () => {
//   const [inviteCodes, setInviteCodes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [filterRole, setFilterRole] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [copiedCode, setCopiedCode] = useState(null);
//   const [formData, setFormData] = useState({
//     role: "DATA_COLLECTOR",
//     organization: "",
//   });
//   const { currentUser } = useSelector((state) => state.auth);
//   const { theme } = useTheme();
//   useEffect(() => {
//     fetchInviteCodes();
//   }, []);

//   const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");

//   if (normalizedRole !== "superadmin") {
//     return (
//       <div
//         className={`${theme?.bg} min-h-screen flex items-center justify-center p-4`}
//       >
//         <div
//           className={`${theme?.card} rounded-lg border ${theme?.border} shadow-md p-6 sm:p-8 text-center max-w-md`}
//         >
//           <Lock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-yellow-600" />
//           <h2 className={`${theme?.text} text-xl sm:text-2xl font-bold mb-2`}>
//             Access Restricted
//           </h2>
//           <p className={`${theme?.textMuted} text-sm sm:text-base`}>
//             Invite code management is only available to Super Administrators.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const roles = [
//     "HEAD_RESEARCHER",
//     "DATA_COLLECTOR",
//     "SUPERVISOR",
//     "POLICY_MAKER_SON",
//     "POLICY_MAKER_NAFDAC",
//     "POLICY_MAKER_RESOLVE",
//     "POLICY_MAKER_UNIVERSITY",
//   ];

//   const fetchInviteCodes = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/auth/invites");
//       setInviteCodes(response.data.data || []);
//       setError(null);
//     } catch (err) {
//       setError(
//         "Failed to fetch invite codes: " +
//           (err.response?.data?.error || err.message)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGenerateInvite = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         role: formData.role,
//         ...(formData.role.startsWith("POLICY_MAKER") && {
//           organization: formData.organization,
//         }),
//       };

//       const response = await api.post("/auth/generate-invite", payload);

//       setSuccess(`Invite code generated: ${response.data.data.code}`);
//       fetchInviteCodes();
//       setShowForm(false);
//       setFormData({ role: "DATA_COLLECTOR", organization: "" });

//       setTimeout(() => setSuccess(null), 5000);
//     } catch (err) {
//       setError(
//         "Failed to generate invite code: " +
//           (err.response?.data?.error || err.message)
//       );
//     }
//   };

//   const handleDeleteInvite = async (id) => {
//     if (confirm("Are you sure you want to delete this invite code?")) {
//       try {
//         await api.delete(`/auth/invites/${id}`);
//         fetchInviteCodes();
//         setSuccess("Invite code deleted");
//         setTimeout(() => setSuccess(null), 3000);
//       } catch (err) {
//         setError(
//           "Failed to delete invite code: " +
//             (err.response?.data?.error || err.message)
//         );
//       }
//     }
//   };

//   const handleCopyCode = (code) => {
//     navigator.clipboard.writeText(code);
//     setCopiedCode(code);
//     setTimeout(() => setCopiedCode(null), 2000);
//   };

//   const filteredCodes = inviteCodes.filter((ic) => {
//     const matchesRole = filterRole === "all" || ic.role === filterRole;
//     const matchesStatus =
//       filterStatus === "all" ||
//       (filterStatus === "used" ? ic.isUsed : !ic.isUsed);
//     return matchesRole && matchesStatus;
//   });

//   return (
//     <div className={`p-3 sm:p-4 md:p-6 ${theme?.bg}`}>
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
//           <h1
//             className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme?.text}`}
//           >
//             Invite Code Management
//           </h1>
//           <button
//             onClick={() => setShowForm(!showForm)}
//             className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base"
//           >
//             <Plus size={18} className="sm:w-5 sm:h-5" /> Generate Invite
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex justify-between items-start gap-2 text-sm sm:text-base">
//             <span className="break-words flex-1">{error}</span>
//             <button
//               onClick={() => setError(null)}
//               className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 flex-shrink-0"
//             >
//               <X size={18} className="sm:w-5 sm:h-5" />
//             </button>
//           </div>
//         )}

//         {success && (
//           <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg flex justify-between items-start gap-2 text-sm sm:text-base">
//             <span className="break-words flex-1">{success}</span>
//             <button
//               onClick={() => setSuccess(null)}
//               className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 flex-shrink-0"
//             >
//               <X size={18} className="sm:w-5 sm:h-5" />
//             </button>
//           </div>
//         )}

//         {showForm && (
//           <div
//             className={`mb-4 sm:mb-6 p-4 sm:p-6 ${theme?.card} border ${theme?.border} rounded-lg`}
//           >
//             <form
//               onSubmit={handleGenerateInvite}
//               className="space-y-3 sm:space-y-4"
//             >
//               <select
//                 value={formData.role}
//                 onChange={(e) =>
//                   setFormData({ ...formData, role: e.target.value })
//                 }
//                 className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
//               >
//                 {roles.map((r) => (
//                   <option key={r} value={r}>
//                     {r}
//                   </option>
//                 ))}
//               </select>

//               {formData.role.startsWith("POLICY_MAKER") && (
//                 <input
//                   type="text"
//                   placeholder="Organization Name"
//                   value={formData.organization}
//                   onChange={(e) =>
//                     setFormData({ ...formData, organization: e.target.value })
//                   }
//                   className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
//                   required
//                 />
//               )}

//               <div className="flex flex-col sm:flex-row gap-2">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition text-sm sm:text-base"
//                 >
//                   Generate Invite Code
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setFormData({ role: "DATA_COLLECTOR", organization: "" });
//                   }}
//                   className={`flex-1 border ${theme?.border} ${theme?.text} py-2 rounded-lg hover:${theme?.hover} transition text-sm sm:text-base`}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         <div
//           className={`p-3 sm:p-4 ${theme?.card} border ${theme?.border} rounded-lg mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4`}
//         >
//           <select
//             value={filterRole}
//             onChange={(e) => setFilterRole(e.target.value)}
//             className={`flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
//           >
//             <option value="all">All Roles</option>
//             {roles.map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className={`flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
//           >
//             <option value="all">All Status</option>
//             <option value="unused">Unused</option>
//             <option value="used">Used</option>
//           </select>
//         </div>

//         {loading ? (
//           <div
//             className={`text-center text-base sm:text-lg ${theme?.text} py-8`}
//           >
//             Loading invite codes...
//           </div>
//         ) : filteredCodes.length === 0 ? (
//           <div
//             className={`text-center text-base sm:text-lg ${theme?.text} py-8`}
//           >
//             No invite codes found
//           </div>
//         ) : (
//           <>
//             {/* Desktop Table View */}
//             <div
//               className={`hidden lg:block overflow-x-auto border ${theme?.border} rounded-lg`}
//             >
//               <table className="w-full">
//                 <thead className={theme?.card}>
//                   <tr className={`border-b ${theme?.border}`}>
//                     <th
//                       className={`px-4 py-3 text-left text-sm ${theme?.text}`}
//                     >
//                       Code
//                     </th>
//                     <th
//                       className={`px-4 py-3 text-left text-sm ${theme?.text}`}
//                     >
//                       Role
//                     </th>
//                     <th
//                       className={`px-4 py-3 text-left text-sm ${theme?.text}`}
//                     >
//                       Organization
//                     </th>
//                     <th
//                       className={`px-4 py-3 text-center text-sm ${theme?.text}`}
//                     >
//                       Status
//                     </th>
//                     <th
//                       className={`px-4 py-3 text-left text-sm ${theme?.text}`}
//                     >
//                       Generated By
//                     </th>
//                     <th
//                       className={`px-4 py-3 text-left text-sm ${theme?.text}`}
//                     >
//                       Created
//                     </th>
//                     <th
//                       className={`px-4 py-3 text-center text-sm ${theme?.text}`}
//                     >
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredCodes.map((ic) => (
//                     <tr
//                       key={ic.id}
//                       className={`border-b ${theme?.border} hover:${theme?.hover}`}
//                     >
//                       <td
//                         className={`px-4 py-3 ${theme?.text} font-mono text-sm`}
//                       >
//                         <div className="flex items-center gap-2">
//                           {ic.code}
//                           <button
//                             onClick={() => handleCopyCode(ic.code)}
//                             className={`p-1 rounded ${
//                               copiedCode === ic.code
//                                 ? "bg-green-100 dark:bg-green-900/30"
//                                 : theme?.hover
//                             }`}
//                             title="Copy to clipboard"
//                           >
//                             <Copy
//                               size={16}
//                               className={
//                                 copiedCode === ic.code
//                                   ? "text-green-600 dark:text-green-400"
//                                   : ""
//                               }
//                             />
//                           </button>
//                         </div>
//                       </td>
//                       <td className={`px-4 py-3`}>
//                         <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
//                           {ic.role}
//                         </span>
//                       </td>
//                       <td className={`px-4 py-3 text-sm ${theme?.textMuted}`}>
//                         {ic.organization || "-"}
//                       </td>
//                       <td className={`px-4 py-3 text-center`}>
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${
//                             ic.isUsed
//                               ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
//                               : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
//                           }`}
//                         >
//                           {ic.isUsed ? "Used" : "Unused"}
//                         </span>
//                       </td>
//                       <td className={`px-4 py-3 text-sm ${theme?.textMuted}`}>
//                         {ic.createdBy?.fullName || "Unknown"}
//                       </td>
//                       <td className={`px-4 py-3 text-sm ${theme?.textMuted}`}>
//                         {new Date(ic.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className={`px-4 py-3 text-center`}>
//                         <button
//                           onClick={() => handleDeleteInvite(ic.id)}
//                           className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile/Tablet Card View */}
//             <div className="lg:hidden space-y-3 sm:space-y-4">
//               {filteredCodes.map((ic) => (
//                 <div
//                   key={ic.id}
//                   className={`${theme?.card} border ${theme?.border} rounded-lg p-4 space-y-3`}
//                 >
//                   {/* Code and Status */}
//                   <div className="flex justify-between items-start gap-2">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 mb-1">
//                         <code
//                           className={`${theme?.text} font-mono text-sm truncate`}
//                         >
//                           {ic.code}
//                         </code>
//                         <button
//                           onClick={() => handleCopyCode(ic.code)}
//                           className={`p-1 rounded flex-shrink-0 ${
//                             copiedCode === ic.code ? theme.bg : theme?.hover
//                           }`}
//                           title="Copy to clipboard"
//                         >
//                           <Copy
//                             size={14}
//                             className={
//                               copiedCode === ic.code
//                                 ? "text-green-600 dark:text-green-400"
//                                 : ""
//                             }
//                           />
//                         </button>
//                       </div>
//                     </div>
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
//                         ic.isUsed
//                           ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
//                           : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
//                       }`}
//                     >
//                       {ic.isUsed ? "Used" : "Unused"}
//                     </span>
//                   </div>

//                   {/* Role */}
//                   <div>
//                     <p
//                       className={`${theme?.textMuted} text-xs font-semibold uppercase mb-1`}
//                     >
//                       Role
//                     </p>
//                     <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
//                       {ic.role}
//                     </span>
//                   </div>

//                   {/* Organization */}
//                   {ic.organization && (
//                     <div>
//                       <p
//                         className={`${theme?.textMuted} text-xs font-semibold uppercase mb-1`}
//                       >
//                         Organization
//                       </p>
//                       <p className={`${theme?.text} text-sm`}>
//                         {ic.organization}
//                       </p>
//                     </div>
//                   )}

//                   {/* Generated By and Date */}
//                   <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
//                     <div>
//                       <p
//                         className={`${theme?.textMuted} text-xs font-semibold uppercase mb-1`}
//                       >
//                         Generated By
//                       </p>
//                       <p className={`${theme?.text} text-xs truncate`}>
//                         {ic.createdBy?.fullName || "Unknown"}
//                       </p>
//                     </div>
//                     <div>
//                       <p
//                         className={`${theme?.textMuted} text-xs font-semibold uppercase mb-1`}
//                       >
//                         Created
//                       </p>
//                       <p className={`${theme?.text} text-xs`}>
//                         {new Date(ic.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
//                     <button
//                       onClick={() => handleDeleteInvite(ic.id)}
//                       className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
//                     >
//                       <Trash2 size={16} />
//                       Delete Invite Code
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         <div
//           className={`mt-4 sm:mt-6 p-3 sm:p-4 ${theme?.card} border ${theme?.border} rounded-lg`}
//         >
//           <h3
//             className={`font-semibold ${theme?.text} mb-2 text-sm sm:text-base`}
//           >
//             How to use:
//           </h3>
//           <ol
//             className={`space-y-1 ${theme?.textMuted} list-decimal list-inside text-xs sm:text-sm`}
//           >
//             <li>Generate a unique invite code for the desired role</li>
//             <li>Share the code with the person who needs to register</li>
//             <li>
//               They will enter this code during signup to get the specified role
//             </li>
//             <li>Once used, the code cannot be reused</li>
//           </ol>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InviteCodeManagement;

import React, { useState, useEffect } from "react";
import { Copy, Trash2, Plus, X, Lock } from "lucide-react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";

const InviteCodeManagement = () => {
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
          <Lock className='w-16 h-16 mx-auto mb-4 text-yellow-600' />
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

export default InviteCodeManagement;
