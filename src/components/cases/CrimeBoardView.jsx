import React from 'react';
import './CrimeBoardView.css';
import { getAbsoluteImageUrl } from '../../utils/imageHelpers';

export default function CrimeBoardView({ cases, onSelectCase }) {
  return (
    <div className="wire-crime-board">
      {/* SVG Yarn Connections */}
      <svg className="wire-crime-board__svg-lines" viewBox="0 0 1000 500" preserveAspectRatio="none">
        <path
          d="M 280 180 Q 500 280 720 190"
          stroke="#FF2A6D"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="4 2"
          opacity="0.8"
        />
        <path
          d="M 280 180 Q 480 80 720 190"
          stroke="#6442EF"
          strokeWidth="2"
          fill="none"
          strokeDasharray="6 3"
          opacity="0.6"
        />
      </svg>

      <div className="wire-crime-board__grid">
        {cases.map((c, index) => {
          const pushpinColor = index % 2 === 0 ? 'coral' : 'purple';
          const stickyNote =
            index === 0
              ? 'WITNESS #1 ignored tow-truck winch cable. Claimed submerged rudder.'
              : 'Swamp floodlights mistaken for off-world anti-gravity propulsion ring.';

          return (
            <div
              key={c.id}
              className="wire-pinboard-item"
              onClick={() => onSelectCase(c.id)}
            >
              <div className={`wire-pinboard-pushpin wire-pinboard-pushpin--${pushpinColor}`} />

              <div className="wire-pinboard-photo-wrap">
                <img
                  src={getAbsoluteImageUrl(c.originalImage)}
                  alt={c.title}
                  className="wire-pinboard-photo"
                />
              </div>

              <div className="wire-pinboard-docket">
                <span>{c.caseNumber}</span>
                <span>{c.location}</span>
              </div>

              <h3 className="wire-pinboard-title">{c.title}</h3>
              <p className="wire-pinboard-snippet">{c.originalCaption}</p>

              <div className="wire-pinboard-sticky">
                📌 NOTE: "{stickyNote}"
              </div>

              <div className="wire-pinboard-badge-footer">
                <span className="wire-badge wire-badge--purple">{c.category}</span>
                <span className="wire-badge wire-badge--cyan">{c.chain?.length || 3} WITNESS LINKS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
