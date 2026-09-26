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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Editorial Folio / Dateline */}
      <div className="wire-landing__folio">
        <span className="wire-landing__folio-item">LEONIDA STATE INVESTIGATIVE BUREAU // VICE PRECINCT 04</span>
        <span className="wire-landing__folio-sep">•</span>
        <span className="wire-landing__folio-item">VOL. LXXIV NO. 28,491</span>
        <span className="wire-landing__folio-sep">•</span>
        <span className="wire-landing__folio-item">CLASSIFIED METRO DISPATCH</span>
      </div>

      <div className="wire-landing__masthead-tag">
        WANTED LEVEL: ★★★☆☆ // LSIB EVIDENCE LOCKER ARCHIVE
      </div>

      <h1 className="wire-landing__title">
        THE LEONIDA WIRE
      </h1>

      <p className="wire-landing__subtitle">
        LEONIDA STATE INVESTIGATIVE BUREAU // EVIDENCE DESPATCH &amp; TAMPERING SUITE
      </p>

      {/* Oxford Double-Rule */}
      <div className="wire-landing__double-rule" aria-hidden="true" />

      {/* 2-Column Hero Grid: Left Editorial Memo + Right 3D Evidence Desk */}
      <div className="wire-landing__hero-grid">
        {/* Left Column: Briefing & CTAs */}
        <div className="wire-landing__hero-left">
          <div className="wire-landing__epigraph-box">
            <div className="wire-landing__memo-bar">
              <span className="wire-landing__memo-title">MEMORANDUM // LSIB CRIME LAB PROTOCOL</span>
              <span className="wire-landing__memo-stamp">UNRESOLVED // LEVEL 4</span>
            </div>

            <blockquote className="wire-landing__quote">
              “Every image tells a story.<br />
              Every edit changes what survives.”
            </blockquote>

            <p className="wire-landing__lead-summary">
              Track the forensic distortion of crime-scene photographic evidence across consecutive witness links. 
              Deploy the embedded <strong>@unlayer/react-image-editor</strong> to file your own report, alter the negative, and compute the mathematical drift between raw fact and public folklore.
            </p>

            <div className="wire-landing__memo-meta">
              <span>CHAIN VOLATILITY: <strong className="wire-meta-pink">ACTIVE MUTATION</strong></span>
              <span>CLEARANCE: <strong className="wire-meta-cyan">LSIB BUREAU LEVEL 4</strong></span>
              <span>ENGINE: <strong className="wire-meta-amber">@UNLAYER/REACT-IMAGE-EDITOR</strong></span>
            </div>
          </div>

          <div className="wire-landing__cta-wrap">
            <Button
              variant="pink"
              size="lg"
              onClick={handleOpenCase}
              icon={<span className="wire-cta-arrow">→</span>}
            >
              OPEN CRIME FILES &amp; EVIDENCE
            </Button>
            <span className="wire-landing__cta-note">
              ACCESS UNRESTRICTED LSIB INCIDENT DOSSIERS
            </span>
          </div>
        </div>

        {/* Right Column: 3D Physical Evidence Desk Scene */}
        <div className="wire-landing__hero-3d-box wire-corner-reticles">
          <Suspense fallback={<SceneFallback label="LOADING LSIB EVIDENCE WORKBENCH..." />}>
            <HeroEvidenceDesk onSelectFolder={handleOpenCase} />
          </Suspense>
        </div>
      </div>

      {/* Dedicated Editor Engine Showcase Callout (Item 3) */}
      <div className="wire-landing__editor-banner wire-corner-reticles">
        <div className="wire-editor-banner__top">
          <div className="wire-editor-banner__badge">
            <span className="wire-editor-banner__dot" />
            <span>CORE INTEGRATION // @UNLAYER/REACT-IMAGE-EDITOR</span>
          </div>
          <span className="wire-editor-banner__tag">8 FORENSIC TOOLS // ZERO-LATENCY BROWSER ENGINE</span>
        </div>
        <h3 className="wire-editor-banner__heading">
          Professional In-Browser Photographic Manipulation
        </h3>
        <p className="wire-editor-banner__text">
          8 professional editing tools — <strong>crop, filter, draw, text, shapes, stickers, frame &amp; resize</strong> — applied directly to the evidence photograph, in real time, in your browser to simulate realistic witness tampering.
        </p>
      </div>

      {/* Connected Evidentiary Protocol Pipeline */}
      <section className="wire-landing__pipeline-section" aria-label="Evidentiary Protocol Pipeline">
        <div className="wire-landing__section-header">
          <span className="wire-landing__section-tag">INVESTIGATIVE PROTOCOL</span>
          <h2 className="wire-landing__section-title">THE EVIDENTIARY CHAIN OF CUSTODY</h2>
        </div>

        <div className="wire-landing__triptych">
          {/* Step 01 */}
          <div className="wire-landing__card wire-corner-reticles">
            <div className="wire-landing__card-badge">PHASE 01 // BASELINE</div>
            <div className="wire-landing__card-num">01 / RECEIVE</div>
            <h3 className="wire-landing__card-title">Raw Photographic Negative</h3>
            <p className="wire-landing__card-desc">
              Inspect pristine crime-scene negative captures preserved by LSIB field units before viral tabloid sensationalism.
            </p>
            <div className="wire-landing__card-foot">
              <span className="wire-landing__card-metric">DRIFT: 0.0% ARCHIVE BASE</span>
            </div>
          </div>

          {/* Pipeline Connector */}
          <div className="wire-landing__pipeline-arrow" aria-hidden="true">
            <span>➔</span>
          </div>

          {/* Step 02: Centerpiece with maximum prominence */}
          <div className="wire-landing__card wire-landing__card--centerpiece wire-corner-reticles">
            <div className="wire-landing__card-badge wire-landing__card-badge--centerpiece">
              ★ CENTERPIECE PHASE // THE IMAGE EDITOR
            </div>
            <div className="wire-landing__card-num wire-landing__card-num--pink">02 / ALTER &amp; FILE</div>
            <h3 className="wire-landing__card-title wire-landing__card-title--centerpiece">
              Manipulate via @unlayer/react-image-editor
            </h3>
            <p className="wire-landing__card-desc">
              Deploy the 8-tool forensic suite — <strong>crop, filter, draw, text, shapes, stickers, frame &amp; resize</strong> — to directly alter the evidence photo in real time and stamp your narrative link into the chain.
            </p>
            <div className="wire-landing__card-action">
              <Button
                variant="cyan"
                size="sm"
                onClick={() => navigate('/case/case-01/edit')}
                icon={<span>✎</span>}
              >
                TEST IMAGE WORKBENCH
              </Button>
            </div>
            <div className="wire-landing__card-foot">
              <span className="wire-landing__card-metric wire-landing__card-metric--pink">
                ★ POWERED BY @UNLAYER/REACT-IMAGE-EDITOR
              </span>
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
          <span className="wire-landing__signal-code">#01-A VICE BEACH MARINA</span>
          <span className="wire-landing__signal-desc">Supercar Submersible (86% Drift Logged)</span>
        </div>
        <span className="wire-landing__status-sep">■</span>
        <div className="wire-landing__signal-item">
          <span className="wire-landing__signal-code">#02-B AMBROSIA SWAMP ROADS</span>
          <span className="wire-landing__signal-desc">Marshland Anomaly (High Volatility Chain)</span>
        </div>
      </div>

      {/* Terminal System Status Footer */}
      <footer className="wire-landing__status-footer">
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-dot wire-landing__status-dot--green" />
          <span className="wire-landing__status-label">LSIB WIRE TELEMETRY:</span>
          <span className="wire-landing__status-val">ONLINE // ENCRYPTED</span>
        </div>
        <div className="wire-landing__status-sep">■</div>
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-label">ACTIVE DOSSIERS:</span>
          <span className="wire-landing__status-val">02 ON FILE</span>
        </div>
        <div className="wire-landing__status-sep">■</div>
        <div className="wire-landing__status-item">
          <span className="wire-landing__status-label">CUSTODY INTEGRITY:</span>
          <span className="wire-landing__status-val wire-meta-pink">MUTATION ACTIVE</span>
        </div>
      </footer>
    </motion.div>
  );
}
