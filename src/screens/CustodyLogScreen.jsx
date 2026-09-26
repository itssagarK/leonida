import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress, clearCaseProgress } from '../utils/storage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Divider from '../components/common/Divider';
import RedactionBar from '../components/common/RedactionBar';
import SceneFallback from '../components/3d/SceneFallback';
import ForensicMetadataModal from '../components/common/ForensicMetadataModal';
import './CustodyLogScreen.css';

// Lazy-load 3D Custody Depth Stack
const CustodyDepthStack = lazy(() => import('../components/3d/CustodyDepthStack'));

export default function CustodyLogScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isForensicOpen, setIsForensicOpen] = useState(false);

  const caseObj = useMemo(() => getCaseById(id), [id]);
  const playerProgress = useMemo(
    () => getCaseProgress(caseObj.id),
    [caseObj.id, refreshTrigger]
  );
  const fullChain = useMemo(
    () => getEffectiveChain(caseObj, playerProgress),
    [caseObj, playerProgress]
  );

  const hasPlayerEdited = Boolean(playerProgress?.playerLink);

  // Listen for storage events
  useEffect(() => {
    const handleProgressChange = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('wire_progress_updated', handleProgressChange);
    return () => window.removeEventListener('wire_progress_updated', handleProgressChange);
  }, []);

  // Combined scrubber list: Step 0 is RAW ORIGINAL, followed by witness links & player link
  const timelineStates = useMemo(() => {
    const states = [
      {
        id: 'raw-original',
        stepIndex: 0,
        author: caseObj.originalPhotographer,
        handle: '@official_wire_archive',
        role: 'Original Police / Archival Negative',
        timestamp: caseObj.dateLogged.split('//')[1]?.trim() || 'BASELINE',
        caption: caseObj.originalCaption,
        filterStyle: 'none',
        imageDataUrl: null,
        toolsUsed: ['Unedited Negative', 'RAW Sensor Data'],
        distortionNote: 'Original unadulterated reality before public wire circulation.',
        isRaw: true
      },
      ...fullChain.map((link, idx) => ({
        ...link,
        stepIndex: idx + 1
      }))
    ];
    return states;
  }, [caseObj, fullChain]);

  // Scrubber index state: default to latest link
  const [scrubberIndex, setScrubberIndex] = useState(timelineStates.length - 1);
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'flat'

  // Keep scrubber within bounds when timeline shrinks (e.g. after reset)
  useEffect(() => {
    if (scrubberIndex >= timelineStates.length) {
      setScrubberIndex(timelineStates.length - 1);
    }
  }, [timelineStates.length, scrubberIndex]);

  // Active scrutinized state
  const activeState = timelineStates[scrubberIndex] || timelineStates[0];

  const handleSliderChange = (e) => {
    setScrubberIndex(Number(e.target.value));
  };

  const handleResetThisCase = () => {
    if (window.confirm('Reset this case and remove your filed report? The case will return to its initial unsealed state.')) {
      clearCaseProgress(caseObj.id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      className="wire-custody wire-page-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Ledger Navigation */}
      <div className="wire-custody__nav">
        <Link to={`/case/${caseObj.id}`} className="wire-custody__back-link">
          ← BACK TO CASE INTRO
        </Link>
        <div className="wire-custody__case-ref">
          <span>CASE: <strong>{caseObj.caseNumber}</strong></span>
          <span className="wire-custody__sep">//</span>
          <span>LEDGER STATUS: <strong>ACTIVE WIRE</strong></span>
          {hasPlayerEdited && (
            <button
              onClick={handleResetThisCase}
              className="wire-custody__reset-link"
              title="Clear your filed report and reset this case"
            >
              [↺ RESET THIS CASE]
            </button>
          )}
        </div>
      </div>

      {/* Screen Title */}
      <header className="wire-custody__header">
        <div className="wire-custody__badge-row">
          <Badge variant="wire">CHAIN OF CUSTODY LOG</Badge>
          <span className="wire-custody__audit-tag">
            AUDIT RECORD #CR-{caseObj.id.toUpperCase()}-2026
          </span>
        </div>
        <h1 className="wire-custody__title">EVIDENTIARY DRIFT SCRUBBER</h1>
        <div className="wire-oxford-rule" aria-hidden="true" />
        <p className="wire-custody__desc">
          Drag the scrubber below to examine how each successive witness altered the photograph
          and warped the narrative from the raw archival negative to the current wire state.
        </p>
      </header>

      {/* BEFORE / AFTER SCRUBBER STAGE */}
      <section className="wire-custody__stage">
        {/* Scrubber Controls Top Bar */}
        <div className="wire-custody__scrub-controls">
          <div className="wire-custody__scrub-label-group">
            <span className="wire-custody__scrub-tag">TIMELINE POSITION:</span>
            <span className="wire-custody__scrub-curr">
              {activeState.isRaw
                ? 'ORIGINAL RAW NEGATIVE'
                : activeState.isPlayerSubmission
                ? 'YOUR FILED REPORT'
                : `WITNESS #${activeState.step} OF ${caseObj.chain.length}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* View Mode Switcher */}
            <div className="wire-comp-mode-toggle" role="tablist">
              <button
                type="button"
                className={`wire-comp-mode-btn ${viewMode === '3d' ? 'is-active' : ''}`}
                onClick={() => setViewMode('3d')}
                title="3D witness depth stack in true photographic space"
              >
                ◈ 3D DEPTH STACK
              </button>
              <button
                type="button"
                className={`wire-comp-mode-btn ${viewMode === 'flat' ? 'is-active' : ''}`}
                onClick={() => setViewMode('flat')}
                title="2D chromatic degradation viewport"
              >
                ☷ 2D FLAT VIEW
              </button>
            </div>

            <div className="wire-custody__scrub-step-counter">
              LINK [{scrubberIndex} / {timelineStates.length - 1}]
            </div>

            <button
              type="button"
              onClick={() => setIsForensicOpen(true)}
              style={{
                background: 'var(--accent-purple)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(100, 66, 239, 0.35)',
                transition: 'all 0.15s ease',
              }}
              title="Launch EXIF & Optical Analysis Modal"
            >
              <span>🔬</span> OPTICAL FORENSIC LAB
            </button>
          </div>
        </div>

        {/* Range Slider Scrubber */}
        <div className="wire-custody__slider-wrapper">
          <div className="wire-custody__slider-ticks">
            {timelineStates.map((st, i) => (
              <span
                key={st.id}
                className={`wire-custody__tick ${i === scrubberIndex ? 'is-active' : ''}`}
                onClick={() => setScrubberIndex(i)}
              >
                {i === 0 ? 'RAW' : st.isPlayerSubmission ? 'YOU' : `W${st.step}`}
              </span>
            ))}
          </div>

          <input
            type="range"
            min={0}
            max={timelineStates.length - 1}
            step={1}
            value={scrubberIndex}
            onChange={handleSliderChange}
            className="wire-custody__range-input"
            aria-label="Custody Scrub Bar"
          />

          <div className="wire-custody__scrub-endpoints">
            <span>← RAW ORIGINAL NEGATIVE</span>
            <span>LATEST WIRE MUTATION →</span>
          </div>
        </div>

        {/* 3D Depth Stack or 2D Viewport */}
        {viewMode === '3d' ? (
          <div
            className="wire-custody__3d-wrapper wire-corner-reticles"
            style={{
              width: '100%',
              marginBottom: 'var(--space-4)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: 'var(--shadow-deep)',
              background: '#07080A',
            }}
          >
            <Suspense fallback={<SceneFallback label="ASSEMBLING 3D CUSTODY DEPTH STACK..." />}>
              <CustodyDepthStack
                timelineStates={timelineStates}
                activeIndex={scrubberIndex}
                rawImageUrl={caseObj.originalImage}
                onSelectIndex={setScrubberIndex}
              />
            </Suspense>
          </div>
        ) : (
          <div 
            className={`wire-custody__viewport wire-corner-reticles ${
              scrubberIndex > 0 ? 'is-drift-degraded' : 'is-raw-clean'
            }`}
            style={{
              '--drift-aberration': `${scrubberIndex * 2}px`,
              '--drift-grain-opacity': 0.03 + (scrubberIndex * 0.05)
            }}
          >
            {activeState.imageDataUrl ? (
              <img
                src={activeState.imageDataUrl}
                alt={activeState.caption}
                className="wire-custody__viewport-img"
              />
            ) : (
              <img
                src={caseObj.originalImage}
                alt={activeState.caption}
                className="wire-custody__viewport-img"
                style={{ filter: activeState.filterStyle || 'none' }}
              />
            )}

            {/* Dynamic Optical Degradation HUD Indicator */}
            <div className="wire-custody__degradation-hud">
              <span className="wire-degradation-badge">
                OPTICAL ARTIFACTING: <strong>+{Math.round((scrubberIndex / Math.max(1, timelineStates.length - 1)) * 86)}%</strong>
              </span>
              <span className="wire-degradation-state">
                {scrubberIndex === 0 ? 'CLEAN ARCHIVAL SENSOR' : 'CHROMATIC DRIFT DETECTED'}
              </span>
            </div>

            {/* Stamped Badge in viewport */}
            <div className="wire-custody__viewport-stamp">
              {activeState.isRaw ? (
                <Badge variant="verified" stamp rotate={-2} size="md">
                  UNALTERED NEGATIVE
                </Badge>
              ) : activeState.isPlayerSubmission ? (
                <Badge variant="developing" stamp rotate={3} size="md">
                  YOUR FILED EDIT
                </Badge>
              ) : (
                <Badge variant="disputed" stamp rotate={-4} size="md">
                  WITNESS #{activeState.step} FILTER
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Caption & Metadata for Current Scrub Position */}
        <div className="wire-custody__scrub-meta-panel" key={activeState.id}>
          <div className="wire-custody__scrub-witness-bar">
            <div>
              <span className="wire-custody__witness-name">{activeState.author}</span>
              {activeState.handle && (
                <span className="wire-custody__witness-handle"> ({activeState.handle})</span>
              )}
              <span className="wire-custody__witness-role"> • {activeState.role}</span>
            </div>
            <span className="wire-custody__witness-time">{activeState.timestamp}</span>
          </div>

          <p className="wire-custody__scrub-caption">
            “{activeState.caption}”
          </p>

          <div className="wire-custody__scrub-distortion">
            <span className="wire-custody__distortion-label">AUDIT DRIFT NOTE:</span>
            <span className="wire-custody__distortion-text">{activeState.distortionNote}</span>
          </div>

          <div className="wire-custody__scrub-tools">
            <span className="wire-custody__tools-label">LOGGED MANIPULATIONS:</span>
            {activeState.toolsUsed.map((tool, idx) => (
              <span key={idx} className="wire-tool-pill">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION: ADD OR VIEW YOUR LINK */}
      <section className="wire-custody__cta-section">
        <div className="wire-custody__cta-card">
          <div className="wire-custody__cta-info">
            <h3>{hasPlayerEdited ? 'YOUR REPORT IS FILED ON THIS CASE' : 'READY TO INJECT YOUR REPORT?'}</h3>
            <p>
              {hasPlayerEdited
                ? 'Your visual edit and headline claim are currently sealed in the wire ledger. You can inspect the drift verdict or re-edit your submission.'
                : 'The chain is not yet sealed. Mount the head image in the React Image Editor to crop, filter, annotate, and write your own wire claim to uncover the final drift score.'}
            </p>
          </div>
          <div className="wire-custody__cta-buttons">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(hasPlayerEdited ? `/case/${caseObj.id}/status` : `/case/${caseObj.id}/edit`)}
              icon={<span>→</span>}
            >
              {hasPlayerEdited ? 'VIEW DRIFT STATUS & VERDICT' : 'ADD YOUR LINK • LAUNCH EDITOR'}
            </Button>
            {hasPlayerEdited && (
              <Button
                variant="evidence"
                size="md"
                onClick={() => navigate(`/case/${caseObj.id}/edit`)}
              >
                RE-EDIT IN IMAGE EDITOR
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* FULL EVIDENCE LEDGER (VERTICAL MONOSPACE LOG) */}
      <section className="wire-custody__ledger-section">
        <div className="wire-custody__ledger-header">
          <h2>OFFICIAL CHAIN OF CUSTODY LEDGER</h2>
          <span className="wire-custody__ledger-stamp">[EVIDENCE DEPT. REGISTER]</span>
        </div>

        <div className="wire-custody__ledger-list">
          {timelineStates.map((st, i) => (
            <React.Fragment key={st.id}>
              <div
                className={`wire-ledger-entry ${i === scrubberIndex ? 'is-active-entry' : ''}`}
                onClick={() => setScrubberIndex(i)}
              >
                <div className="wire-ledger-entry__head">
                  <div className="wire-ledger-entry__seq">
                    <span className="wire-ledger-entry__num">ENTRY #{i.toString().padStart(2, '0')}</span>
                    <Badge
                      variant={st.isRaw ? 'verified' : st.isPlayerSubmission ? 'wire' : 'disputed'}
                      size="sm"
                    >
                      {st.isRaw ? 'RAW BASELINE' : st.isPlayerSubmission ? 'PLAYER' : `WITNESS #${st.step}`}
                    </Badge>
                  </div>
                  <span className="wire-ledger-entry__time">{st.timestamp}</span>
                </div>

                <div className="wire-ledger-entry__body">
                  <div className="wire-ledger-entry__author">
                    SOURCE: <strong>{st.author}</strong> ({st.role})
                  </div>
                  <blockquote className="wire-ledger-entry__quote">
                    “{st.caption}”
                  </blockquote>
                  <div className="wire-ledger-entry__audit">
                    <span className="wire-ledger-entry__drift-tag">DRIFT:</span> {st.distortionNote}
                  </div>
                </div>

                <div className="wire-ledger-entry__footer">
                  <span className="wire-ledger-entry__tools">
                    MODS: {st.toolsUsed.join(' // ')}
                  </span>
                  <span className="wire-ledger-entry__sync-hint">CLICK TO VIEW IN SCRUBBER ↑</span>
                </div>
              </div>

              {/* Redaction divider between entries */}
              {i < timelineStates.length - 1 && (
                <div className="wire-custody__ledger-divider-row">
                  <RedactionBar width="60px" height="10px" />
                  <Divider variant="dashed" spacing="sm" />
                  <RedactionBar width="40px" height="10px" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Optical Forensic Diagnostic Lab Modal */}
      <ForensicMetadataModal
        isOpen={isForensicOpen}
        onClose={() => setIsForensicOpen(false)}
        caseData={caseObj}
      />
    </motion.div>
  );
}
