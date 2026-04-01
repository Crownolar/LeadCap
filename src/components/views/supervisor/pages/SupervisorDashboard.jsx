// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTheme } from "../../../../context/ThemeContext";
// import api from "../../../../utils/api";
// import {
//   Users,
//   FileText,
//   CalendarRange,
//   Clock3,
//   ShieldCheck,
//   AlertTriangle,
//   XCircle,
//   Flag,
//   BarChart3,
//   ArrowRight,
//   ClipboardList,
//   ChevronRight,
//   LayoutDashboard,
// } from "lucide-react";
// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
// } from "recharts";

// const SupervisorDashboard = () => {
//   const { theme } = useTheme();
//   const navigate = useNavigate();

//   const [stats, setStats] = useState(null);
//   const [collectors, setCollectors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         const [statsRes, collectorsRes] = await Promise.all([
//           api.get("/supervisor/stats"),
//           api.get("/supervisor/collectors"),
//         ]);

//         if (statsRes.data.success) setStats(statsRes.data.data);

//         if (collectorsRes.data.success) {
//           const data = collectorsRes.data.data || collectorsRes.data;
//           setCollectors(Array.isArray(data) ? data : data?.data || []);
//         }
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err);
//         setError(err.response?.data?.message || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

//   const reviewChartData = stats
//     ? [
//         { name: "Pending", value: stats.pendingReviews || 0 },
//         { name: "Approved", value: stats.approvedSamples || 0 },
//         { name: "Rejected", value: stats.reviewBreakdown?.rejected || 0 },
//         { name: "Flagged", value: stats.flaggedSamples || 0 },
//       ]
//     : [];

//   const StatCard = ({
//     title,
//     value,
//     subtitle,
//     icon,
//     valueColor,
//     iconWrap,
//     onClick,
//     ringColor,
//   }) => (
//     <button
//       type='button'
//       onClick={onClick}
//       className={`${theme?.card} ${theme?.border} border rounded-2xl p-5 md:p-6 text-left w-full shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 focus:outline-none focus:ring-2 ${ringColor} focus:ring-offset-2`}
//     >
//       <div className='flex items-start justify-between gap-4'>
//         <div className='min-w-0'>
//           <p className={`text-sm font-medium ${theme?.textMuted} mb-2`}>
//             {title}
//           </p>
//           <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
//             {value}
//           </p>
//           <p className={`text-xs mt-2 ${theme?.textMuted}`}>{subtitle}</p>
//         </div>

//         <div
//           className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconWrap}`}
//         >
//           {icon}
//         </div>
//       </div>
//     </button>
//   );

//   const SummaryRow = ({ label, value, dotColor, icon }) => (
//     <div className='flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 px-4 py-3'>
//       <div className='flex items-center gap-3 min-w-0'>
//         <div
//           className={`h-9 w-9 rounded-xl flex items-center justify-center ${dotColor}`}
//         >
//           {icon}
//         </div>
//         <span className={`${theme?.textMuted} text-sm font-medium`}>
//           {label}
//         </span>
//       </div>
//       <span className='text-base font-semibold'>{value}</span>
//     </div>
//   );

//   const QuickAction = ({ label, sub, icon, onClick }) => (
//     <button
//       type='button'
//       onClick={onClick}
//       className={`${theme?.card} ${theme?.border} border rounded-2xl p-4 text-left shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200`}
//     >
//       <div className='flex items-start justify-between gap-3'>
//         <div className='min-w-0'>
//           <div className='flex items-center gap-2 mb-1'>
//             <div className='h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
//               {icon}
//             </div>
//             <p className='text-sm font-semibold'>#{label ? "" : ""}{label}</p>
//           </div>
//           <p className={`text-xs ${theme?.textMuted}`}>{sub}</p>
//         </div>
//         <ChevronRight className='h-4 w-4 text-gray-400 shrink-0 mt-1' />
//       </div>
//     </button>
//   );

