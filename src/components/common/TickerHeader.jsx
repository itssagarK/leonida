import React from 'react';
import './TickerHeader.css';

export default function TickerHeader({
  items = [
    'WEAZEL NEWS // VICE CITY METRO BREAKING',
    'LEONIDA STATE INVESTIGATIVE BUREAU (LSIB) ACTIVE BULLETIN',
    'VICE BEACH POLICE DEPT: 3-STAR WANTED BULLETIN FOR HARBOR RUNNER',
    'K-JAH WEST 89.1 // AMBROSIA HIGHWAY SURVEILLANCE ONLINE',
    'PORT GELLHORN FREQUENCY: SUBMERSIBLE VEHICLE RECONNAISSANCE ACTIVE',
    'FLASH FM 94.2: VICE SHORE WATERWAYS UNDER 24HR LSIB RADAR',
    'AUTHENTICITY CHAIN COMPROMISED // CUSTODY DRIFT LEVEL 4'
  ],
  label = 'LSIB WIRE TICKER'
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
