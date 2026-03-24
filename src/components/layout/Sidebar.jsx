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
  TestTubeDiagonal,
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
    navItems: ["dashboard", "map"], // DASHBOARD AND MAP
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
    navItems: ["dashboard", "collectors", "sample-review"], // Supervisor features
  },
  datacollector: {
    sampleButton: true,
    excelImport: false,
    navItems: ["my-samples"], // My Samples for lab results only
  },
  labanalyst: {
    sampleButton: false,
    excelImport: false,
    navItems: ["lab-samples", "lab-recording"], // Lab analyst - view and confirm AAS; record-reading/:id from dashboard
  },
};

const Sidebar = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  setShowForm,
  // setShowHeavyMetalModal,
  excelImportRef,
}) => {
  const { currentUser } = useSelector((state) => state.auth);

  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");
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
      icon: BarChart3,
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
    <div className='pt-5 pl-6 z-[2000] lg:flex lg:gap-6 '>
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden '
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 lg:top-24 left-0 z-50 pt-16 md:pt-7
          h-full lg:h-fit w-64 lg:w-64 border-4 
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
        <nav className='space-y-2  max-h-[500px]  overflow-y-auto '>
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

        <div className={`mt-6 pt-6 border-t ${theme.border} space-y-2`}>
          {/* SAMPLE BUTTON ONLY FOR roles WITH sampleButton = true */}
          {config.sampleButton && (
            <button
              onClick={handleSampleButtonClick}
              className='w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'
            >
              <Plus className='w-5 h-5' />
              New Sample
            </button>
          )}

          {/* EXCEL IMPORT ONLY FOR SUPER ADMIN */}
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
  );
};

export default Sidebar;
