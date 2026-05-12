import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const themes = {
  light: {
    // ── base ──────────────────────────────────────────────────
    bg: "bg-gray-50",
    card: "bg-white",
    text: "text-gray-900",
    textMuted: "text-gray-500",
    border: "border-gray-200",
    hover: "hover:bg-gray-100",
    input: "bg-white border-gray-300 text-gray-900",

    // ── status chips ──────────────────────────────────────────
    safe: "bg-green-100 text-green-700",
    moderate: "bg-orange-100 text-orange-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-50 text-blue-700",

    // ── emerald accent ────────────────────────────────────────
    emerald: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    emeraldText: "text-emerald-700",
    emeraldBorder: "border border-emerald-200 bg-emerald-50",

    safeText: "text-green-700",
    dangerText: "text-red-700",

    // ── CommentSection tokens ─────────────────────────────────
    // page shell
    cs_pageBg: "bg-gray-50",

    // sticky nav
    cs_navBg: "bg-gray-50/80",
    cs_navBorder: "border-gray-200",
    cs_navBackBtn: "bg-gray-200 hover:bg-gray-300",
    cs_navBackIcon: "text-gray-600 hover:text-gray-900",
    cs_navSampleId: "text-gray-400",

    // cards
    cs_cardBg: "bg-white",
    cs_cardBorder: "border-gray-200",
    cs_cardHeaderBorder: "border-gray-100",

    // card header icon wells
    cs_iconWellIndigo: "bg-indigo-100",
    cs_iconIndigo: "text-indigo-600",
    cs_iconWellEmerald: "bg-emerald-100",
    cs_iconEmerald: "text-emerald-600",

    // product hero
    cs_heroIconWell: "bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-200",
    cs_heroIcon: "text-indigo-600",
    cs_productName: "text-gray-900",
    cs_productVariant: "text-gray-500",
    cs_marketTypeBadge: "bg-purple-100 border-purple-200 text-purple-700",
    cs_marketNameBadge: "bg-gray-100 text-gray-500",
    cs_priceLabel: "text-gray-400",
    cs_priceValue: "text-gray-700",

    // meta fields
    cs_metaIconColor: "text-gray-400",
    cs_metaLabel: "text-gray-400",
    cs_metaValue: "text-gray-800",
    cs_metaMono: "text-emerald-700 font-mono",

    // heavy-metals bar
    cs_metalLabel: "text-gray-400",

    // section heading
    cs_sectionHeading: "text-gray-900",

    // comments count badge
    cs_commentsBadge: "bg-emerald-100 text-emerald-700 border-emerald-200",

    // comment list area
    cs_commentListBg: "bg-transparent",

    // empty-state
    cs_emptyIconWell: "bg-gray-100",
    cs_emptyIcon: "text-gray-400",
    cs_emptyTitle: "text-gray-500",
    cs_emptySubtitle: "text-gray-400",

    // compose area
    cs_composeTextareaBg: "bg-gray-100/60 border-gray-200 hover:border-gray-300",
    cs_composeTextareaFocused: "border-emerald-400",
    cs_composePlaceholder: "placeholder-gray-400",
    cs_composeText: "text-gray-800",
    cs_composeSendBtn: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20",
    cs_composeSendDisabled: "bg-gray-200 text-gray-400 cursor-not-allowed",
    cs_composeHint: "text-gray-400",
    cs_composeLabel: "text-gray-400",

    // locked banner
    cs_lockedBg: "bg-amber-50 border-amber-200",
    cs_lockedIcon: "text-amber-500",
    cs_lockedText: "text-amber-700",
  },

  dark: {
    // ── base ──────────────────────────────────────────────────
    bg: "bg-gray-900",
    card: "bg-gray-800",
    text: "text-gray-100",
    textMuted: "text-gray-400",
    border: "border-gray-700",
    hover: "hover:bg-gray-700",
    input: "bg-gray-700 border-gray-600 text-gray-100",

    // ── status chips ──────────────────────────────────────────
    safe: "bg-green-900/30 text-green-300",
    moderate: "bg-orange-900/30 text-orange-300",
    danger: "bg-red-900/30 text-red-300",
    info: "bg-blue-900/30 text-blue-300",

    // ── emerald accent ────────────────────────────────────────
    emerald: "border border-emerald-900/40 bg-emerald-900/20 text-emerald-300",
    emeraldText: "text-emerald-300",
    emeraldBorder: "border border-emerald-900/40 bg-emerald-900/20",

    safeText: "text-green-300",
    dangerText: "text-red-300",

    // ── CommentSection tokens ─────────────────────────────────
    // page shell  (matches original #080c12)
    cs_pageBg: "bg-[#080c12]",

    // sticky nav
    cs_navBg: "bg-[#080c12]/80",
    cs_navBorder: "border-white/[0.05]",
    cs_navBackBtn: "bg-white/5 hover:bg-white/10",
    cs_navBackIcon: "text-gray-400 hover:text-white",
    cs_navSampleId: "text-gray-500",

    // cards  (matches original #0e1420)
    cs_cardBg: "bg-[#0e1420]",
    cs_cardBorder: "border-white/[0.06]",
    cs_cardHeaderBorder: "border-white/[0.05]",

    // card header icon wells
    cs_iconWellIndigo: "bg-indigo-500/10",
    cs_iconIndigo: "text-indigo-400",
    cs_iconWellEmerald: "bg-emerald-500/10",
    cs_iconEmerald: "text-emerald-400",

    // product hero
    cs_heroIconWell: "bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/15",
    cs_heroIcon: "text-indigo-300",
    cs_productName: "text-white",
    cs_productVariant: "text-gray-400",
    cs_marketTypeBadge: "bg-purple-500/10 border-purple-500/15 text-purple-300",
    cs_marketNameBadge: "bg-white/5 text-gray-400",
    cs_priceLabel: "text-gray-500",
    cs_priceValue: "text-gray-200",

    // meta fields
    cs_metaIconColor: "text-gray-500",
    cs_metaLabel: "text-gray-500",
    cs_metaValue: "text-gray-100",
    cs_metaMono: "text-emerald-300 font-mono",

    // heavy-metals bar
    cs_metalLabel: "text-gray-500",

    // section heading
    cs_sectionHeading: "text-white",

    // comments count badge
    cs_commentsBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",

    // comment list area
    cs_commentListBg: "bg-transparent",

    // empty-state
    cs_emptyIconWell: "bg-white/5",
    cs_emptyIcon: "text-gray-600",
    cs_emptyTitle: "text-gray-500",
    cs_emptySubtitle: "text-gray-600",

    // compose area
    cs_composeTextareaBg: "bg-gray-800/40 border-white/[0.06] hover:border-white/10",
    cs_composeTextareaFocused: "border-emerald-500/40",
    cs_composePlaceholder: "placeholder-gray-600",
    cs_composeText: "text-gray-100",
    cs_composeSendBtn: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20",
    cs_composeSendDisabled: "bg-gray-700 text-gray-500 cursor-not-allowed",
    cs_composeHint: "text-gray-600",
    cs_composeLabel: "text-gray-500",

    // locked banner
    cs_lockedBg: "bg-amber-500/5 border-amber-500/15",
    cs_lockedIcon: "text-amber-400/70",
    cs_lockedText: "text-amber-300/70",
  },
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const theme = darkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleDarkMode }}>
      <div className={`${theme.bg} min-h-screen transition-colors duration-300`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
