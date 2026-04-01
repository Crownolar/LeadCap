// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronRight } from "lucide-react";
// import { useTheme } from "../../context/ThemeContext";
// import api from "../../utils/api";

// const CollectorManagement = () => {
//   const { theme } = useTheme();
//   console.log(theme);
//   const navigate = useNavigate();
//   const [collectors, setCollectors] = useState([]);
//   const [selectedCollector, setSelectedCollector] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   useEffect(() => {
//     const fetchCollectors = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get("/supervisor/collectors");
//         if (res.data.success) {
//           const data = res.data.data || res.data;
//           setCollectors(Array.isArray(data) ? data : data?.data || []);
//         }
//       } catch (err) {
//         console.error("Error fetching collectors:", err);
//         setError(err.response?.data?.message || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCollectors();
//   }, []);

//   const handleSelectCollector = (collector) => {
//     setSelectedCollector(collector);
//   };

//   if (loading) {
//     return (
//       <div className={`${theme?.card} rounded-lg p-8 text-center`}>
//         <p className={theme?.textMuted}>Loading collectors...</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`${theme?.text} space-y-6`}>
//       {error && (
//         <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
//           Error: {error}
//         </div>
//       )}

//       <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
//         {/* Collectors List */}
//         <div
//           className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}
//         >
//           <h3 className='text-lg font-semibold mb-2 inline-flex items-center gap-2'>
//             Your Data Collectors
//             <span className='inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'>
//               {collectors.length}
//             </span>
//           </h3>
//           <p className={`text-sm ${theme?.textMuted} mb-4`}>
//             Select a collector below to view their details.
//           </p>
//           <div className='space-y-2 max-h-96 overflow-y-auto'>
//             {collectors.length === 0 ? (
//               <div className='flex flex-col items-center justify-center py-10 text-center'>
//                 <p className={`text-sm font-medium ${theme?.text} mb-1`}>
//                   No collectors assigned
//                 </p>
//                 <p className={`text-xs ${theme?.textMuted}`}>
//                   Collectors in your assigned states will appear here
//                 </p>
//               </div>
//             ) : (
//               collectors.map((collector) => (
//                 <button
//                   key={collector.id}
//                   type='button'
//                   onClick={() => handleSelectCollector(collector)}
//                   className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
//                     selectedCollector?.id === collector.id
//                       ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
//                       : `border ${theme?.border} hover:bg-gray-50 dark:hover:bg-gray-700/50`
//                   }`}
//                 >
//                   <div className='min-w-0 flex-1'>
//                     <p className={`font-semibold text-sm ${theme?.textMuted}`}>
//                       {collector.name}
//                     </p>
//                     <p className={`text-xs ${theme?.textMuted} truncate`}>
//                       {collector.email}
//                     </p>
//                     <div className='flex gap-2 mt-2 flex-wrap'>
//                       <span className='bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded'>
//                         {collector.totalSamples} samples
//                       </span>
//                     </div>
//                   </div>
//                   <ChevronRight
//                     className='flex-shrink-0 w-5 h-5 text-gray-400'
//                     aria-hidden
//                   />
//                 </button>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Collector Details */}
//         <div className='lg:col-span-2'>
//           {selectedCollector ? (
//             <div
//               className={`${theme?.card} rounded-lg p-6 border ${theme?.border} space-y-4`}
//             >
//               <div>
//                 <h3 className='text-lg font-semibold mb-4'>
//                   Collector Details: {selectedCollector.name}
//                 </h3>
//                 <button
//                   type='button'
//                   onClick={() =>
//                     navigate(`/sample-review/${selectedCollector.id}`)
//                   }
//                   className='mb-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline'
//                 >
//                   Review their samples →
//                 </button>

