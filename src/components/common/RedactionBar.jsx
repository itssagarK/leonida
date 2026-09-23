import React, { useState } from 'react';
import './RedactionBar.css';

export default function RedactionBar({
  children,
  width = 'auto',
  height = 'auto',
  revealsOnHover = false,
  classified = false,
  className = ''
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!children) {
    return (
      <span
        className={`wire-redaction-bar wire-redaction-bar--solid ${className}`}
        style={{ width: width !== 'auto' ? width : '100px', height: height !== 'auto' ? height : '14px' }}
        title="[CLASSIFIED REDACTION]"
      />
    );
  }

  return (
    <span
      className={`wire-redaction-bar ${
        revealsOnHover ? 'wire-redaction-bar--interactive' : ''
      } ${isRevealed ? 'is-revealed' : ''} ${className}`}
      onMouseEnter={() => revealsOnHover && setIsRevealed(true)}
      onMouseLeave={() => revealsOnHover && setIsRevealed(false)}
      onClick={() => revealsOnHover && setIsRevealed(!isRevealed)}
      title={revealsOnHover ? 'Classified: click or hover to un-redact' : '[REDACTED]'}
    >
      <span className="wire-redaction-bar__content">{children}</span>
      {classified && !isRevealed && (
        <span className="wire-redaction-bar__tag">[CENSORED]</span>
      )}
    </span>
  );
}
