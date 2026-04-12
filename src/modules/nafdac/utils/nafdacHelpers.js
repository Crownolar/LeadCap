export const getContaminationStatus = (sample) => {
  if (!sample) return "pending";

  if (sample.contaminationStatus) {
    return String(sample.contaminationStatus).toLowerCase();
  }

  if (sample.labStatus && String(sample.labStatus).toLowerCase() !== "completed") {
    return "pending";
  }

  if (typeof sample.leadLevel === "number") {
    if (sample.leadLevel > 90) return "contaminated";
    if (sample.leadLevel > 0) return "moderate";
    return "safe";
  }

  if (Array.isArray(sample.heavyMetalReadings) && sample.heavyMetalReadings.length > 0) {
    const maxValue = Math.max(
      ...sample.heavyMetalReadings
        .map((item) => Number(item?.value ?? item?.reading ?? 0))
        .filter((v) => !Number.isNaN(v))
    );

    if (maxValue > 90) return "contaminated";
    if (maxValue > 0) return "moderate";
    return "safe";
  }

  return "pending";
};

export const normalizeVerificationStatus = (sample) => {
  const raw =
    sample?.verificationStatus ||
    sample?.verification?.status ||
    sample?.registryStatus ||
    sample?.nafdacVerificationStatus ||
    "";

  return String(raw).toUpperCase();
};

export const isVerifiedMatch = (sample) => {
  const status = normalizeVerificationStatus(sample);
  return status === "VERIFIED_ORIGINAL" || status === "MATCHED" || status === "VERIFIED";
};

export const isFlaggedRecord = (sample) => {
  const status = normalizeVerificationStatus(sample);
  const contamination = getContaminationStatus(sample);

  return (
    status === "VERIFIED_FAKE" ||
    status === "MISMATCH" ||
    status === "FLAGGED" ||
    contamination === "contaminated"
  );
};

export const isPendingReview = (sample) => {
  const status = normalizeVerificationStatus(sample);
  return (
    !status ||
    status === "UNVERIFIED" ||
    status === "VERIFICATION_PENDING" ||
    status === "PENDING"
  );
};

export const isRegisteredProduct = (sample) => {
  return Boolean(
    sample?.isRegistered ||
      sample?.registrationNumber ||
      sample?.nafdacNumber ||
      sample?.nafdacNo ||
      isVerifiedMatch(sample)
  );
};

export const aggregateRegistryTrend = (samples = [], months = 6) => {
  const now = new Date();
  const monthMap = new Map();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthMap.set(key, {
      month: d.toLocaleString("default", { month: "short" }),
      registered: 0,
      verified: 0,
      flagged: 0,
      pending: 0,
    });
  }

  samples.forEach((sample) => {
    const dateValue = sample?.createdAt || sample?.updatedAt;
    if (!dateValue) return;

    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthMap.has(key)) return;

    const row = monthMap.get(key);

    if (isRegisteredProduct(sample)) row.registered += 1;
    if (isVerifiedMatch(sample)) row.verified += 1;
    if (isFlaggedRecord(sample)) row.flagged += 1;
    if (isPendingReview(sample)) row.pending += 1;
  });

  return Array.from(monthMap.values());
};

export const deriveVerificationSummary = (samples = []) => {
  const summary = {
    matched: 0,
    flagged: 0,
    pending: 0,
  };

  samples.forEach((sample) => {
    if (isVerifiedMatch(sample)) summary.matched += 1;
    else if (isFlaggedRecord(sample)) summary.flagged += 1;
    else if (isPendingReview(sample)) summary.pending += 1;
  });

  return [
    { name: "Matched", value: summary.matched },
    { name: "Flagged", value: summary.flagged },
    { name: "Pending", value: summary.pending },
  ];
};

export const deriveRiskCategories = (samples = []) => {
  const grouped = samples.reduce((acc, sample) => {
    const productType =
      sample?.productVariant?.category?.name ||
      sample?.productVariant?.displayName ||
      sample?.productVariant?.name ||
      "Unknown";

    if (!acc[productType]) {
      acc[productType] = {
        category: productType,
        total: 0,
        flagged: 0,
      };
    }

    acc[productType].total += 1;
    if (isFlaggedRecord(sample)) acc[productType].flagged += 1;

    return acc;
  }, {});

  return Object.values(grouped)
    .map((item) => ({
      ...item,
      flaggedRate: item.total ? (item.flagged / item.total) * 100 : 0,
      riskLevel:
        item.total && item.flagged / item.total >= 0.35
          ? "High"
          : item.total && item.flagged / item.total >= 0.15
          ? "Medium"
          : "Low",
    }))
    .sort((a, b) => b.flaggedRate - a.flaggedRate)
    .slice(0, 6);
};

export const deriveFlaggedProducts = (samples = []) => {
  return samples
    .filter((sample) => isFlaggedRecord(sample))
    .map((sample) => ({
      id: sample?.id,
      productName:
        sample?.productName ||
        sample?.productVariant?.displayName ||
        sample?.productVariant?.name ||
        "Unknown Product",
      brandName: sample?.brandName || "Unknown Brand",
      state: sample?.state?.name || "Unknown",
      status: normalizeVerificationStatus(sample) || "FLAGGED",
      contaminationStatus: getContaminationStatus(sample),
      createdAt: sample?.createdAt,
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8);
};