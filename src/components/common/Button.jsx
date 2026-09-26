import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.button
      type={type}
      className={`wire-button wire-button--${variant} wire-button--${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.98, y: 1 } : undefined}
      transition={{ duration: 0.12 }}
      {...props}
    >
      {icon && <span className="wire-button__icon">{icon}</span>}
      <span className="wire-button__text">{children}</span>
    </motion.button>
  );
}
