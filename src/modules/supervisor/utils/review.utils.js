import {
  REVIEW_STATUSES,
  STATUS_TAB_META,
} from "../constants/supervisor.constants";


export const normalizeReviewStatus = (status) => {
  if (!status) return REVIEW_STATUSES.PENDING_REVIEW;

  return status;
};


export const getReviewStatusLabel = (status) => {
  const normalized = normalizeReviewStatus(status);

  return (
    STATUS_TAB_META[normalized]?.label ||
    normalized.replace(/_/g, " ")
  );
};


export const formatReviewStatus = (status) => {
  if (!status) return "Pending Review";

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


export const getSampleReviewStatus = (sample) => {
  return (
    sample?.review?.status ||
    sample?.status ||
    REVIEW_STATUSES.PENDING_REVIEW
  );
};


export const formatNumber = (value) => {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat().format(value);
};


export const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};


export const getSampleLocation = (sample) => {
  const parts = [
    sample?.market?.name,
    sample?.lga?.name,
    sample?.state?.name,
  ].filter(Boolean);

  return parts.join(", ") || "Location unavailable";
};


export const getSampleCategory = (sample) => {
  return (
    sample?.productVariant?.category?.name ||
    "Uncategorized"
  );
};


export const getSampleVariant = (sample) => {
  return (
    sample?.productVariant?.displayName ||
    sample?.productVariant?.name ||
    "—"
  );
};