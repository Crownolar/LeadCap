import React from "react";

const Surface = ({
  as: Component = "div",
  children,
  className = "",
  padding = "md",
  interactive = false,
  ...props
}) => {
  const paddingClass = {
    none: "",
    sm: "leadcap-surface--sm",
    md: "leadcap-surface--md",
    lg: "leadcap-surface--lg",
  }[padding];

  return (
    <Component
      className={[
        "leadcap-surface",
        paddingClass,
        interactive ? "leadcap-surface--interactive" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Surface;
