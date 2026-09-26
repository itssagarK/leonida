import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import SceneFallback from '../components/3d/SceneFallback';
import './LandingScreen.css';

// Lazy-load 3D Hero Evidence Desk
const HeroEvidenceDesk = lazy(() => import('../components/3d/HeroEvidenceDesk'));

export default function LandingScreen() {
  const navigate = useNavigate();

  const handleOpenCase = () => {
    navigate('/cases');
  };

  return (
    <motion.div
      className="wire-landing wire-page-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Editorial Folio / Dateline */}
      <div className="wire-landing__folio">
        <span className="wire-landing__folio-item">BUREAU ARCHIVE // DECLASSIFIED DIVISION</span>
        <span className="wire-landing__folio-sep">•</span>
        <span className="wire-landing__folio-item">VOL. LXXIV NO. 28,491</span>
        <span className="wire-landing__folio-sep">•</span>
        <span className="wire-landing__folio-item">LEONIDA NIGHT DESPATCH</span>
      </div>

      <div className="wire-landing__masthead-tag">
        CONFIDENTIAL EVIDENCE DESPATCH // BUREAU ARCHIVE
      </div>

      <h1 className="wire-landing__title">
        THE LEONIDA WIRE
      </h1>

      <p className="wire-landing__subtitle">
        UNOFFICIAL PRESS &amp; EVIDENTIARY DESPATCH
      </p>

      {/* Oxford Double-Rule */}
      <div className="wire-landing__double-rule" aria-hidden="true" />

      {/* 2-Column Hero Grid: Left Editorial Memo + Right 3D Evidence Desk */}
      <div className="wire-landing__hero-grid">
        {/* Left Column: Briefing & CTAs */}
        <div className="wire-landing__hero-left">
          <div className="wire-landing__epigraph-box">
            <div className="wire-landing__memo-bar">
              <span className="wire-landing__memo-title">MEMORANDUM // EVIDENTIARY PROTOCOL</span>
              <span className="wire-landing__memo-stamp">UNFILTERED RECORD</span>
            </div>

            <blockquote className="wire-landing__quote">
              “Every image tells a story.<br />
              Every edit changes what survives.”
            </blockquote>

            <p className="wire-landing__lead-summary">
              Track the forensic distortion of photographic evidence as it travels through 
              anonymous witnesses and midnight tabloids. Use the embedded <strong>React Image Editor</strong> to file your own link in the chain and expose the drift between fact and public folklore.
            </p>

            <div className="wire-landing__memo-meta">
              <span>CHAIN VOLATILITY: <strong>ACTIVE</strong></span>
              <span>CLEARANCE: <strong>RESTRICTED // LEVEL 4</strong></span>
              <span>ENGINE: <strong>REACT IMAGE EDITOR V1.0</strong></span>
            </div>
          </div>

          <div className="wire-landing__cta-wrap">
            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenCase}
              icon={<span className="wire-cta-arrow">→</span>}
            >
              OPEN CASE FILES
            </Button>
            <span className="wire-landing__cta-note">
              ACCESS UNRESTRICTED CRIME-SCENE DOSSIERS
            </span>
          </div>
        </div>

        {/* Right Column: 3D Physical Evidence Desk Scene */}
        <div className="wire-landing__hero-3d-box wire-corner-reticles">
          <Suspense fallback={<SceneFallback label="LOADING 3D EVIDENCE DESK..." />}>
            <HeroEvidenceDesk onSelectFolder={handleOpenCase} />
          </Suspense>
        </div>
      </div>

      {/* Connected Evidentiary Protocol Pipeline */}
      <section className="wire-landing__pipeline-section" aria-label="Evidentiary Protocol Pipeline">
        <div className="wire-landing__section-header">
          <span className="wire-landing__section-tag">INVESTIGATIVE WORKFLOW</span>
          <h2 className="wire-landing__section-title">THE EVIDENTIARY CHAIN OF CUSTODY</h2>
        </div>

        <div className="wire-landing__triptych">
          {/* Step 01 */}
          <div className="wire-landing__card wire-corner-reticles">
            <div className="wire-landing__card-badge">PHASE 01 // BASELINE</div>
            <div className="wire-landing__card-num">01 / RECEIVE</div>
            <h3 className="wire-landing__card-title">Raw Photographic Record</h3>
            <p className="wire-landing__card-desc">
              Inspect pristine crime-scene negative captures preserved before viral tabloid sensationalism and witness tampering.
            </p>
            <div className="wire-landing__card-foot">
              <span className="wire-landing__card-metric">DRIFT: 0.0% BASE</span>
            </div>
          </div>

          {/* Pipeline Connector */}
          <div className="wire-landing__pipeline-arrow" aria-hidden="true">
            <span>➔</span>
          </div>

          {/* Step 02 */}
          <div className="wire-landing__card wire-landing__card--highlight wire-corner-reticles">
            <div className="wire-landing__card-badge wire-landing__card-badge--amber">PHASE 02 // TOOLKIT</div>
            <div className="wire-landing__card-num">02 / ALTER</div>
            <h3 className="wire-landing__card-title">Manipulate via React Image Editor</h3>
            <p className="wire-landing__card-desc">
              Deploy the 8-tool forensic suite—crop, filter, draw, text, shapes, and frame—to craft and seal your own narrative claim.
            </p>
            <div className="wire-landing__card-foot">
              <span className="wire-landing__card-metric wire-landing__card-metric--amber">PUBLIC RECORD MUTATION</span>
            </div>
          </div>

          {/* Pipeline Connector */}
          <div className="wire-landing__pipeline-arrow" aria-hidden="true">
            <span>➔</span>
          </div>

          {/* Step 03 */}
          <div className="wire-landing__card wire-corner-reticles">
            <div className="wire-landing__card-badge">PHASE 03 // FORENSICS</div>
            <div className="wire-landing__card-num">03 / REVEAL</div>
            <h3 className="wire-landing__card-title">Expose Editorial Drift</h3>
            <p className="wire-landing__card-desc">
              Audit the side-by-side decay between raw negative and public folklore, then download your official stamped wire dossier.
            </p>
            <div className="wire-landing__card-foot">
              <span className="wire-landing__card-metric">VERDICT STAMP EXPORT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Wire Signals Strip */}
      <div className="wire-landing__signals-bar">
        <div className="wire-landing__signal-item">
          <span className="wire-landing__signal-code">#01-A VICE BEACH</span>
          <span className="wire-landing__signal-desc">Supercar Submersible (86% Drift Logged)</span>
        </div>
        <span className="wire-landing__status-sep">■</span>
        <div className="wire-landing__signal-item">
          <span className="wire-landing__signal-code">#02-B AMBROSIA SWAMP</span>
          <span className="wire-landing__signal-desc">Marshland Anomaly (High Volatility Chain)</span>
        </div>
      </div>

      {/* Terminal System Status Footer */}
      <footer className="wire-landing__status-footer">
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-dot wire-landing__status-dot--green" />
          <span className="wire-landing__status-label">WIRE TELEMETRY:</span>
          <span className="wire-landing__status-val">ONLINE</span>
        </div>
        <div className="wire-landing__status-sep">■</div>
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-label">ACTIVE CASES:</span>
          <span className="wire-landing__status-val">02 ON FILE</span>
        </div>
        <div className="wire-landing__status-sep">■</div>
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-label">CUSTODY INTEGRITY:</span>
          <span className="wire-landing__status-val">COMPROMISED (DRIFT ACTIVE)</span>
        </div>
      </footer>
    </motion.div>
  );
}
