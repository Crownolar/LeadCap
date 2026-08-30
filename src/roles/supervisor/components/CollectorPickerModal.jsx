import { useState } from "react";
/**
 * CollectorPickerModal.jsx
 * ─────────────────────────
 * Modal shown when a supervisor clicks "Review Samples" in the sidebar.
 * Lets them pick a specific collector (or "All") before navigating to
 * /sample-review or /sample-review/:collectorId.
 *
 * Moved from components/views/supervisor/components/ into the module layer.
 * No logic changes from the original.
 *
 * Props
 *   onClose – () => void
 */

import { useNavigate } from "react-router-dom";
import { X, Users, Search, ChevronRight, Loader2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useSupervisorScope } from "../hooks/useSupervisorScope";

const CollectorPickerModal = ({ onClose }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { collectors, loading, error } = useSupervisorScope();
  const [search, setSearch] = useState("");



  const filtered = collectors.filter((c) => {
    const name = c.fullName || c.name || "";
    const email = c.email || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSelect = (collectorId) => {
    onClose();
    collectorId ? navigate(`/sample-review/${collectorId}`) : navigate("/sample-review");
  };

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl ${theme.card} ${theme.border}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-6 py-4 ${theme.border}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${theme.text}`}>Select a Data Collector</p>
              <p className={`text-xs ${theme.textMuted}`}>Choose whose samples to review</p>
            </div>
          </div>
          <button onClick={onClose} className={`rounded-xl p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800 ${theme.textMuted}`}>
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Search */}
        <div className={`border-b px-4 py-3 ${theme.border}`}>
          <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${theme.border} ${theme.card}`}>
            <Search className={`h-4 w-4 shrink-0 ${theme.textMuted}`} />
            <input autoFocus type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className={`flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 ${theme.text}`} />
          </div>
        </div>
        {/* List */}
        <div className="max-h-[340px] overflow-y-auto px-4 py-3 space-y-2">
          <button onClick={() => handleSelect(null)} className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-[1px] hover:shadow-md ${theme.border} ${theme.card}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-semibold">All</div>
              <div>
                <p className={`text-sm font-semibold ${theme.text}`}>All Collectors</p>
                <p className={`text-xs ${theme.textMuted}`}>View all submitted samples</p>
              </div>
            </div>
            <ChevronRight className={`h-4 w-4 ${theme.textMuted}`} />
          </button>
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              <p className={`text-sm ${theme.textMuted}`}>Loading collectors...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Unable to verify your collector scope.</p>
              <p className={`mt-1 text-xs ${theme.textMuted}`}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center"><p className={`text-sm ${theme.textMuted}`}>No collectors found.</p></div>
          ) : (
            filtered.map((collector) => {
              const name = collector.fullName || collector.name || "Unknown";
              const email = collector.email || "";
              const sampleCount = collector.sampleCount ?? collector._count?.samples ?? null;
              return (
                <button key={collector.id} onClick={() => handleSelect(collector.id)} className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-[1px] hover:shadow-md ${theme.border} ${theme.card}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold dark:bg-emerald-900/30 dark:text-emerald-300">{getInitials(name)}</div>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-semibold ${theme.text}`}>{name}</p>
                      {email && <p className={`truncate text-xs ${theme.textMuted}`}>{email}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {sampleCount !== null && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{sampleCount}</span>
                    )}
                    <ChevronRight className={`h-4 w-4 ${theme.textMuted}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>
        {/* Footer */}
        <div className={`border-t px-6 py-3 ${theme.border}`}>
          <p className={`text-center text-xs ${theme.textMuted}`}>{collectors.length} collector{collectors.length !== 1 ? "s" : ""} assigned to you</p>
        </div>
      </div>
    </div>
  );
};

export default CollectorPickerModal;