//   if (loading) {
//     return (
//       <div
//         className={`${theme?.card} ${theme?.border} border rounded-2xl p-10 text-center shadow-sm`}
//       >
//         <div className='flex flex-col items-center justify-center gap-4'>
//           <div className='h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin' />
//           <div>
//             <p className={`text-base font-semibold ${theme?.text}`}>
//               Loading dashboard
//             </p>
//             <p className={`text-sm ${theme?.textMuted}`}>
//               Please wait while supervisor insights are being prepared.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'>
//         Error: {error}
//       </div>
//     );
//   }

//   return (
//     <div className={`${theme?.text} space-y-6`}>
//       {/* Hero / Executive Header */}
//       <div
//         className={`${theme?.card} ${theme?.border} border rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden relative`}
//       >
//         <div className='absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-50/70 via-transparent to-blue-50/50 dark:from-emerald-900/10 dark:to-blue-900/10' />

//         <div className='relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
//           <div className='max-w-2xl'>
//             <div className='inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300 mb-4'>
//               <LayoutDashboard className='h-3.5 w-3.5' />
//               Supervisor Dashboard
//             </div>

//             <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
//               Monitor collectors, reviews, and field activity at a glance
//             </h1>

//             <p className={`mt-3 text-sm md:text-base ${theme?.textMuted}`}>
//               This dashboard gives you a clear operational view of your assigned
//               collectors, submitted samples, and pending review workload.
//             </p>
//           </div>

//           <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[420px]'>
//             <QuickAction
//               label='View Collectors'
//               sub='See your assigned field team'
//               icon={<Users className='h-4 w-4 text-emerald-600 dark:text-emerald-300' />}
//               onClick={() => navigate("/collectors")}
//             />
//             <QuickAction
//               label='Review Samples'
//               sub='Open pending and completed reviews'
//               icon={<ClipboardList className='h-4 w-4 text-blue-600 dark:text-blue-300' />}
//               onClick={() => navigate("/sample-review")}
//             />
//             <QuickAction
//               label='Open Workflow'
//               sub='Go to the main review process'
//               icon={<ArrowRight className='h-4 w-4 text-violet-600 dark:text-violet-300' />}
//               onClick={() => navigate("/sample-review")}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Top metrics */}
//       <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
//         <StatCard
//           title='Data Collectors'
//           value={stats?.totalCollectors || 0}
//           subtitle='Assigned to you'
//           onClick={() => navigate("/collectors")}
//           ringColor='focus:ring-emerald-500'
//           valueColor='text-emerald-600 dark:text-emerald-400'
//           iconWrap='bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
//           icon={<Users className='h-5 w-5' />}
//         />

//         <StatCard
//           title='Total Samples'
//           value={stats?.totalSamples || 0}
//           subtitle='From all collectors'
//           onClick={() => navigate("/sample-review")}
//           ringColor='focus:ring-blue-500'
//           valueColor='text-blue-600 dark:text-blue-400'
//           iconWrap='bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
//           icon={<FileText className='h-5 w-5' />}
//         />

//         <StatCard
//           title='This Month'
//           value={stats?.samplesThisMonth ?? 0}
//           subtitle='Samples collected'
//           onClick={() => navigate("/sample-review")}
//           ringColor='focus:ring-violet-500'
//           valueColor='text-violet-600 dark:text-violet-400'
//           iconWrap='bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300'
//           icon={<CalendarRange className='h-5 w-5' />}
//         />

//         <StatCard
//           title='Pending Review'
//           value={stats?.pendingReviews || 0}
//           subtitle='Awaiting approval'
//           onClick={() => navigate("/sample-review")}
//           ringColor='focus:ring-orange-500'
//           valueColor='text-orange-600 dark:text-orange-400'
//           iconWrap='bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300'
//           icon={<Clock3 className='h-5 w-5' />}
//         />
//       </div>

