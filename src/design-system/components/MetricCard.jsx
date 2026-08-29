import React from "react";
import Surface from "./Surface";

const MetricCard = ({
  label,
  value,
  description,
  icon: Icon,
  tone = "brand",
  trend,
  onClick,
}) => {
  const content = (
    <>
      <div className="leadcap-metric__top">
        <span className="leadcap-metric__label">{label}</span>
        {Icon && (
          <span className={`leadcap-metric__icon leadcap-metric__icon--${tone}`}>
            <Icon size={19} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="leadcap-metric__value">{value}</div>

      {(description || trend) && (
        <div className="leadcap-metric__footer">
          {description && <span>{description}</span>}
          {trend && <span className="leadcap-metric__trend">{trend}</span>}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <Surface as="button" padding="md" interactive className="leadcap-metric" onClick={onClick}>
        {content}
      </Surface>
    );
  }

  return (
    <Surface padding="md" className="leadcap-metric">
      {content}
    </Surface>
  );
};

export default MetricCard;
