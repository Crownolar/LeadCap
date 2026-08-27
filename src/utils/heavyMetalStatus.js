export const normalizeRole = (role) => {
  if (!role) return "";
  return role.toLowerCase().replace(/[\s_.-]/g, "");
};

export const normalizeHeavyMetalStatus = (status) => {
  const normalized = status?.toUpperCase();

  if (normalized === "PASS" || normalized === "SAFE") return "PASS";

  if (
    normalized === "FAIL" ||
    normalized === "FAILED" ||
    normalized === "CONTAMINATED" ||
    normalized === "MODERATE"
  ) {
    return "FAIL";
  }

  if (normalized === "NOT_TESTED") return "NOT_TESTED";
  if (normalized === "INCONCLUSIVE") return "INCONCLUSIVE";

  return "PENDING";
};

export const getHeavyMetalPublicStatus = (sample) => {
  if (sample?.heavyMetalSummary?.status) {
    return normalizeHeavyMetalStatus(sample.heavyMetalSummary.status);
  }

  if (sample?.heavyMetalResult?.status) {
    return normalizeHeavyMetalStatus(sample.heavyMetalResult.status);
  }

  const readings = sample?.heavyMetalReadings || [];

  if (!readings.length) return "PENDING";

  const statuses = readings.map((reading) =>
    normalizeHeavyMetalStatus(
      reading.finalStatus || reading.aasStatus || reading.xrfStatus || reading.status,
    ),
  );

  if (statuses.includes("FAIL")) return "FAIL";
  if (statuses.includes("INCONCLUSIVE")) return "INCONCLUSIVE";
  if (statuses.every((status) => status === "PASS")) return "PASS";

  return "PENDING";
};

export const canViewHeavyMetalPpm = (currentUser, sample) => {
  if (sample?.heavyMetalSummary?.canViewPpm === true) return true;
  if (sample?.heavyMetalResult?.canViewPpm === true) return true;

  const permissions =
    currentUser?.permissions ||
    currentUser?.rolePermissions ||
    currentUser?.accessPermissions ||
    [];

  if (permissions.includes("VIEW_HEAVY_METAL_PPM")) return true;

  const role = normalizeRole(currentUser?.role);

  return ["superadmin", "headresearcher", "labanalyst"].includes(role);
};

export const getRestrictedHeavyMetalMessage = (sample) => {
  return (
    sample?.heavyMetalSummary?.restrictedMessage ||
    sample?.heavyMetalResult?.restrictedMessage ||
    "Detailed heavy metal readings are restricted to authorized personnel."
  );
};

export const toPublicBreakdown = (breakdown = {}) => {
  const pass = Number(breakdown.PASS ?? breakdown.SAFE ?? 0);

  const fail =
    Number(breakdown.FAIL ?? 0) +
    Number(breakdown.MODERATE ?? 0) +
    Number(breakdown.CONTAMINATED ?? 0);

  const pending = Number(breakdown.PENDING ?? 0);
  const inconclusive = Number(breakdown.INCONCLUSIVE ?? 0);
  const notTested = Number(breakdown.NOT_TESTED ?? 0);

  return {
    PASS: pass,
    FAIL: fail,
    PENDING: pending,
    INCONCLUSIVE: inconclusive,
    NOT_TESTED: notTested,
  };
};