//       {/* Review Overview */}
//       <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
//         {/* Status summary */}
//         <div
//           className={`${theme?.card} ${theme?.border} border rounded-2xl p-6 shadow-sm`}
//         >
//           <div className='mb-5 flex items-center gap-3'>
//             <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300'>
//               <BarChart3 className='h-5 w-5' />
//             </div>
//             <div>
//               <h3 className='text-lg font-semibold tracking-tight'>
//                 Sample Review Status
//               </h3>
//               <p className={`text-sm ${theme?.textMuted}`}>
//                 Current breakdown of review outcomes.
//               </p>
//             </div>
//           </div>

//           {stats && (
//             <div className='space-y-3'>
//               <SummaryRow
//                 label='Pending Review'
//                 value={stats.pendingReviews || 0}
//                 dotColor='bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
//                 icon={<Clock3 className='h-4 w-4' />}
//               />
//               <SummaryRow
//                 label='Approved'
//                 value={stats.approvedSamples || 0}
//                 dotColor='bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
//                 icon={<ShieldCheck className='h-4 w-4' />}
//               />
//               <SummaryRow
//                 label='Rejected'
//                 value={stats.reviewBreakdown?.rejected || 0}
//                 dotColor='bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
//                 icon={<XCircle className='h-4 w-4' />}
//               />
//               <SummaryRow
//                 label='Flagged'
//                 value={stats.flaggedSamples || 0}
//                 dotColor='bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
//                 icon={<Flag className='h-4 w-4' />}
//               />
//             </div>
//           )}
//         </div>

//         {/* Pie chart */}
//         <div
//           className={`${theme?.card} ${theme?.border} border rounded-2xl p-6 shadow-sm`}
//         >
//           <div className='mb-5 flex items-center gap-3'>
//             <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'>
//               <AlertTriangle className='h-5 w-5' />
//             </div>
//             <div>
//               <h3 className='text-lg font-semibold tracking-tight'>
//                 Review Distribution
//               </h3>
//               <p className={`text-sm ${theme?.textMuted}`}>
//                 Visual distribution of all review states.
//               </p>
//             </div>
//           </div>

//           {reviewChartData.length > 0 && (
//             <ResponsiveContainer width='100%' height={290}>
//               <PieChart>
//                 <Pie
//                   data={reviewChartData}
//                   cx='50%'
//                   cy='50%'
//                   outerRadius={isMobile ? 68 : 88}
//                   innerRadius={isMobile ? 38 : 48}
//                   paddingAngle={3}
//                   dataKey='value'
//                   nameKey='name'
//                 >
//                   {reviewChartData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={COLORS[index % COLORS.length]}
//                     />
//                   ))}
//                 </Pie>

//                 <Tooltip
//                   content={({ active, payload }) =>
//                     active && payload?.[0] ? (
//                       <div
//                         className={`rounded-xl px-3 py-2 text-sm shadow-sm ${theme?.card ?? "bg-white"} border ${theme?.border ?? "border-gray-200"}`}
//                       >
//                         <span className='font-medium'>{payload[0].name}</span>:{" "}
//                         {payload[0].value}
//                       </div>
//                     ) : null
//                   }
//                 />

//                 <Legend
//                   layout='vertical'
//                   align={isMobile ? "center" : "right"}
//                   verticalAlign={isMobile ? "bottom" : "middle"}
//                   wrapperStyle={{
//                     fontSize: "13px",
//                     lineHeight: "20px",
//                   }}
//                   formatter={(value, entry) => (
//                     <span className={theme?.text ?? "text-gray-700"}>
//                       {value}: {entry.payload?.value ?? 0}
//                     </span>
//                   )}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </div>

//       {/* Collectors Section */}
//       <div
//         className={`${theme?.card} ${theme?.border} border rounded-2xl p-6 shadow-sm`}
//       >
//         <div className='mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
//           <div className='flex items-center gap-3'>
//             <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'>
//               <Users className='h-5 w-5' />
//             </div>
//             <div>
//               <h3 className='text-lg font-semibold tracking-tight'>
//                 Your Data Collectors
//               </h3>
//               <p className={`text-sm ${theme?.textMuted}`}>
//                 Overview of assigned collectors and their activity.
//               </p>
//             </div>
//           </div>

