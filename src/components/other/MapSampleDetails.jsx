import { MapPin, Building2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const STATUS_STYLES = {
  CONTAMINATED: {
    bar: "bg-red-700 border-b-2 border-red-400",
    text: "text-red-100",
    dot: "bg-red-300",
    id: "text-red-200/70",
  },
  SAFE: {
    bar: "bg-emerald-700 border-b-2 border-emerald-400",
    text: "text-emerald-100",
    dot: "bg-emerald-300",
    id: "text-emerald-200/70",
  },
  MODERATE: {
    bar: "bg-amber-700 border-b-2 border-amber-400",
    text: "text-amber-100",
    dot: "bg-amber-300",
    id: "text-amber-200/70",
  },
  PENDING: {
    bar: "bg-sky-700 border-b-2 border-sky-400",
    text: "text-sky-100",
    dot: "bg-sky-300",
    id: "text-sky-200/70",
  },
};

const getStatus = (level) => STATUS_STYLES[level] || STATUS_STYLES.PENDING;

export default function MapSampleDetails({ samples, setCommentSectionView }) {
  const { theme } = useTheme();

  const Label = ({ children }) => (
    <span className={`block text-[9px] uppercase tracking-[0.1em] mb-0.5 font-mono ${theme.textMuted}`}>
      {children}
    </span>
  );

  const Value = ({ children }) => (
    <span className={`block text-[12px] font-medium truncate ${theme.text}`}>
      {children}
    </span>
  );

  return (
    <div className={`p-4 grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${theme.bg}`}>
      {samples.map((s) => {
        const st = getStatus(s.status);

        return (
          <div
            key={s.id}
            className={`rounded-xl overflow-hidden border ${theme.border} ${theme.card}`}
          >
            {/* Status bar */}
            <div className={`flex items-center justify-between px-3.5 py-2 ${st.bar}`}>
              <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] font-medium font-mono ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${st.dot}`} />
                {s.status || "PENDING"}
              </span>
              <span className={`text-[10px] font-mono ${st.id}`}>
                {s.code}
              </span>
            </div>

            <div className="p-3.5">
              {/* Product name */}
              <p className={`text-[14px] font-semibold mb-2 truncate ${theme.text}`}>
                {s.productName}
              </p>

              {/* Pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(s.productVariant?.displayName || s.productVariant?.name) && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded font-mono ${theme.info}`}>
                    {s.productVariant?.displayName || s.productVariant?.name}
                  </span>
                )}
                {s.isRegistered && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded font-mono ${theme.emerald}`}>
                    Registered
                  </span>
                )}
                {s.productOrigin === "IMPORTED" && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded font-mono ${theme.moderate}`}>
                    Imported
                  </span>
                )}
              </div>

              <hr className={`border-t ${theme.border} my-2.5`} />

              {/* Location rows */}
              <div className="flex items-start gap-2 mb-2">
                <MapPin size={14} className={`flex-shrink-0 mt-0.5 ${theme.emeraldText}`} />
                <div className="min-w-0 flex-1">
                  <Label>Market</Label>
                  <Value>{s.market?.name || "N/A"}</Value>
                </div>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <Building2 size={14} className={`flex-shrink-0 mt-0.5 ${theme.emeraldText}`} />
                <div className="min-w-0 flex-1">
                  <Label>Location</Label>
                  <Value>
                    {s.lga?.name || "N/A"}, {s.state?.name || "N/A"}
                  </Value>
                </div>
              </div>

              {/* Info grid */}
              <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-lg mb-3 border ${theme.border} ${theme.bg}`}>
                <div>
                  <Label>Vendor type</Label>
                  <Value>{s.vendorType?.replace(/_/g, " ") || "N/A"}</Value>
                </div>
                <div>
                  <Label>Price</Label>
                  <Value>
                    ₦{typeof s.price === "number" ? s.price.toLocaleString() : s.price}
                  </Value>
                </div>
                {s.brandName && (
                  <div>
                    <Label>Brand</Label>
                    <Value>{s.brandName}</Value>
                  </div>
                )}
                {s.batchNumber && (
                  <div>
                    <Label>Batch</Label>
                    <Value>{s.batchNumber}</Value>
                  </div>
                )}
              </div>

              {/* Date */}
              <p className={`text-[11px] pb-3 mb-3 font-mono border-b ${theme.border} ${theme.textMuted}`}>
                Collected{" "}
                <span className={theme.text}>
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </p>

              {/* Verification block */}
              {s.verificationStatus && s.verificationStatus !== "UNVERIFIED" && (
                <div
                  className={`rounded-lg p-2.5 mb-3 border-l-2 ${
                    s.verificationStatus === "VERIFIED_ORIGINAL"
                      ? `${theme.safe} border-emerald-500`
                      : `${theme.danger} border-red-500`
                  }`}
                >
                  <p className={`text-[9px] uppercase tracking-[0.1em] mb-1 font-mono ${theme.textMuted}`}>
                    Verification status
                  </p>
                  <p className={`text-[12px] font-semibold ${
                    s.verificationStatus === "VERIFIED_ORIGINAL"
                      ? theme.safeText
                      : theme.dangerText
                  }`}>
                    {s.verificationStatus === "VERIFIED_ORIGINAL"
                      ? "✓ Original product"
                      : "✗ Counterfeit detected"}
                  </p>
                  {s.nafdacNumber && (
                    <p className={`text-[10px] mt-1 truncate font-mono ${theme.textMuted}`}>
                      NAFDAC: {s.nafdacNumber}
                    </p>
                  )}
                  {s.sonNumber && (
                    <p className={`text-[10px] truncate font-mono ${theme.textMuted}`}>
                      SON: {s.sonNumber}
                    </p>
                  )}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => setCommentSectionView({ isOpen: true, sample: s })}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium transition-colors border ${theme.border} ${theme.card} ${theme.hover} ${theme.emeraldText}`}
              >
                <span className="text-[13px]">💬</span> View comments
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}