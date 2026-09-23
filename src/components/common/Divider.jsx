import React from 'react';
import './Divider.css';

export default function Divider({
  variant = 'solid', // 'solid', 'double', 'dashed', 'evidence'
  label = null,
  spacing = 'md',
  className = ''
}) {
  return (
    <div
      className={`wire-divider wire-divider--${variant} wire-divider--space-${spacing} ${
        label ? 'wire-divider--with-label' : ''
      } ${className}`}
    >
      <div className="wire-divider__line" />
      {label && <span className="wire-divider__label">{label}</span>}
      {label && <div className="wire-divider__line" />}
    </div>
  );
}
