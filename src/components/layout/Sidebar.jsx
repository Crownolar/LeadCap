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
} from "lucide-react";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import NavItem from "../common/NavItem";

const roleConfig = {
  superadmin: {
    sampleButton: true,
    excelImport: true,
    navItems: [
      "dashboard",
      "database",
      "map",
      "reports",
      "thresholds",
      "invites",
    ],
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
    navItems: ["dashboard", "map"],
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
      "dashboard",
      "map",
      "nafdac-upload",
      "nafdac-history",
      "nafdac-products",
      "nafdac-verifications",
      "nafdac-risk",
    ],
  },
  policymakerfmohsw: {
    sampleButton: false,
    excelImport: false,
    navItems: [
      "moh-dashboard",
      "moh-samples",
      "moh-reports",
      "moh-verification",
      "moh-contamination",
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

const Sidebar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  setShowForm,
  excelImportRef,
}) => {
  const { currentUser } = useSelector((state) => state.auth);
  const normalizedRole = currentUser?.role
    ?.toLowerCase()
    .replace(/[\s_.-]/g, "");
  const config = roleConfig[normalizedRole] || roleConfig.superadmin;
  const { theme, darkMode } = useTheme();

  const allNavItems = [
    {
      icon: BarChart3,
      label: "Dashboard",
      route: "/dashboard",
      key: "dashboard",
    },

    {
      icon: Beaker,
      label: "My Samples",
      route: "/data-collector",
      key: "my-samples",
    },
    {
      icon: Beaker,
      label: "Lab Samples",
      route: "/lab-samples",
      key: "lab-samples",
    },
    {
      icon: Microscope,
      label: "Lab Recording",
      route: "/lab-recording",
      key: "lab-recording",
    },
    {
      icon: Database,
      label: "Sample Database",
      route: "/database",
      key: "database",
    },
    { icon: Map, label: "Geographic View", route: "/map", key: "map" },
    { icon: FileText, label: "Reports", route: "/reports", key: "reports" },
    {
      icon: Users,
      label: "Data Collectors",
      route: "/collectors",
      key: "collectors",
    },
    {
      icon: FileText,
      label: "Review Samples",
      route: "/sample-review",
      key: "sample-review",
    },
    {
      icon: Settings,
      label: "Thresholds",
      route: "/thresholds",
      key: "thresholds",
    },
    {
      icon: Plus,
      label: "Invite Codes",
      route: "/invitecodes",
      key: "invites",
    },
    {
      icon: FlaskConical,
      label: "Registry Upload",
      route: "/nafdac-upload",
      key: "nafdac-upload",
    },
    {
      icon: Database,
      label: "Registry History",
      route: "/nafdac-history",
      key: "nafdac-history",
    },
    {
      icon: Beaker,
      label: "Product Search",
      route: "/nafdac-products",
      key: "nafdac-products",
    },
    {
      icon: FileText,
      label: "Verification Logs",
      route: "/nafdac-verifications",
      key: "nafdac-verifications",
    },
    {
      icon: Microscope,
      label: "Risk Intelligence",
      route: "/nafdac-risk",
      key: "nafdac-risk",
    },
    {
      icon: Users,
      label: "User Governance",
      route: "/nafdac-users",
      key: "nafdac-users",
    },
    {
      icon: BarChart3,
      label: "MOH Dashboard",
      route: "/moh/dashboard",
      key: "moh-dashboard",
    },
    {
      icon: Database,
      label: "MOH Samples",
      route: "/moh/samples",
      key: "moh-samples",
    },
    {
      icon: FileText,
      label: "MOH Reports",
      route: "/moh/reports",
      key: "moh-reports",
    },
    {
      icon: Microscope,
      label: "Verification",
      route: "/moh/verification",
      key: "moh-verification",
    },
    {
      icon: Beaker,
      label: "Contamination",
      route: "/moh/contamination",
      key: "moh-contamination",
    },
  ];

  const navItemsToRender = allNavItems.filter((item) =>
    config.navItems.includes(item.key),
  );
  const handleSampleButtonClick = () => {
    setShowForm(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {mobileMenuOpen && (
        <div
          className='fixed  inset-0 z-[2000] bg-black/40 lg:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className='hidden lg:block w-64 shrink-0 pt-5'>
        <aside
          className={`
            sticky top-24 z-30
            w-64 h-[calc(100vh-7rem)]
            border lg:border rounded-lg
            shadow-md
            p-4
            flex flex-col
            ${theme?.card} ${theme?.border}
          `}
        >
          <nav className='space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-hide pr-1'>
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
          </div>
        </aside>
      </div>

      {/* mobile sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-[2000] pt-6
          h-[calc(100vh-4rem)] w-64
          shadow-xl
          p-4
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:hidden
         
          ${theme?.card} ${theme?.border}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className='flex flex-col h-full min-h-0'>
          <nav
            className='
              space-y-2 pr-1 overflow-y-auto scrollbar-hide
              max-h-[min(70vh,calc(100vh-10rem))]
            '
          >
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
      </aside>
    </>
  );
};

export default Sidebar;
