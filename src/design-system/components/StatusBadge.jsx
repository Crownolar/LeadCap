import React from "react";
import Badge from "./Badge";

const LABELS = {
  safe: "Safe",
  warning: "Warning",
  danger: "Danger",
  pending: "Pending",
  review: "Under Review",
  verified: "Verified",
  rejected: "Rejected",
  pass: "Pass",
  fail: "Fail",
  inconclusive: "Inconclusive",
  "not-tested": "Not Tested",
};

const StatusBadge = ({ status, label, dot = true }) => {
  const normalized = String(status || "pending").toLowerCase();
  const tone = normalized;

  return (
    <Badge tone={tone} dot={dot}>
      {label || LABELS[normalized] || status}
    </Badge>
  );
};

export default StatusBadge;
