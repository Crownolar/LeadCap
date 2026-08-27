import React from "react";

const SectionHeader = ({ title, description, action }) => (
  <div className="leadcap-section-header">
    <div>
      <h2 className="leadcap-section-header__title">{title}</h2>
      {description && (
        <p className="leadcap-section-header__description">{description}</p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default SectionHeader;
