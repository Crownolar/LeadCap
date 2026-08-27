export function StatusBadge({ status }) {
  const normalized = status?.toUpperCase();

  if (["VERIFIED", "VERIFIED_ORIGINAL"].includes(normalized)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        Verified
      </span>
    );
  }

  if (["VERIFIED_FAKE", "FAILED"].includes(normalized)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
        Failed
      </span>
    );
  }

  if (["UNVERIFIED", "PENDING"].includes(normalized)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-yellow-200">
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
      {status || "Unknown"}
    </span>
  );
}