//                 <div className='space-y-3 text-sm'>
//                   <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
//                     <div>
//                       <p className={theme?.textMuted}>Name</p>
//                       <p className='font-semibold break-words'>
//                         {selectedCollector.name}
//                       </p>
//                     </div>
//                     <div>
//                       <p className={theme?.textMuted}>Email</p>
//                       <p className='font-semibold break-words'>
//                         {selectedCollector.email}
//                       </p>
//                     </div>
//                     {selectedCollector.organization && (
//                       <div>
//                         <p className={theme?.textMuted}>Organization</p>
//                         <p className='font-semibold'>
//                           {selectedCollector.organization}
//                         </p>
//                       </div>
//                     )}
//                     <div>
//                       <p className={theme?.textMuted}>Joined</p>
//                       <p className='font-semibold'>
//                         {new Date(
//                           selectedCollector.joinedAt,
//                         ).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div
//               className={`rounded-lg p-6 border ${theme?.border} text-center min-h-[200px] flex flex-col items-center justify-center ${
//                 collectors.length === 0
//                   ? "bg-transparent border-dashed"
//                   : theme?.card
//               }`}
//             >
//               <p className={`text-sm ${theme?.textMuted}`}>
//                 {collectors.length === 0
//                   ? "No collectors in your assigned states yet"
//                   : "Select a collector to view their details"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Performance Summary */}
//       {selectedCollector && (
//         <div
//           className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}
//         >
//           <h3 className='text-lg font-semibold mb-4'>Performance Summary</h3>
//           <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
//             <div>
//               <p className={`text-sm ${theme?.textMuted}`}>Total Samples</p>
//               <p className='text-2xl font-bold text-blue-600'>
//                 {selectedCollector.totalSamples}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${theme?.textMuted}`}>This Month</p>
//               <p className='text-2xl font-bold text-green-600'>
//                 {selectedCollector.samplesThisMonth}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${theme?.textMuted}`}>States Covered</p>
//               <p className='text-2xl font-bold text-purple-600'>
//                 {Object.keys(selectedCollector.samplesByState || {}).length}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${theme?.textMuted}`}>Status</p>
//               <p
//                 className={`text-2xl font-bold ${
//                   selectedCollector.isActive
//                     ? "text-emerald-600"
//                     : "text-red-600"
//                 }`}
//               >
//                 {selectedCollector.isActive ? "Active" : "Inactive"}
//               </p>
//             </div>
//           </div>

//           {/* Samples by State */}
//           {selectedCollector.samplesByState &&
//             Object.keys(selectedCollector.samplesByState).length > 0 && (
//               <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
//                 <h4 className='font-semibold mb-4'>Samples by State</h4>
//                 <div className='space-y-2'>
//                   {Object.entries(selectedCollector.samplesByState).map(
//                     ([state, count]) => (
//                       <div
//                         key={state}
//                         className='flex justify-between items-center text-sm'
//                       >
//                         <span className={theme?.textMuted}>{state}</span>
//                         <span className='font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded'>
//                           {count} samples
//                         </span>
//                       </div>
//                     ),
//                   )}
//                 </div>
//               </div>
//             )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CollectorManagement;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ChevronRight,
//   Users,
//   Mail,
//   Building2,
//   CalendarDays,
//   Activity,
//   MapPinned,
//   FolderKanban,
// } from "lucide-react";
// import { useTheme } from "../../../../context/ThemeContext";
// import api from "../../../../utils/api";

// const CollectorManagement = () => {
//   const { theme } = useTheme();
//   const navigate = useNavigate();

//   const [collectors, setCollectors] = useState([]);
//   const [selectedCollector, setSelectedCollector] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchCollectors = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get("/supervisor/collectors");

//         if (res.data.success) {
//           const data = res.data.data || res.data;
//           setCollectors(Array.isArray(data) ? data : data?.data || []);
//         }
//       } catch (err) {
//         console.error("Error fetching collectors:", err);
//         setError(err.response?.data?.message || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCollectors();
//   }, []);

//   const handleSelectCollector = (collector) => {
//     setSelectedCollector(collector);
//   };

//   if (loading) {
//     return (
//       <div
//         className={`${theme?.card} ${theme?.border} border rounded-2xl p-10 text-center shadow-sm`}
//       >
//         <div className='flex flex-col items-center justify-center gap-4'>
//           <div className='h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin' />
//           <div>
//             <p className={`text-base font-semibold ${theme?.text}`}>
//               Loading collectors
//             </p>
//             <p className={`text-sm ${theme?.textMuted}`}>
//               Please wait while we fetch your team data.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`${theme?.text} space-y-6`}>
//       {error && (
//         <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'>
//           Error: {error}
//         </div>
//       )}

