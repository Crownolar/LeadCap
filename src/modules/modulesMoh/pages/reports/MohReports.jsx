import React, { useState } from "react";
import {
  BarChart3,
  ShieldAlert,
  MapPinned,
  FlaskConical,
  FileText,
  Download,
  Clock3,
  ChevronRight,
} from "lucide-react";

import { useTheme } from "../../../../context/ThemeContext";

import StateSummaryReport from "./components/reports/StateSummaryReport";
import RiskAssessmentReport from "./components/reports/RiskAssessmentReport";
import ProductTypeReport from "./components/reports/ProductTypeReport";
import ContaminationAnalysisReport from "./components/reports/ContaminationAnalysisReport";

const REPORT_TABS = [
  {
    id: "state",
    label: "State Summary",
    shortLabel: "State",
    description: "Compare lead exposure activity across states.",
    icon: MapPinned,
  },
  {
    id: "risk",
    label: "Risk Assessment",
    shortLabel: "Risk",
    description: "Identify samples and areas requiring priority attention.",
    icon: ShieldAlert,
  },
  {
    id: "product",
    label: "Product Type",
    shortLabel: "Products",
    description: "Analyse contamination and verification by product type.",
    icon: BarChart3,
  },
  {
    id: "contamination",
    label: "Contamination Analysis",
    shortLabel: "Contamination",
    description: "Examine heavy-metal contamination patterns and outcomes.",
    icon: FlaskConical,
  },
];

const MohReports = () => {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState("state");

  const activeReport = REPORT_TABS.find(
    (tab) => tab.id === activeTab,
  );

  const renderReport = () => {
    switch (activeTab) {
      case "risk":
        return <RiskAssessmentReport />;

      case "product":
        return <ProductTypeReport />;

      case "contamination":
        return <ContaminationAnalysisReport />;

      case "state":
      default:
        return <StateSummaryReport />;
    }
  };

  return (
    <main
      className={`min-h-full ${theme.text} transition-colors duration-300`}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-5 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        {/* ================================================================ */}
        {/* PAGE HEADER                                                      */}
        {/* ================================================================ */}

        <section
          className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.card} shadow-sm`}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-teal-500/5 blur-3xl" />
          </div>

          <div className="relative p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                      Ministry of Health
                    </p>

                    <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
                      Reports & Intelligence
                    </h1>
                  </div>
                </div>

                <p
                  className={`mt-4 max-w-2xl text-sm leading-6 ${theme.textMuted}`}
                >
                  Generate, review and export analytical reports from LeadCap
                  surveillance data. Use the report views below to examine
                  geographic patterns, product risks and contamination
                  outcomes.
                </p>
              </div>

              {/* Header utility */}
              <div
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 ${theme.border} ${theme.bg}`}
              >
                <Clock3
                  className={`h-4 w-4 ${theme.textMuted}`}
                />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Reporting workspace
                  </p>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Live surveillance data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* REPORT NAVIGATION                                                */}
        {/* ================================================================ */}

        <section
          className={`rounded-3xl border ${theme.border} ${theme.card} p-2 shadow-sm`}
        >
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "group relative rounded-2xl border p-3 text-left transition-all duration-200 sm:p-4",
                    active
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : `${theme.border} ${theme.bg} hover:-translate-y-[1px] hover:shadow-sm`,
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <ChevronRight
                      className={[
                        "mt-1 h-4 w-4 transition-transform",
                        active
                          ? "text-white/80"
                          : `${theme.textMuted} group-hover:translate-x-0.5`,
                      ].join(" ")}
                    />
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-bold sm:text-sm">
                      <span className="sm:hidden">
                        {tab.shortLabel}
                      </span>
                      <span className="hidden sm:inline">
                        {tab.label}
                      </span>
                    </p>

                    <p
                      className={[
                        "mt-1 hidden text-[11px] leading-4 sm:block",
                        active
                          ? "text-white/80"
                          : theme.textMuted,
                      ].join(" ")}
                    >
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* ACTIVE REPORT CONTEXT                                            */}
        {/* ================================================================ */}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />

            <p className="text-sm font-semibold">
              {activeReport?.label}
            </p>

            <ChevronRight
              className={`h-4 w-4 ${theme.textMuted}`}
            />

            <p className={`text-xs ${theme.textMuted}`}>
              Analytical report
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium ${theme.border} ${theme.bg}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Report workspace
          </div>
        </div>

        {/* ================================================================ */}
        {/* REPORT CONTENT                                                   */}
        {/* ================================================================ */}

        <section className="min-w-0">
          {renderReport()}
        </section>
      </div>
    </main>
  );
};

export default MohReports;