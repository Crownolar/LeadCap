import {
  BarChart3,
  Database,
  Map,
  FileText,
  Users,
  Plus,
  Upload,
  Beaker,
  Settings,
  FlaskConical,
  Microscope,
  BrainCircuit,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import NavItem from "../common/NavItem";
import { useState } from "react";
import { CollectorPickerModal } from "../../roles/supervisor";
import { useLocation } from "react-router";

const roleConfig = {
  superadmin: {
    sampleButton: true,
    excelImport: true,
    navItems: ["dashboard", "database", "map", "reports", "thresholds", "invites"],
  },
  headresearcher: {
    sampleButton: false,
    excelImport: false,
    navItems: ["dashboard", "database", "map", "reports", "invites"],
  },
  policymakerson: {
    sampleButton: false,
    excelImport: false,
    navItems: ["dashboard", "map"],
  },
  policymakeruniversity: {
    sampleButton: false,
    excelImport: false,
    navItems: ["research"],
  },
  policymakerresolve: {
    sampleButton: false,
    excelImport: false,
    navItems: ["dashboard", "map"],
  },
  policymakernafdac: {
    sampleButton: false,
    excelImport: false,
    navItems: [
      "dashboard", "map", "nafdac-upload", "nafdac-history",
      "nafdac-products", "nafdac-verifications", "nafdac-risk",
    ],
  },
  policymakerfmohsw: {
    sampleButton: false,
    excelImport: false,
    navItems: [
      "moh-dashboard", "moh-samples", "moh-reports",
      "moh-verification", "moh-contamination",
    ],
  },
  supervisor: {
    sampleButton: false,
    excelImport: false,
    navItems: ["dashboard", "collectors", "sample-review"],
  },
  datacollector: {
    sampleButton: true,
    excelImport: false,
    navItems: ["my-samples"],
  },
  labanalyst: {
    sampleButton: false,
    excelImport: false,
    navItems: ["lab-samples", "lab-recording"],
  },
};

const allNavItems = [
  { icon: BarChart3, label: "Dashboard", route: "/dashboard", key: "dashboard" },
  { icon: BrainCircuit, label: "Research & Modeling", route: "/research", key: "research" },
  { icon: Beaker, label: "My Samples", route: "/data-collector", key: "my-samples" },
  { icon: Beaker, label: "Lab Samples", route: "/lab-samples", key: "lab-samples" },
  { icon: Microscope, label: "Lab Recording", route: "/lab-recording", key: "lab-recording" },
  { icon: Database, label: "Sample Database", route: "/database", key: "database" },
  { icon: Map, label: "Geographic View", route: "/map", key: "map" },
  { icon: FileText, label: "Reports", route: "/reports", key: "reports" },
  { icon: Users, label: "Data Collectors", route: "/collectors", key: "collectors" },
  { icon: FileText, label: "Review Samples", route: "/sample-review", key: "sample-review" },
  { icon: Settings, label: "Thresholds", route: "/thresholds", key: "thresholds" },
  { icon: Plus, label: "Invite Codes", route: "/invitecodes", key: "invites" },
  { icon: FlaskConical, label: "Registry Upload", route: "/nafdac-upload", key: "nafdac-upload" },
  { icon: Database, label: "Registry History", route: "/nafdac-history", key: "nafdac-history" },
  { icon: Beaker, label: "Product Search", route: "/nafdac-products", key: "nafdac-products" },
  { icon: FileText, label: "Verification Logs", route: "/nafdac-verifications", key: "nafdac-verifications" },
  { icon: Microscope, label: "Risk Intelligence", route: "/nafdac-risk", key: "nafdac-risk" },
  { icon: Users, label: "User Governance", route: "/nafdac-users", key: "nafdac-users" },
  { icon: BarChart3, label: "MOH Dashboard", route: "/moh/dashboard", key: "moh-dashboard" },
  { icon: Database, label: "MOH Samples", route: "/moh/samples", key: "moh-samples" },
  { icon: FileText, label: "MOH Reports", route: "/moh/reports", key: "moh-reports" },
  { icon: Microscope, label: "Verification", route: "/moh/verification", key: "moh-verification" },
  { icon: Beaker, label: "Contamination", route: "/moh/contamination", key: "moh-contamination" },
];

const Sidebar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  setShowForm,
  excelImportRef,
  supervisor,
  loadingSupervisor,
  supervisorError,
  assignmentChecked,
  canCreateSample,
}) => {
  const { currentUser } = useSelector((state) => state.auth);
  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_.-]/g, "");
  const config = roleConfig[normalizedRole] || roleConfig.superadmin;
  const { theme, darkMode } = useTheme();
  const [showCollectorPicker, setShowCollectorPicker] = useState(false);
  const location = useLocation();

  const navItemsToRender = allNavItems.filter((item) =>
    config.navItems.includes(item.key)
  );

  const isCollector = normalizedRole === "datacollector";
  const sampleCreationPending = isCollector && !assignmentChecked;
  const sampleCreationBlocked = isCollector && !canCreateSample;

  const handleSampleButtonClick = () => {
    if (sampleCreationBlocked) return;
    setShowForm(true);
    setMobileMenuOpen(false);
  };

  const renderNavItem = (item) => {
    if (item.key === "sample-review") {
      const isActive =
        location.pathname === "/sample-review" ||
        location.pathname.startsWith("/sample-review/");

      return (
        <button
          key={item.key}
          onClick={() => {
            setShowCollectorPicker(true);
            setMobileMenuOpen(false);
          }}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-left transition-all duration-150
            ${isActive
              ? "bg-emerald-500 text-white shadow-sm"
              : `${theme?.text} ${theme?.hover}`}
          `}
        >
<<<<<<< HEAD
          <item.icon className='w-5 h-5' />
          <span className='font-medium'>Review Samples</span>
=======
          <item.icon className="w-[18px] h-[18px] shrink-0" />
          <span className="text-sm font-medium truncate">Review Samples</span>
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
        </button>
      );
    }

    return (
      <NavItem
        key={item.key}
        icon={item.icon}
        label={item.label}
        route={item.route}
        setMobileMenuOpen={setMobileMenuOpen}
        darkMode={darkMode}
        theme={theme}
      />
    );
  };

  const actionButtons = (
    <div className={`pt-4 border-t ${theme.border} space-y-2`}>
      {config.sampleButton && (
        <>
          <button
            onClick={handleSampleButtonClick}
            disabled={sampleCreationPending || sampleCreationBlocked}
            title={
              isCollector && supervisorError
                ? "Supervisor assignment could not be verified."
                : isCollector && !supervisor
                  ? "A Supervisor must assign you before you can create samples."
                  : "Create a new sample"
            }
            className={`
              w-full font-semibold py-2.5 px-3 rounded-xl
              flex items-center justify-center gap-2 text-sm
              transition-all duration-150
              ${sampleCreationBlocked || sampleCreationPending
                ? "bg-gray-400 text-white cursor-not-allowed opacity-80"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"}
            `}
          >
            <Plus className="w-[18px] h-[18px]" />
            {sampleCreationPending ? "Checking Assignment..." : "New Sample"}
          </button>

          {isCollector && sampleCreationBlocked && (
            <p
              className={`px-1 text-[11px] leading-4 ${
                supervisorError
                  ? "text-amber-600 dark:text-amber-400"
                  : theme.textMuted
              }`}
            >
              {supervisorError
                ? "Supervisor assignment could not be verified. Try again later."
                : "A Supervisor must assign you before you can create a sample."}
            </p>
          )}
        </>
      )}

      {config.excelImport && (
        <button
          onClick={() => excelImportRef?.current?.click()}
          className={`
            w-full border ${theme?.border} font-medium py-2.5 px-3
            rounded-xl flex items-center justify-center gap-2 text-sm
            ${theme?.text} ${theme?.hover} transition-colors
          `}
        >
          <Upload className="w-[18px] h-[18px]" />
          Import Excel
        </button>
      )}
    </div>
  );

  return (
    <>
      {mobileMenuOpen && (
        <div
<<<<<<< HEAD
          className='fixed inset-0 z-[2000] bg-black/40 lg:hidden'
=======
          className="fixed inset-0 z-[2000] bg-slate-950/55 backdrop-blur-[2px] lg:hidden"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

<<<<<<< HEAD
      <div className='hidden lg:block w-64 shrink-0 pt-5'>
=======
      {/* Desktop */}
      <div className="hidden lg:block w-[240px] shrink-0">
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
        <aside
          className={`
            sticky top-[88px] z-30
            w-[240px] h-[calc(100vh-104px)]
            rounded-2xl border ${theme?.border}
            shadow-sm p-3
            flex flex-col
            ${theme?.card}
          `}
        >
<<<<<<< HEAD
          <nav className='space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide pr-1'>
            {navItemsToRender.map((item) => renderNavItem(item))}
          </nav>

          <div
            className={`mt-6 pt-6 border-t ${theme.border} space-y-2 shrink-0`}
          >
            {config.sampleButton && (
              <button
                onClick={handleSampleButtonClick}
                className='w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'
              >
                <Plus className='w-5 h-5' />
                New Sample
              </button>
            )}

            {config.excelImport && (
              <button
                onClick={() => excelImportRef?.current?.click()}
                className={`w-full border ${theme?.border} font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${theme?.text} transition-colors ${theme?.hover}`}
              >
                <Upload className='w-5 h-5' />
                Import Excel
              </button>
            )}
=======
          <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-1 pr-1">
            {navItemsToRender.map(renderNavItem)}
          </nav>

          <div className="shrink-0 mt-3">
            {actionButtons}
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
          </div>
        </aside>
      </div>

      {/* Mobile */}
      <aside
        className={`
          fixed top-[72px] left-0 z-[2000]
          h-[calc(100vh-72px)] w-[280px]
          shadow-2xl p-3 flex flex-col
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${theme?.card} ${theme?.border}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
<<<<<<< HEAD
        <div className='flex flex-col h-full min-h-0'>
          <nav className='space-y-2 pr-1 overflow-y-auto scrollbar-hide max-h-[min(70vh,calc(100vh-10rem))]'>
            {navItemsToRender.map((item) => renderNavItem(item))}
          </nav>

          <div
            className={`mt-4 pt-4 border-t ${theme.border} space-y-2 shrink-0`}
          >
            {config.sampleButton && (
              <button
                onClick={handleSampleButtonClick}
                className='w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'
              >
                <Plus className='w-5 h-5' />
                New Sample
              </button>
            )}

            {config.excelImport && (
              <button
                onClick={() => excelImportRef?.current?.click()}
                className={`w-full border ${theme?.border} font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${theme?.text} transition-colors ${theme?.hover}`}
              >
                <Upload className='w-5 h-5' />
                Import Excel
              </button>
            )}
          </div>
        </div>
=======
        <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-1 pr-1">
          {navItemsToRender.map(renderNavItem)}
        </nav>

        <div className="shrink-0 mt-3">{actionButtons}</div>
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
      </aside>

      {showCollectorPicker && (
        <CollectorPickerModal onClose={() => setShowCollectorPicker(false)} />
      )}
    </>
  );
};

export default Sidebar;