//       <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
//         {/* Collectors List */}
//         <div
//           className={`${theme?.card} ${theme?.border} border rounded-2xl p-6 shadow-sm`}
//         >
//           <div className='mb-5 flex items-start justify-between gap-4'>
//             <div>
//               <div className='flex items-center gap-3'>
//                 <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'>
//                   <Users className='h-5 w-5' />
//                 </div>
//                 <div>
//                   <h3 className='text-lg font-semibold tracking-tight'>
//                     Your Data Collectors
//                   </h3>
//                   <p className={`text-sm ${theme?.textMuted}`}>
//                     Select a collector to view profile and performance.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <span className='inline-flex min-w-[2rem] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300'>
//               {collectors.length}
//             </span>
//           </div>

//           <div className='max-h-[30rem] space-y-3 overflow-y-auto pr-1'>
//             {collectors.length === 0 ? (
//               <div className='flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-6 text-center dark:border-gray-700'>
//                 <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
//                   <Users className='h-5 w-5 text-gray-500' />
//                 </div>
//                 <p className={`text-sm font-semibold ${theme?.text}`}>
//                   No collectors assigned
//                 </p>
//                 <p className={`mt-1 text-xs ${theme?.textMuted}`}>
//                   Collectors in your assigned states will appear here.
//                 </p>
//               </div>
//             ) : (
//               collectors.map((collector) => {
//                 const isSelected = selectedCollector?.id === collector.id;

//                 return (
//                   <button
//                     key={collector.id}
//                     type='button'
//                     onClick={() => handleSelectCollector(collector)}
//                     className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
//                       isSelected
//                         ? "border-emerald-500 bg-emerald-50 shadow-sm dark:bg-emerald-900/20"
//                         : `${theme?.border} hover:-translate-y-[1px] hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/40`
//                     }`}
//                   >
//                     <div className='flex items-start justify-between gap-3'>
//                       <div className='min-w-0 flex-1'>
//                         <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
//                           {collector.name}
//                         </p>
//                         <p
//                           className={`mt-1 truncate text-xs ${theme?.textMuted}`}
//                         >
//                           {collector.email}
//                         </p>

//                         <div className='mt-3 flex flex-wrap gap-2'>
//                           <span className='inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300'>
//                             {collector.totalSamples} samples
//                           </span>

//                           <span
//                             className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
//                               collector.isActive
//                                 ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300"
//                                 : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
//                             }`}
//                           >
//                             {collector.isActive ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                       </div>

//                       <ChevronRight
//                         className='mt-1 h-5 w-5 flex-shrink-0 text-gray-400'
//                         aria-hidden
//                       />
//                     </div>
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* Collector Details */}
//         <div className='lg:col-span-2'>
//           {selectedCollector ? (
//             <div
//               className={`${theme?.card} ${theme?.border} border rounded-2xl p-6 shadow-sm`}
//             >
//               <div className='mb-6 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-700 md:flex-row md:items-start md:justify-between'>
//                 <div className='flex items-start gap-4'>
//                   <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'>
//                     <Users className='h-6 w-6' />
//                   </div>

//                   <div>
//                     <h3 className='text-xl font-semibold tracking-tight'>
//                       {selectedCollector.name}
//                     </h3>
//                     <p className={`mt-1 text-sm ${theme?.textMuted}`}>
//                       Collector profile and overview
//                     </p>

//                     <div className='mt-3 flex flex-wrap gap-2'>
//                       <span className='inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300'>
//                         {selectedCollector.totalSamples} total samples
//                       </span>

//                       <span
//                         className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
//                           selectedCollector.isActive
//                             ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300"
//                             : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
//                         }`}
//                       >
//                         {selectedCollector.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   type='button'
//                   onClick={() =>
//                     navigate(`/sample-review/${selectedCollector.id}`)
//                   }
//                   className='inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
//                 >
//                   Review their samples
//                 </button>
//               </div>

