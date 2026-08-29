import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className = "",
  type = "button",
  disabled,
  ...props
}) => {
  const classes = [
    "leadcap-btn",
    `leadcap-btn--${variant}`,
    `leadcap-btn--${size}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {Icon && <Icon className="leadcap-btn__icon" aria-hidden="true" />}
      {loading ? "Working…" : children}
    </button>
  );
};

export default Button;
