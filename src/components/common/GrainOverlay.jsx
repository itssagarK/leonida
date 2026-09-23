import React from 'react';
import './GrainOverlay.css';

export default function GrainOverlay() {
  return (
    <div className="wire-grain-overlay" aria-hidden="true">
      <div className="wire-grain-overlay__noise" />
      <div className="wire-grain-overlay__scanlines" />
    </div>
  );
}
