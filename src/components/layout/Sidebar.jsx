// import {
//   BarChart3,
//   Database,
//   Map,
//   FileText,
//   Users,
//   Plus,
//   Upload,
//   X,
// } from "lucide-react";
// import { useSelector } from "react-redux";
// import NavItem from "../common/NavItem";

// const roleConfig = {
//   superadmin: {
//     sampleButtonLabel: "New Sample",
//     navItems: ["dashboard", "database", "map", "reports", "agents"],
//   },
//   policymakerson: {
//     sampleButtonLabel: "Review Samples",
//     navItems: ["dashboard", "reports", "map"],
//   },
//   supervisor: {
//     sampleButtonLabel: "New Sample",
//     navItems: ["agents"],
//   },
//   headresearcher: {
//     sampleButtonLabel: "New Sample",
//     navItems: ["dashboard", "database", "map", "reports", "agents"],
//   },
// };

// const Sidebar = ({
//   theme,
//   mobileMenuOpen,
//   setMobileMenuOpen,
//   darkMode,
//   setShowForm,
//   setShowHeavyMetalModal,
//   excelImportRef,
// }) => {
//   const { currentUser } = useSelector((state) => state.auth);

//   const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");
//   const config = roleConfig[normalizedRole] || {
//     sampleButtonLabel: "New Sample",
//     navItems: ["dashboard", "database", "map", "reports", "agents"],
//   };

//   const allNavItems = [
//     {
//       icon: BarChart3,
//       label: "Dashboard",
//       route: "/dashboard",
//       key: "dashboard",
//     },
//     {
//       icon: Database,
//       label: "Sample Database",
//       route: "/database",
//       key: "database",
//     },
//     { icon: Map, label: "Geographic View", route: "/map", key: "map" },
//     { icon: FileText, label: "Reports", route: "/reports", key: "reports" },
//     { icon: Users, label: "Field Agents", route: "/agents", key: "agents" },
//   ];

//   const navItemsToRender = allNavItems.filter((item) =>
//     config.navItems.includes(item.key)
//   );

//   const handleSampleButtonClick = () => {
//     if (normalizedRole === "datacollector") {
//       setShowHeavyMetalModal(true);
//     } else {
//       setShowForm(true);
//     }
//     setMobileMenuOpen(false);
//   };

//   return (
//     /* note: wrapper is NOT flex on mobile — prevents horizontal push */
//     <div className="pt-5 pl-6 z-[2000] lg:flex lg:gap-6">
//       {/* overlay shown only on mobile when menu open */}
//       {mobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setMobileMenuOpen(false)}
//           aria-hidden
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         aria-label="Sidebar"
//         className={`fixed lg:sticky top-16 lg:top-24 left-0 z-50
//     h-full lg:h-fit w-64 lg:w-64
//     transform transition-transform duration-300 ease-in-out
//     ${theme?.card} shadow-xl lg:shadow-md border-r lg:border ${theme?.border}
//     p-4 lg:rounded-lg
//     ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//   `}
//       >
//         {/* Mobile header with close button */}
//         <div className="flex items-center justify-between lg:hidden mb-3">
//           {/* <div className="text-sm font-semibold text-emerald-400">Menu</div> */}
//           {/* <button
//             onClick={() => setMobileMenuOpen(false)}
//             className="p-1 rounded hover:bg-gray-700/30"
//             aria-label="Close menu"
//           >
//             <X size={18} />
//           </button> */}
//         </div>
//         {/* Navigation */}
//         <nav className="space-y-2">
//           {navItemsToRender.map((item) => (
//             <NavItem
//               key={item.key}
//               icon={item.icon}
//               label={item.label}
//               route={item.route}
//               setMobileMenuOpen={setMobileMenuOpen}
//               darkMode={darkMode}
//               theme={theme}
//             />
//           ))}
//         </nav>
//         {/* Actions */}
//         <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
//           <button
//             onClick={handleSampleButtonClick}
//             className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
//             aria-label={config.sampleButtonLabel}
//           >
//             <Plus className="w-5 h-5" />
//             {config.sampleButtonLabel}
//           </button>

//           {normalizedRole !== "datacollector" && (
//             <button
//               onClick={() => excelImportRef?.current?.click()}
//               className={`w-full border ${theme?.border} font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${theme?.text} transition-colors ${theme?.hover}`}
//             >
//               <Upload className="w-5 h-5" />
//               Import Excel
//             </button>
//           )}
//         </div>
//       </aside>
//     </div>
//   );
// };

// export default Sidebar;

import {
  BarChart3,
  Database,
  Map,
  FileText,
  Users,
  Plus,
  Upload,
} from "lucide-react";
import { useSelector } from "react-redux";
import NavItem from "../common/NavItem";

const roleConfig = {
  superadmin: {
    sampleButton: true,
    excelImport: true,
    navItems: ["dashboard", "database", "map", "reports", "agents"],
  },
  headresearcher: {
    sampleButton: true,
    excelImport: false,
    navItems: ["dashboard", "database", "map", "reports", "agents"],
  },
  policymakerson: {
    sampleButton: false,
    excelImport: false,
    navItems: ["map"], // ONLY MAP
  },
  supervisor: {
    sampleButton: false,
    excelImport: false,
    navItems: ["agents"], // ONLY FIELD AGENTS
  },
  datacollector: {
    sampleButton: true,
    excelImport: false,
    navItems: ["database", "map"],
  },
};

const Sidebar = ({
  theme,
  mobileMenuOpen,
  setMobileMenuOpen,
  darkMode,
  setShowForm,
  setShowHeavyMetalModal,
  excelImportRef,
}) => {
  const { currentUser } = useSelector((state) => state.auth);

  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");
  const config = roleConfig[normalizedRole] || roleConfig.superadmin;
  // const canImportExcel = ["superadmin", "headresearcher"].includes(normalizedRole);

  const allNavItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      route: "/dashboard",
      key: "dashboard",
    },
    {
      icon: Database,
      label: "Sample Database",
      route: "/database",
      key: "database",
    },
    { icon: Map, label: "Geographic View", route: "/map", key: "map" },
    { icon: FileText, label: "Reports", route: "/reports", key: "reports" },
    { icon: Users, label: "Field Agents", route: "/agents", key: "agents" },
  ];

  const navItemsToRender = allNavItems.filter((item) =>
    config.navItems.includes(item.key)
  );

  const handleSampleButtonClick = () => {
    if (normalizedRole === "datacollector") {
      setShowHeavyMetalModal(true);
    } else {
      setShowForm(true);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="pt-5 pl-6 z-[2000] lg:flex lg:gap-6">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 lg:top-24 left-0 z-50
          h-full lg:h-fit w-64 lg:w-64
          ${theme?.card} shadow-xl lg:shadow-md border-r lg:border ${
          theme?.border
        }
          p-4 lg:rounded-lg
          transform transition-transform duration-300 ease-in-out
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <nav className="space-y-2">
          {navItemsToRender.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              route={item.route}
              setMobileMenuOpen={setMobileMenuOpen}
              darkMode={darkMode}
              theme={theme}
            />
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
          {/* SAMPLE BUTTON ONLY FOR roles WITH sampleButton = true */}
          {config.sampleButton && (
            <button
              onClick={handleSampleButtonClick}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Sample
            </button>
          )}

          {/* EXCEL IMPORT ONLY FOR SUPER ADMIN */}
          {config.excelImport && (
            <button
              onClick={() => excelImportRef?.current?.click()}
              className={`w-full border ${theme?.border} font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${theme?.text} transition-colors ${theme?.hover}`}
            >
              <Upload className="w-5 h-5" />
              Import Excel
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
