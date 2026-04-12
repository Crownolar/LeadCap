import React from "react";
import { Database, FileText, FlaskConical, Microscope, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NafdacQuickActions = ({ theme }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Registry Upload",
      description: "Upload registry data and start new registry ingestion.",
      icon: FlaskConical,
      route: "/nafdac-upload",
    },
    {
      title: "Registry History",
      description: "Review registry ingestion history and previous records.",
      icon: Database,
      route: "/nafdac-history",
    },
    {
      title: "Product Search",
      description: "Look up products and compare registry-linked records.",
      icon: Search,
      route: "/nafdac-products",
    },
    {
      title: "Verification Logs",
      description: "Review verification outcomes and product-level checks.",
      icon: FileText,
      route: "/nafdac-verifications",
    },
    {
      title: "Risk Intelligence",
      description: "Inspect flagged records and priority regulatory insights.",
      icon: Microscope,
      route: "/nafdac-risk",
    },
  ];

  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Navigate to core NAFDAC workflows from one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              onClick={() => navigate(action.route)}
              className={`text-left border ${theme.border} rounded-xl p-4 hover:shadow-md transition ${theme.hover}`}
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Icon size={18} />
              </div>
              <h4 className="font-medium mb-1">{action.title}</h4>
              <p className={`text-sm leading-6 ${theme.textMuted}`}>{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NafdacQuickActions;