import React from 'react';
import './Badge.css';

export default function Badge({
  children,
  variant = 'default',
  stamp = false,
  rotate = 0,
  size = 'md',
  className = ''
}) {
  const stampStyle = stamp
    ? { transform: `rotate(${rotate !== 0 ? rotate : -3}deg)` }
    : {};

  return (
    <span
      className={`wire-badge wire-badge--${variant} wire-badge--${size} ${
        stamp ? 'wire-badge--stamp' : ''
      } ${className}`}
      style={stampStyle}
    >
      <span className="wire-badge__dot" />
      <span className="wire-badge__text">{children}</span>
    </span>
  );
}