//           <div className='flex items-center gap-3'>
//             <span className='inline-flex items-center justify-center min-w-[2rem] rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300'>
//               {collectors.length}
//             </span>

//             <button
//               type='button'
//               onClick={() => navigate("/collectors")}
//               className='inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
//             >
//               View all collectors
//               <ArrowRight className='h-4 w-4' />
//             </button>
//           </div>
//         </div>

//         {collectors.length === 0 ? (
//           <div className='flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-6 text-center dark:border-gray-700'>
//             <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
//               <Users className='h-5 w-5 text-gray-500' />
//             </div>
//             <p className={`text-sm font-semibold ${theme?.text}`}>
//               No data collectors assigned yet
//             </p>
//             <p className={`mt-1 text-xs ${theme?.textMuted}`}>
//               Collectors in your assigned states will appear here.
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Desktop table */}
//             <div className='hidden lg:block overflow-x-auto'>
//               <table className='w-full min-w-[760px] text-sm'>
//                 <thead>
//                   <tr className={`border-b ${theme?.border}`}>
//                     <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide'>
//                       Name
//                     </th>
//                     <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide'>
//                       Email
//                     </th>
//                     <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide'>
//                       Total Samples
//                     </th>
//                     <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide'>
//                       This Month
//                     </th>
//                     <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide'>
//                       States Covered
//                     </th>
//                     <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide'>
//                       Status
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {collectors.map((collector) => (
//                     <tr
//                       key={collector.id}
//                       className={`border-b ${theme?.border} hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors`}
//                     >
//                       <td className='px-4 py-4'>
//                         <div className='font-semibold text-gray-900 dark:text-white'>
//                           {collector.name}
//                         </div>
//                       </td>

//                       <td className={`px-4 py-4 text-xs ${theme?.textMuted}`}>
//                         {collector.email}
//                       </td>

//                       <td className='px-4 py-4 text-center font-semibold'>
//                         {collector.totalSamples || 0}
//                       </td>

//                       <td className='px-4 py-4 text-center'>
//                         <span className='inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300'>
//                           {collector.samplesThisMonth || 0}
//                         </span>
//                       </td>

//                       <td className='px-4 py-4 text-center'>
//                         <span className='inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'>
//                           {collector.samplesByState
//                             ? Object.keys(collector.samplesByState).length
//                             : 0}{" "}
//                           states
//                         </span>
//                       </td>

//                       <td className='px-4 py-4 text-center'>
//                         <span
//                           className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
//                             collector.isActive
//                               ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300"
//                               : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
//                           }`}
//                         >
//                           {collector.isActive ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile / tablet cards */}
//             <div className='grid grid-cols-1 gap-4 lg:hidden'>
//               {collectors.map((collector) => (
//                 <div
//                   key={collector.id}
//                   className='rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4'
//                 >
//                   <div className='flex items-start justify-between gap-3'>
//                     <div className='min-w-0'>
//                       <p className='text-sm font-semibold text-gray-900 dark:text-white'>
//                         {collector.name}
//                       </p>
//                       <p className={`mt-1 text-xs break-all ${theme?.textMuted}`}>
//                         {collector.email}
//                       </p>
//                     </div>

//                     <span
//                       className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 ${
//                         collector.isActive
//                           ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300"
//                           : "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
//                       }`}
//                     >
//                       {collector.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </div>

//                   <div className='mt-4 grid grid-cols-3 gap-3'>
//                     <div className='rounded-xl bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3 text-center'>
//                       <p className={`text-[11px] uppercase tracking-wide ${theme?.textMuted}`}>
//                         Total
//                       </p>
//                       <p className='mt-1 text-sm font-bold text-blue-600 dark:text-blue-400'>
//                         {collector.totalSamples || 0}
//                       </p>
//                     </div>

//                     <div className='rounded-xl bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3 text-center'>
//                       <p className={`text-[11px] uppercase tracking-wide ${theme?.textMuted}`}>
//                         Month
//                       </p>
//                       <p className='mt-1 text-sm font-bold text-violet-600 dark:text-violet-400'>
//                         {collector.samplesThisMonth || 0}
//                       </p>
//                     </div>

//                     <div className='rounded-xl bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3 text-center'>
//                       <p className={`text-[11px] uppercase tracking-wide ${theme?.textMuted}`}>
//                         States
//                       </p>
//                       <p className='mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400'>
//                         {collector.samplesByState
//                           ? Object.keys(collector.samplesByState).length
//                           : 0}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SupervisorDashboard;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import api from "../../../../utils/api";
import {
  Users,
  FileText,
  CalendarRange,
  Clock3,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Flag,
  BarChart3,
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import SurfaceCard from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import MetricTile from "../components/ui/MetricTile";
import QuickActionCard from "../components/ui/QuickActionCard";

const SupervisorDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, collectorsRes] = await Promise.all([
          api.get("/supervisor/stats"),
          api.get("/supervisor/collectors"),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        if (collectorsRes.data.success) {
          const data = collectorsRes.data.data || collectorsRes.data;
          setCollectors(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  const reviewChartData = stats
    ? [
        { name: "Pending", value: stats.pendingReviews || 0 },
        { name: "Approved", value: stats.approvedSamples || 0 },
        { name: "Rejected", value: stats.reviewBreakdown?.rejected || 0 },
        { name: "Flagged", value: stats.flaggedSamples || 0 },
      ]
    : [];

  if (loading) {
    return (
      <SurfaceCard className="p-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`h-10 w-10 rounded-full border-2 ${theme.emerald} border-t-transparent animate-spin`} />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>
              Loading dashboard
            </p>
            <p className={`text-sm ${theme.textMuted}`}>
              Please wait while supervisor insights are being prepared.
            </p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      {/* Hero */}
      <SurfaceCard className="relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className={`pointer-events-none absolute inset-0 ${theme.card}`} />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1 text-xs font-semibold ${theme.emeraldText} `}>
              <LayoutDashboard className="h-3.5 w-3.5" />
              Supervisor Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Monitor collectors, reviews, and field activity at a glance
            </h1>

            <p className={`mt-3 text-sm md:text-base ${theme.textMuted}`}>
              This dashboard gives you a clear operational view of your assigned
              collectors, submitted samples, and pending review workload.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
            <QuickActionCard
              label="View Collectors"
              sub="See your assigned field team"
              icon={
                <Users className={`h-4 w-4 ${theme.emeraldText}`} />
              }
              onClick={() => navigate("/collectors")}
            />

            <QuickActionCard
              label="Review Samples"
              sub="Open pending and completed reviews"
              icon={
                <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              }
              onClick={() => navigate("/sample-review")}
            />

            <QuickActionCard
              label="Open Workflow"
              sub="Go to the main review process"
              icon={
                <ArrowRight className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              }
              onClick={() => navigate("/sample-review")}
            />
          </div>
        </div>
      </SurfaceCard>

      {/* Top metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          icon={<Users className={`h-4 w-4 ${theme.emeraldText} dark:text-emerald-400`} />}
          label="Data Collectors"
          value={stats?.totalCollectors || 0}
          valueClass="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
        />

        <MetricTile
          icon={<FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          label="Total Samples"
          value={stats?.totalSamples || 0}
          valueClass="text-2xl font-bold text-blue-600 dark:text-blue-400"
        />

        <MetricTile
          icon={<CalendarRange className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
          label="This Month"
          value={stats?.samplesThisMonth ?? 0}
          valueClass="text-2xl font-bold text-violet-600 dark:text-violet-400"
        />

        <MetricTile
          icon={<Clock3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          label="Pending Review"
          value={stats?.pendingReviews || 0}
          valueClass="text-2xl font-bold text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Review overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SurfaceCard>
          <SectionHeader
            title="Sample Review Status"
            subtitle="Current breakdown of review outcomes."
            icon={<BarChart3 className="h-5 w-5" />}
          />

          {stats && (
            <div className="mt-5 space-y-3">
              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Pending Review
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.pendingReviews || 0}
                </span>
              </div>

              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Approved
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.approvedSamples || 0}
                </span>
              </div>

              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Rejected
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.reviewBreakdown?.rejected || 0}
                </span>
              </div>

              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    <Flag className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Flagged
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.flaggedSamples || 0}
                </span>
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            title="Review Distribution"
            subtitle="Visual distribution of all review states."
            icon={<AlertTriangle className="h-5 w-5" />}
          />

          {reviewChartData.length > 0 && (
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie
                    data={reviewChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 68 : 88}
                    innerRadius={isMobile ? 38 : 48}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {reviewChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div
                          className={`rounded-xl border px-3 py-2 text-sm shadow-sm ${theme.card} ${theme.border}`}
                        >
                          <span className="font-medium">{payload[0].name}</span>:{" "}
                          {payload[0].value}
                        </div>
                      ) : null
                    }
                  />

                  <Legend
                    layout="vertical"
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    wrapperStyle={{
                      fontSize: "13px",
                      lineHeight: "20px",
                    }}
                    formatter={(value, entry) => (
                      <span className={theme.text}>
                        {value}: {entry.payload?.value ?? 0}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SurfaceCard>
      </div>

      {/* Collectors section */}
      <SurfaceCard>
        <SectionHeader
          title="Your Data Collectors"
          subtitle="Overview of assigned collectors and their activity."
          icon={<Users className="h-5 w-5" />}
          badge={<StatusBadge type="safe">{collectors.length}</StatusBadge>}
          action={
            <ActionButton onClick={() => navigate("/collectors")}>
              View all collectors
              <ArrowRight className="h-4 w-4" />
            </ActionButton>
          }
        />

        {collectors.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<Users className="h-5 w-5 text-gray-500" />}
              title="No data collectors assigned yet"
              description="Collectors in your assigned states will appear here."
              minHeight="min-h-[220px]"
            />
          </div>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className={`border-b ${theme.border}`}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      Total Samples
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      This Month
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      States Covered
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {collectors.map((collector) => (
                    <tr
                      key={collector.id}
                      className={`border-b ${theme.border} transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40`}
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {collector.name}
                        </div>
                      </td>

                      <td className={`px-4 py-4 text-xs ${theme.textMuted}`}>
                        {collector.email}
                      </td>

                      <td className="px-4 py-4 text-center font-semibold">
                        {collector.totalSamples || 0}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <StatusBadge type="info">
                          {collector.samplesThisMonth || 0}
                        </StatusBadge>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <StatusBadge type="neutral">
                          {collector.samplesByState
                            ? Object.keys(collector.samplesByState).length
                            : 0}{" "}
                          states
                        </StatusBadge>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <StatusBadge type={collector.isActive ? "safe" : "danger"}>
                          {collector.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:hidden">
              {collectors.map((collector) => (
                <SurfaceCard
                  key={collector.id}
                  className="bg-gray-50 dark:bg-gray-800/40"
                  padding="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {collector.name}
                      </p>
                      <p className={`mt-1 break-all text-xs ${theme.textMuted}`}>
                        {collector.email}
                      </p>
                    </div>

                    <StatusBadge type={collector.isActive ? "safe" : "danger"}>
                      {collector.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <MetricTile
                      icon={null}
                      label="Total"
                      value={collector.totalSamples || 0}
                      valueClass="text-sm font-bold text-blue-600 dark:text-blue-400"
                    />
                    <MetricTile
                      icon={null}
                      label="Month"
                      value={collector.samplesThisMonth || 0}
                      valueClass="text-sm font-bold text-violet-600 dark:text-violet-400"
                    />
                    <MetricTile
                      icon={null}
                      label="States"
                      value={
                        collector.samplesByState
                          ? Object.keys(collector.samplesByState).length
                          : 0
                      }
                      valueClass="text-sm font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
  );
};

export default SupervisorDashboard;