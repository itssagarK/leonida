import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import './LandingScreen.css';

export default function LandingScreen() {
  const navigate = useNavigate();

  const handleOpenCase = () => {
    navigate('/cases');
  };

  return (
    <div className="wire-landing wire-page-container">
      {/* Editorial Hero Section */}
      <section className="wire-landing__hero" aria-label="Hero Masthead">
        <div className="wire-landing__masthead-tag">
          CONFIDENTIAL EVIDENCE DESPATCH // BUREAU ARCHIVE
        </div>

        <h1 className="wire-landing__title">
          THE LEONIDA WIRE
        </h1>

        <p className="wire-landing__subtitle">
          UNOFFICIAL PRESS &amp; EVIDENTIARY DESPATCH
        </p>

        <div className="wire-landing__epigraph-box">
          <blockquote className="wire-landing__quote">
            “Every image tells a story.<br />
            Every edit changes what survives.”
          </blockquote>
          <p className="wire-landing__lead-summary">
            Track the forensic distortion of photographic evidence as it travels through 
            anonymous witnesses and midnight tabloids. Use the embedded React Image Editor 
            to file your own link in the chain and expose the drift.
          </p>
        </div>

        <div className="wire-landing__cta-wrap">
          <Button
            variant="primary"
            size="lg"
            onClick={handleOpenCase}
            icon={<span className="wire-cta-arrow">→</span>}
          >
            OPEN CASE FILE
          </Button>
        </div>
      </section>

      {/* 3 Compact Information Blocks */}
      <section className="wire-landing__triptych" aria-label="Evidentiary Protocol">
        <div className="wire-landing__card">
          <div className="wire-landing__card-num">01 / RECEIVE</div>
          <h3 className="wire-landing__card-title">Raw Photographic Evidence</h3>
          <p className="wire-landing__card-desc">
            Examine uncompromised field photographs captured at the original scene before public alteration.
          </p>
        </div>

        <div className="wire-landing__card wire-landing__card--highlight">
          <div className="wire-landing__card-num">02 / ALTER</div>
          <h3 className="wire-landing__card-title">Manipulate via React Image Editor</h3>
          <p className="wire-landing__card-desc">
            Deploy the full-suite editor—crop, filter, draw, text, and frame—to advance or refute the witness narrative.
          </p>
        </div>

        <div className="wire-landing__card">
          <div className="wire-landing__card-num">03 / REVEAL</div>
          <h3 className="wire-landing__card-title">Compare Narrative with Record</h3>
          <p className="wire-landing__card-desc">
            Measure cumulative evidentiary drift side-by-side and export a certified forensic wire dossier.
          </p>
        </div>
      </section>

      {/* Terminal System Status Footer */}
      <footer className="wire-landing__status-footer">
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-dot wire-landing__status-dot--green" />
          <span className="wire-landing__status-label">SYSTEM STATUS:</span>
          <span className="wire-landing__status-val">ONLINE</span>
        </div>
        <div className="wire-landing__status-sep">■</div>
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-dot wire-landing__status-dot--amber" />
          <span className="wire-landing__status-label">CASE ARCHIVE:</span>
          <span className="wire-landing__status-val">AVAILABLE</span>
        </div>
        <div className="wire-landing__status-sep">■</div>
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-dot wire-landing__status-dot--cyan" />
          <span className="wire-landing__status-label">EVIDENCE ENGINE:</span>
          <span className="wire-landing__status-val">READY</span>
        </div>
      </footer>
    </div>
  );
}
