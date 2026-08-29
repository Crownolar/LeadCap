import React from "react";

const Badge = ({ children, tone = "neutral", dot = false, className = "" }) => (
  <span className={`leadcap-badge leadcap-badge--${tone} ${className}`.trim()}>
    {dot && <span className="leadcap-badge__dot" aria-hidden="true" />}
    {children}
  </span>
);

export default Badge;