//               <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
//                 <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//                   <div className='mb-2 flex items-center gap-2'>
//                     <Users className='h-4 w-4 text-gray-500' />
//                     <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                       Name
//                     </p>
//                   </div>
//                   <p className='break-words text-sm font-semibold text-gray-900 dark:text-white'>
//                     {selectedCollector.name}
//                   </p>
//                 </div>

//                 <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//                   <div className='mb-2 flex items-center gap-2'>
//                     <Mail className='h-4 w-4 text-gray-500' />
//                     <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                       Email
//                     </p>
//                   </div>
//                   <p className='break-words text-sm font-semibold text-gray-900 dark:text-white'>
//                     {selectedCollector.email}
//                   </p>
//                 </div>

//                 {selectedCollector.organization && (
//                   <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//                     <div className='mb-2 flex items-center gap-2'>
//                       <Building2 className='h-4 w-4 text-gray-500' />
//                       <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                         Organization
//                       </p>
//                     </div>
//                     <p className='text-sm font-semibold text-gray-900 dark:text-white'>
//                       {selectedCollector.organization}
//                     </p>
//                   </div>
//                 )}

//                 <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//                   <div className='mb-2 flex items-center gap-2'>
//                     <CalendarDays className='h-4 w-4 text-gray-500' />
//                     <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                       Joined
//                     </p>
//                   </div>
//                   <p className='text-sm font-semibold text-gray-900 dark:text-white'>
//                     {new Date(selectedCollector.joinedAt).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div
//               className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-sm ${
//                 collectors.length === 0
//                   ? "border-dashed border-gray-300 bg-transparent dark:border-gray-700"
//                   : `${theme?.card} ${theme?.border}`
//               }`}
//             >
//               <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
//                 <Users className='h-5 w-5 text-gray-500' />
//               </div>
//               <p className={`text-sm font-semibold ${theme?.text}`}>
//                 {collectors.length === 0
//                   ? "No collectors in your assigned states yet"
//                   : "Select a collector to view their details"}
//               </p>
//               <p className={`mt-1 text-xs ${theme?.textMuted}`}>
//                 {collectors.length === 0
//                   ? "Profiles will appear here when collectors are assigned."
//                   : "Collector information and metrics will show here."}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Performance Summary */}
//       {selectedCollector && (
//         <div
//           className={`${theme?.card} ${theme?.border} border rounded-2xl p-6 shadow-sm`}
//         >
//           <div className='mb-5 flex items-center gap-3'>
//             <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'>
//               <Activity className='h-5 w-5' />
//             </div>
//             <div>
//               <h3 className='text-lg font-semibold tracking-tight'>
//                 Performance Summary
//               </h3>
//               <p className={`text-sm ${theme?.textMuted}`}>
//                 Overview of collector activity and coverage.
//               </p>
//             </div>
//           </div>

//           <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
//             <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//               <div className='mb-2 flex items-center gap-2'>
//                 <FolderKanban className='h-4 w-4 text-blue-500' />
//                 <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                   Total Samples
//                 </p>
//               </div>
//               <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
//                 {selectedCollector.totalSamples}
//               </p>
//             </div>

//             <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//               <div className='mb-2 flex items-center gap-2'>
//                 <Activity className='h-4 w-4 text-green-500' />
//                 <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                   This Month
//                 </p>
//               </div>
//               <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
//                 {selectedCollector.samplesThisMonth}
//               </p>
//             </div>

//             <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//               <div className='mb-2 flex items-center gap-2'>
//                 <MapPinned className='h-4 w-4 text-purple-500' />
//                 <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                   States Covered
//                 </p>
//               </div>
//               <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
//                 {Object.keys(selectedCollector.samplesByState || {}).length}
//               </p>
//             </div>

//             <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/40'>
//               <div className='mb-2 flex items-center gap-2'>
//                 <Users
//                   className={`h-4 w-4 ${
//                     selectedCollector.isActive
//                       ? "text-emerald-500"
//                       : "text-red-500"
//                   }`}
//                 />
//                 <p className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted}`}>
//                   Status
//                 </p>
//               </div>
//               <p
//                 className={`text-2xl font-bold ${
//                   selectedCollector.isActive
//                     ? "text-emerald-600 dark:text-emerald-400"
//                     : "text-red-600 dark:text-red-400"
//                 }`}
//               >
//                 {selectedCollector.isActive ? "Active" : "Inactive"}
//               </p>
//             </div>
//           </div>

