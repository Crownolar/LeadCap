export function StatusBadge({ status }) {
  if (status === "VERIFIED" || status === "verified")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        Verified
      </span>
    );
  if (status === "VERIFIED_FAKE" || status === "failed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
        Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-yellow-200">
      Pending
    </span>
  );
}