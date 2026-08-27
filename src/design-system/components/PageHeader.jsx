import React from "react";

const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  children,
}) => (
  <header className="leadcap-page-header">
    <div className="leadcap-page-header__copy">
      {eyebrow && <div className="leadcap-page-header__eyebrow">{eyebrow}</div>}
      <h1 className="leadcap-page-header__title">{title}</h1>
      {description && (
        <p className="leadcap-page-header__description">{description}</p>
      )}
      {children}
    </div>

    {actions && <div className="leadcap-page-header__actions">{actions}</div>}
  </header>
);

export default PageHeader;