//           {/* Samples by State */}
//           {selectedCollector.samplesByState &&
//             Object.keys(selectedCollector.samplesByState).length > 0 && (
//               <div className='mt-8 border-t border-gray-200 pt-6 dark:border-gray-700'>
//                 <div className='mb-4 flex items-center gap-2'>
//                   <MapPinned className='h-4 w-4 text-emerald-500' />
//                   <h4 className='text-base font-semibold'>Samples by State</h4>
//                 </div>

//                 <div className='space-y-2'>
//                   {Object.entries(selectedCollector.samplesByState).map(
//                     ([state, count]) => (
//                       <div
//                         key={state}
//                         className='flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:bg-gray-800/70'
//                       >
//                         <span className={`${theme?.textMuted} font-medium`}>
//                           {state}
//                         </span>
//                         <span className='inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300'>
//                           {count} samples
//                         </span>
//                       </div>
//                     ),
//                   )}
//                 </div>
//               </div>
//             )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CollectorManagement;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Users,
  User,
  Mail,
  Building2,
  CalendarDays,
  Activity,
  MapPinned,
  FolderKanban,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import api from "../../../../utils/api";

import SurfaceCard from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import InfoTile from "../components/ui/InfoTile";

const CollectorManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setLoading(true);
        const res = await api.get("/supervisor/collectors");

        if (res.data.success) {
          const data = res.data.data || res.data;
          const normalized = Array.isArray(data) ? data : data?.data || [];
          setCollectors(normalized);
        }
      } catch (err) {
        console.error("Error fetching collectors:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectors();
  }, []);

  const handleSelectCollector = (collector) => {
    setSelectedCollector(collector);
  };

  if (loading) {
    return (
      <SurfaceCard className="p-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>
              Loading collectors
            </p>
            <p className={`text-sm ${theme.textMuted}`}>
              Please wait while your team data is being prepared.
            </p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      <SurfaceCard className="rounded-3xl p-6 md:p-8 overflow-hidden relative">
        <div className={`absolute inset-0 pointer-events-none ${theme.card}`} />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className={`inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1 text-xs font-semibold ${theme.emeraldText} mb-4`}>
              <Users className="h-3.5 w-3.5" />
              Collector Management
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Manage assigned data collectors and monitor their performance
            </h1>

            <p className={`mt-3 text-sm md:text-base ${theme.textMuted}`}>
              View collector profiles, inspect activity, and move directly into
              the sample review workflow when action is needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[430px]">
            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Collectors
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {collectors.length}
              </p>
            </div>

            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Active
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                {collectors.filter((collector) => collector.isActive).length}
              </p>
            </div>

            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Inactive
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {collectors.filter((collector) => !collector.isActive).length}
              </p>
            </div>

            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Selected
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedCollector ? 1 : 0}
              </p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SurfaceCard className="lg:col-span-1">
          <SectionHeader
            title="Your Data Collectors"
            subtitle="Select a collector to view profile and performance."
            icon={<Users className="h-5 w-5" />}
            badge={<StatusBadge type="safe">{collectors.length}</StatusBadge>}
          />

          <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {collectors.length === 0 ? (
              <EmptyState
                icon={<Users className={`h-5 w-5 ${theme.textMuted}`} />}
                title="No collectors assigned"
                description="Collectors in your assigned states will appear here."
                minHeight="min-h-[280px]"
              />
            ) : (
              collectors.map((collector) => {
                const isSelected = selectedCollector?.id === collector.id;

                return (
                  <button
                    key={collector.id}
                    type="button"
                    onClick={() => handleSelectCollector(collector)}
                    className={`
                      w-full rounded-2xl border p-4 text-left transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                      ${
                        isSelected
                          ? `${theme.emeraldBorder} ${theme.emerald} shadow-sm dark:${theme.emeraldDark}`
                          : `${theme.border} hover:shadow-md hover:-translate-y-[1px] hover:${theme.hover}`
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`truncate text-sm font-semibold ${theme.text}`}>
                            {collector.name}
                          </p>
                          <StatusBadge type={collector.isActive ? "safe" : "danger"}>
                            {collector.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>

                        <p className={`mt-1 truncate text-xs ${theme.textMuted}`}>
                          {collector.email}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusBadge type="info">
                            {collector.totalSamples || 0} samples
                          </StatusBadge>

                          <StatusBadge type="moderate">
                            {collector.samplesThisMonth || 0} this month
                          </StatusBadge>
                        </div>
                      </div>

                      <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </SurfaceCard>

        <div className="lg:col-span-2">
          {selectedCollector ? (
            <SurfaceCard className="space-y-6">
              <SectionHeader
                title={selectedCollector.name}
                subtitle="Collector profile and operational details."
                icon={<User className="h-5 w-5" />}
                badge={
                  <StatusBadge type={selectedCollector.isActive ? "safe" : "danger"}>
                    {selectedCollector.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                }
                action={
                  <ActionButton
                    onClick={() => navigate(`/sample-review/${selectedCollector.id}`)}
                  >
                    Review their samples
                  </ActionButton>
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoTile
                  icon={<User className="h-4 w-4 text-emerald-600" />}
                  label="Name"
                >
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                    {selectedCollector.name}
                  </p>
                </InfoTile>

                <InfoTile
                  icon={<Mail className="h-4 w-4 text-emerald-600" />}
                  label="Email"
                >
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                    {selectedCollector.email}
                  </p>
                </InfoTile>

                {selectedCollector.organization && (
                  <InfoTile
                    icon={<Building2 className="h-4 w-4 text-emerald-600" />}
                    label="Organization"
                  >
                    <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                      {selectedCollector.organization}
                    </p>
                  </InfoTile>
                )}

                <InfoTile
                  icon={<CalendarDays className="h-4 w-4 text-emerald-600" />}
                  label="Joined"
                >
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                    {new Date(selectedCollector.joinedAt).toLocaleDateString()}
                  </p>
                </InfoTile>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard className={`${collectors.length === 0 ? "bg-transparent" : ""}`}>
              <EmptyState
                icon={<Users className="h-5 w-5 text-gray-500" />}
                title={
                  collectors.length === 0
                    ? "No collectors in your assigned states yet"
                    : "Select a collector to view their details"
                }
                description={
                  collectors.length === 0
                    ? "Profiles will appear here once collectors are assigned."
                    : "Collector information and performance metrics will appear here."
                }
                minHeight="min-h-[280px]"
              />
            </SurfaceCard>
          )}
        </div>
      </div>

      {selectedCollector && (
        <SurfaceCard>
          <SectionHeader
            title="Performance Summary"
            subtitle="Overview of collector activity and operational coverage."
            icon={<Activity className="h-5 w-5" />}
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  Total Samples
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedCollector.totalSamples || 0}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  This Month
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedCollector.samplesThisMonth || 0}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  States Covered
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(selectedCollector.samplesByState || {}).length}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <Users
                  className={`h-4 w-4 ${
                    selectedCollector.isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  Status
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${
                  selectedCollector.isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {selectedCollector.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>

          {selectedCollector.samplesByState &&
            Object.keys(selectedCollector.samplesByState).length > 0 && (
              <div className={`mt-8 border-t pt-6 ${theme.border}`}>
                <SectionHeader
                  title="Samples by State"
                  subtitle="Distribution of collected samples across covered states."
                  icon={<MapPinned className="h-5 w-5" />}
                />

                <div className="mt-4 space-y-2">
                  {Object.entries(selectedCollector.samplesByState).map(
                    ([state, count]) => (
                      <div
                        key={state}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${theme.border} $theme.bg hover:${theme.hover}`}
                      >
                        <span className={`text-sm font-medium ${theme.textMuted}`}>
                          {state}
                        </span>

                        <StatusBadge type="safe">{count} samples</StatusBadge>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </SurfaceCard>
      )}
    </div>
  );
};

export default CollectorManagement;