import { useEffect, useState } from "react";
import {
  ArrowLeft, MessageSquare, Send, Loader, Lock,
  MapPin, Hash, Calendar, Tag, ShoppingBag, Beaker,
  AlertTriangle, CheckCircle, Clock, ChevronRight,
  Thermometer, FlaskConical, Info
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import Comments from "./Comments";
import api from "../../utils/api";
import { useSelector } from "react-redux";

/* ─── status tiny helpers ─────────────────────────────────────────── */
const fmt = (val, decimals = 6) =>
  val !== null && val !== undefined ? parseFloat(val).toFixed(decimals) : "—";

const REVIEW_CONFIG = {
  PENDING:  { label: "Pending Review",  color: "amber",   Icon: Clock          },
  APPROVED: { label: "Approved",        color: "emerald", Icon: CheckCircle    },
  REJECTED: { label: "Rejected",        color: "red",     Icon: AlertTriangle  },
};

const CONTAMINATION_CONFIG = {
  SAFE:        { label: "Safe",        color: "emerald", Icon: CheckCircle   },
  CONTAMINATED:{ label: "Contaminated",color: "red",     Icon: AlertTriangle },
};

const colorClass = {
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-400"   },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  red:     { bg: "bg-red-500/10",     border: "border-red-500/20",     text: "text-red-400"     },
};

function StatusBadge({ status, configMap }) {
  const cfg  = configMap[status] ?? { label: status, color: "amber", Icon: Info };
  const cls  = colorClass[cfg.color];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cls.bg} ${cls.border} ${cls.text}`}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

/* ─── heavy-metal mini-bar ──────────────────────────────────── */
function MetalReadings({ readings }) {
  if (!readings?.length) return null;
  const safe  = readings.filter(r => r.finalStatus === "SAFE").length;
  const total = readings.length;
  const pct   = Math.round((safe / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
          Heavy Metal Readings
        </span>
        <span className={`text-[10px] font-bold ${pct === 100 ? "text-emerald-400" : "text-red-400"}`}>
          {safe}/{total} safe
        </span>
      </div>
      <div className="flex gap-1">
        {readings.map((r, i) => (
          <div
            key={i}
            title={`Reading ${i + 1}: ${r.finalStatus}`}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              r.finalStatus === "SAFE" ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
        ))}
      </div>
      {/* progress label */}
      <div className="w-full bg-gray-800 rounded-full h-0.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── single meta field ─────────────────────────────────────── */
function MetaField({ icon, label, value, mono, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-gray-500">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
      </div>
      {children ?? (
        <p className={`text-sm font-medium leading-relaxed break-all ${
          mono ? "font-mono text-xs text-emerald-300" : "text-gray-100"
        }`}>
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}

/* ─── main component ────────────────────────────────────────── */
function CommentSection({ commentSectionView, setCommentSectionView }) {
  const { sample } = commentSectionView;
  const { currentUser } = useSelector((state) => state.auth);

  const COMMENT_ROLES = [
    "SUPER_ADMIN","HEAD_RESEARCHER","SUPERVISOR",
    "POLICY_MAKER_SON","POLICY_MAKER_NAFDAC",
    "POLICY_MAKER_RESOLVE","POLICY_MAKER_UNIVERSITY",
  ];
  const canComment = COMMENT_ROLES.includes(currentUser?.role);

  const [fetchedComments, setFetchedComments]   = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [writtenComment, setWrittenComment]     = useState("");
  const [isFocused, setIsFocused]               = useState(false);
  const [submitting, setSubmitting]             = useState(false);

  /* ── fetch ── */
  const fetchComments = async () => {
    setLoading(true);
    try {
      const result = await api.get(`/samples/${sample.id}/comments`);
      setFetchedComments(result.data.data);
    } catch {
      toast.error("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, []);

  /* ── submit ── */
  const handleSubmitComment = async () => {
    if (!writtenComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/samples/${sample.id}/comments`, { commentText: writtenComment });
      setWrittenComment("");
      toast.success("Comment posted successfully.");
      await fetchComments();
    } catch {
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── derived ── */
  const locationStr = sample?.lga?.name
    ? `${sample.lga.name}, ${sample?.state?.name}`
    : sample?.state?.name;

  const reviewCfg       = REVIEW_CONFIG[sample?.review?.status]       ?? REVIEW_CONFIG.PENDING;
  const contaminCfg     = CONTAMINATION_CONFIG[sample?.contaminationStatus] ?? CONTAMINATION_CONFIG.SAFE;

  return (
    <>
      {/* Toast provider — place once near root; safe to put here for isolation */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#f3f4f6",
            border: "1px solid rgba(255,255,255,0.07)",
            fontSize: "13px",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#111827" } },
          error:   { iconTheme: { primary: "#f87171", secondary: "#111827" } },
        }}
      />

      <div className="min-h-screen bg-[#080c12] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── top nav ── */}
        <div className="sticky top-0 z-20 bg-[#080c12]/80 backdrop-blur-xl border-b border-white/[0.05]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
            <button
              onClick={() => setCommentSectionView({ isOpen: false, sample: null })}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Back to Samples</span>
            </button>

            <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />
            <span className="text-[11px] text-gray-500 font-mono hidden sm:block truncate">
              {sample.sampleId?.slice(0, 8)}…
            </span>

            <div className="ml-auto flex items-center gap-2">
              <StatusBadge status={sample?.review?.status} configMap={REVIEW_CONFIG} />
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-7 space-y-4">

          {/* ════════════════════════════════════════════════
              SAMPLE IDENTITY CARD
          ════════════════════════════════════════════════ */}
          <div className="rounded-2xl bg-[#0e1420] border border-white/[0.06] overflow-hidden">

            {/* card header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Beaker className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Sample Overview</h2>
              </div>
              <StatusBadge status={sample?.contaminationStatus} configMap={CONTAMINATION_CONFIG} />
            </div>

            {/* product hero row */}
            <div className="px-5 pt-5 pb-4 flex flex-col sm:flex-row sm:items-start gap-4 border-b border-white/[0.05]">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/15 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white leading-tight">{sample.productName ?? "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sample.productVariant?.displayName ?? "—"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/15 text-purple-300">
                    {sample.marketType ?? "—"}
                  </span>
                  {sample.marketName && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-400 capitalize">
                      {sample.marketName}
                    </span>
                  )}
                </div>
              </div>
              {/* price */}
              <div className="sm:text-right flex-shrink-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Price</p>
                <p className="text-sm font-semibold text-gray-200">
                  {sample.price !== null && sample.price !== undefined ? `₦${sample.price}` : "—"}
                </p>
              </div>
            </div>

            {/* fields grid */}
            <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-5">
              <MetaField
                icon={<Hash className="w-3.5 h-3.5" />}
                label="Sample ID"
                value={sample.sampleId}
                mono
              />
              <MetaField
                icon={<Tag className="w-3.5 h-3.5" />}
                label="Code"
                value={sample.code}
                mono
              />
              <MetaField
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="Location"
                value={locationStr}
              />
              <MetaField
                icon={<Calendar className="w-3.5 h-3.5" />}
                label="Collected"
                value={sample.createdAt
                  ? new Date(sample.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : "—"}
              />
              <MetaField
                icon={<MapPin className="w-3.5 h-3.5" />}
                label="GPS Coordinates"
                value={
                  sample.gpsLatitude && sample.gpsLongitude
                    ? `${fmt(sample.gpsLatitude)}, ${fmt(sample.gpsLongitude)}`
                    : "—"
                }
                mono
              />
              <MetaField
                icon={<ShoppingBag className="w-3.5 h-3.5" />}
                label="Lead Level"
                value={sample.leadLevel !== null && sample.leadLevel !== undefined
                  ? `${sample.leadLevel} µg/dL`
                  : "—"}
                mono
              />

              {/* heavy metals — spans full width */}
              <div className="col-span-2">
                <MetalReadings readings={sample.heavyMetalReadings} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0e1420] border border-white/[0.06] overflow-hidden">

            {/* card header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Comments & Remarks</h2>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {fetchedComments.length} {fetchedComments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            {/* list */}
            <div className="px-5 py-4 min-h-[200px] max-h-[400px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader className="w-5 h-5 text-emerald-400 animate-spin" />
                  <p className="text-xs text-gray-500">Loading comments…</p>
                </div>
              )}

              {!loading && fetchedComments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No comments yet</p>
                  <p className="text-xs text-gray-600">Be the first to leave a remark</p>
                </div>
              )}

              {!loading && fetchedComments.length > 0 && (
                <div className="space-y-2 py-1">
                  {fetchedComments.map((comment) => (
                    <Comments
                      key={comment.id}
                      comment={comment}
                      fetchComments={fetchComments}
                      /* pass toast so Comments can call toast.success/error for delete */
                      toast={toast}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* compose */}
            <div className="px-5 pb-5 pt-3 border-t border-white/[0.05]">
              {!canComment ? (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <Lock className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300/70 leading-relaxed">
                    Only supervisors, researchers, and policy makers can add comments.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    Add Remark
                  </label>
                  <div
                    className={`flex items-end gap-2 rounded-xl border transition-colors bg-gray-800/40 px-3 py-2 ${
                      isFocused ? "border-emerald-500/40" : "border-white/[0.06] hover:border-white/10"
                    }`}
                  >
                    <textarea
                      rows={2}
                      placeholder="Write your comment or remark…"
                      className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 resize-none outline-none leading-relaxed"
                      value={writtenComment}
                      onChange={(e) => setWrittenComment(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && writtenComment.trim()) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!writtenComment.trim() || submitting}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 text-white shadow-lg shadow-emerald-500/20 disabled:shadow-none"
                    >
                      {submitting
                        ? <Loader className="w-3.5 h-3.5 animate-spin" />
                        : <Send className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600">Press Enter to submit · Shift+Enter for new line</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default CommentSection;