import React from 'react';
import './TickerHeader.css';

export default function TickerHeader({
  items = [
    'LEONIDA WIRE DESPATCH #8812',
    'VICE COUNTY BUREAU',
    'CONFIDENTIAL WIRE FEED',
    'WITNESS DRIFT DETECTED',
    'PORT GELLHORN FREQUENCY JAMMED',
    'AUTHENTICITY CHAIN COMPROMISED',
    'CITIZEN EDITS PENDING REVIEW'
  ],
  label = 'WIRE FEED'
}) {
  // Duplicate items for continuous seamless marquee scroll
  const displayItems = [...items, ...items];

  return (
    <div className="wire-ticker">
      <div className="wire-ticker__badge">
        <span className="wire-ticker__rec-dot" />
        <span className="wire-ticker__label">{label}</span>
      </div>
      <div className="wire-ticker__track-wrapper">
        <div className="wire-ticker__track">
          {displayItems.map((item, index) => (
            <span key={index} className="wire-ticker__item">
              <span className="wire-ticker__bullet">■</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
