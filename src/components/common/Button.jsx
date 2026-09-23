import React from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  icon = null,
  ...props
}) {
  return (
    <button
      type={type}
      className={`wire-button wire-button--${variant} wire-button--${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="wire-button__icon">{icon}</span>}
      <span className="wire-button__text">{children}</span>
    </button>
  );
}
