import React, { useMemo, useState, useRef, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress, clearCaseProgress } from '../utils/storage';
import { computeDrift } from '../lib/driftEngine';
import { getAbsoluteImageUrl } from '../utils/imageHelpers';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import SceneFallback from '../components/3d/SceneFallback';
import './RevealScreen.css';

// Lazy-load 3D Drift Shatter Scene
const DriftShatterScene = lazy(() => import('../components/3d/DriftShatterScene'));

/**
 * Interactive Wipe Reveal Viewer:
 * Provides a draggable before/after divider comparing the raw truth negative
 * against the final public headline manipulation.
 */
function WipeRevealViewer({
  rawImage,
  rawCaption,
  rawAuthor,
  finalImage,
  finalFilter,
  finalCaption,
  finalAuthor,
  driftScore,
  statusLabel
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const updatePosition = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    if (clientX !== undefined) {
      updatePosition(clientX);
    }
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      if (clientX !== undefined) {
        updatePosition(clientX);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setSliderPos((p) => Math.max(0, p - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPos((p) => Math.min(100, p + 5));
    }
  };

  return (
    <div className="wire-wipe-viewer">
      <div
        className="wire-wipe-frame wire-corner-reticles"
        ref={containerRef}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        role="slider"
        aria-label="Wipe between raw truth and public claim"
        aria-valuenow={Math.round(sliderPos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Layer 1: Final Manipulated Public Claim (Full Container) */}
        <div className="wire-wipe-layer wire-wipe-layer--final">
          <img
            src={finalImage}
            alt="What the public saw"
            className="wire-wipe-img"
            style={{ filter: finalFilter }}
          />
          <div className="wire-wipe-stamp-tag wire-wipe-stamp-tag--final">
            <span className="wire-wipe-tag-dot wire-wipe-tag-dot--crimson" />
            <span>EXHIBIT B: PUBLIC WIRE CLAIM</span>
          </div>
        </div>

        {/* Layer 2: Raw Archive Record (Clipped via clip-path polygon) */}
        <div
          className="wire-wipe-layer wire-wipe-layer--raw"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <img
            src={rawImage}
            alt="The Raw Truth"
            className="wire-wipe-img"
          />
          <div className="wire-wipe-stamp-tag wire-wipe-stamp-tag--raw">
            <span className="wire-wipe-tag-dot wire-wipe-tag-dot--amber" />
            <span>EXHIBIT A: RAW RECORD NEGATIVE</span>
          </div>
        </div>

        {/* Vertical Divider Line with Grab Handle */}
        <div
          className="wire-wipe-divider"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="wire-wipe-handle" title="Drag to wipe between raw record and public claim">
            <span className="wire-wipe-handle-arrow">◀</span>
            <span className="wire-wipe-handle-bar">||</span>
            <span className="wire-wipe-handle-arrow">▶</span>
          </div>
        </div>
      </div>

      {/* Scrub Helper Bar */}
      <div className="wire-wipe-instructions">
        <span className="wire-wipe-hint">
          ← DRAG DIVIDER TO REVEAL PIXEL DRIFT →
        </span>
        <span className="wire-wipe-split-ratio">
          {Math.round(sliderPos)}% RAW / {100 - Math.round(sliderPos)}% MUTATED
        </span>
      </div>

      {/* Synchronized Narrative Juxtaposition */}
      <div className="wire-wipe-narratives">
        <div className="wire-wipe-narrative-col wire-wipe-narrative-col--raw">
          <div className="wire-wipe-col-header">
            <span className="wire-wipe-col-tag">ARCHIVAL BASELINE</span>
            <span className="wire-wipe-col-byline">{rawAuthor}</span>
          </div>
          <p className="wire-wipe-col-quote">&ldquo;{rawCaption}&rdquo;</p>
        </div>

        <div className="wire-wipe-narrative-col wire-wipe-narrative-col--final">
          <div className="wire-wipe-col-header">
            <span className="wire-wipe-col-tag wire-wipe-col-tag--alert">FINAL PUBLIC WIRE</span>
            <span className="wire-wipe-col-byline">{finalAuthor}</span>
          </div>
          <p className="wire-wipe-col-quote">&ldquo;{finalCaption}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}

export default function RevealScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('3d'); // '3d' | 'wipe' | 'split'

  const caseObj = useMemo(() => getCaseById(id), [id]);
  const playerProgress = useMemo(() => getCaseProgress(caseObj.id), [caseObj.id]);
  const fullChain = useMemo(() => getEffectiveChain(caseObj, playerProgress), [caseObj, playerProgress]);
  const driftResult = useMemo(() => computeDrift(caseObj, fullChain), [caseObj, fullChain]);
  const hasPlayerEdited = Boolean(playerProgress?.playerLink);

  const handleResetThisCase = () => {
    if (window.confirm('Reset this case and remove your filed report?')) {
      clearCaseProgress(caseObj.id);
      navigate(`/case/${caseObj.id}`);
    }
  };

  // Construct the unrolled chronological chain
  const chainSequence = useMemo(() => {
    return [
      {
        step: 0,
        label: 'RAW BASELINE NEGATIVE',
        author: caseObj.originalPhotographer,
        role: 'Official Evidentiary Archival Unit',
        timestamp: caseObj.dateLogged.split('//')[1]?.trim() || 'BASELINE',
        caption: caseObj.originalCaption,
        imageDataUrl: null,
        filterStyle: 'none',
        deltaScore: 0,
        isOriginal: true
      },
      ...fullChain.map((link, idx) => ({
        step: idx + 1,
        label: link.isPlayerSubmission ? 'YOUR FILED REPORT' : `WITNESS #${link.step}`,
        author: link.author,
        role: link.role || (link.isPlayerSubmission ? 'Investigative Press Contributor' : 'Witness'),
        timestamp: link.timestamp || 'UNKNOWN',
        caption: link.caption,
        imageDataUrl: link.imageDataUrl || null,
        filterStyle: link.filterStyle || 'none',
        deltaScore: Math.round(((idx + 1) / fullChain.length) * driftResult.score),
        isPlayer: Boolean(link.isPlayerSubmission),
        toolsUsed: link.toolsUsed || []
      }))
    ];
  }, [caseObj, fullChain, driftResult]);

  const rawStep = chainSequence[0];
  const finalStep = chainSequence[chainSequence.length - 1];

  /**
   * Generates a composite evidentiary dossier image on an HTML5 canvas
   * and triggers an immediate PNG download.
   */
  const handleDownloadWire = async () => {
    setIsGeneratingDownload(true);

    try {
      const canvas = document.createElement('canvas');
      const width = 1400;
      const height = 940;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Background - Dark Noir Terminal
      ctx.fillStyle = '#07080B';
      ctx.fillRect(0, 0, width, height);

      // Outer border rule
      ctx.strokeStyle = '#D49A32';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner hairline rule
      ctx.strokeStyle = 'rgba(212, 154, 50, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // Top banner
      ctx.fillStyle = '#10131A';
      ctx.fillRect(28, 28, width - 56, 85);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeRect(28, 28, width - 56, 85);

      // Top Banner Typography
      ctx.fillStyle = '#F5EFE6';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText('THE LEONIDA WIRE // FORENSIC EVIDENTIARY DOSSIER', 50, 65);

      ctx.fillStyle = '#D49A32';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`CASE: ${caseObj.caseNumber} • SCENE: ${caseObj.location.toUpperCase()}`, 50, 95);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#A0A7B5';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(`AUDITED: ${caseObj.dateLogged}`, width - 50, 65);
      ctx.fillStyle = '#E5A93C';
      ctx.fillText(`VERDICT: ${driftResult.status.label.toUpperCase()} (${driftResult.score}% DRIFT)`, width - 50, 95);
      ctx.textAlign = 'left';

      // Helper to load image
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          if (!src.startsWith('data:')) {
            img.crossOrigin = 'anonymous';
          }
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load image for export: ' + src));
          img.src = src;
        });
      };

      // Load original image and final image
      const origImgSrc = getAbsoluteImageUrl(caseObj.originalImage);
      const finalImgSrc = finalStep.imageDataUrl
        ? finalStep.imageDataUrl
        : getAbsoluteImageUrl(caseObj.originalImage);

      const [origImg, finalImg] = await Promise.all([
        loadImage(origImgSrc),
        loadImage(finalImgSrc)
      ]);

      // Dual Column Layout
      const colW = 620;
      const imgH = 390;
      const yImg = 165;

      // ==========================================
      // EXHIBIT A: ORIGINAL
      // ==========================================
      const xLeft = 50;
      ctx.fillStyle = '#11141B';
      ctx.fillRect(xLeft, yImg - 34, colW, 34);
      ctx.strokeStyle = 'rgba(212, 154, 50, 0.4)';
      ctx.strokeRect(xLeft, yImg - 34, colW, 34);

      ctx.fillStyle = '#E5A93C';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('[EXHIBIT A] ARCHIVAL SCENE NEGATIVE (RAW RECORD)', xLeft + 14, yImg - 12);

      ctx.drawImage(origImg, xLeft, yImg, colW, imgH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(xLeft, yImg, colW, imgH);

      // Registration crosshairs
      ctx.strokeStyle = '#D49A32';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Top-left
      ctx.moveTo(xLeft + 8, yImg + 16); ctx.lineTo(xLeft + 24, yImg + 16);
      ctx.moveTo(xLeft + 16, yImg + 8); ctx.lineTo(xLeft + 16, yImg + 24);
      ctx.stroke();

      // Left Caption
      ctx.fillStyle = '#F5EFE6';
      ctx.font = 'italic 15px Georgia, serif';
      const nextYLeft = wrapText(ctx, `"${caseObj.originalCaption}"`, xLeft, yImg + imgH + 28, colW, 22, 3);

      ctx.fillStyle = '#A0A7B5';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(`SOURCE: ${caseObj.originalPhotographer}`, xLeft, Math.max(nextYLeft + 12, yImg + imgH + 98));

      // ==========================================
      // EXHIBIT B: FINAL TRANSMITTED REPORT
      // ==========================================
      const xRight = width - colW - 50;
      ctx.fillStyle = '#11141B';
      ctx.fillRect(xRight, yImg - 34, colW, 34);
      ctx.strokeStyle = 'rgba(230, 57, 86, 0.5)';
      ctx.strokeRect(xRight, yImg - 34, colW, 34);

      ctx.fillStyle = '#E63956';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('[EXHIBIT B] FINAL TRANSMITTED WIRE CLAIM', xRight + 14, yImg - 12);

      ctx.drawImage(finalImg, xRight, yImg, colW, imgH);
      ctx.strokeStyle = 'rgba(230, 57, 86, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(xRight, yImg, colW, imgH);

      // Right Caption
      ctx.fillStyle = '#F5EFE6';
      ctx.font = 'italic 15px Georgia, serif';
      const nextYRight = wrapText(ctx, `"${finalStep.caption}"`, xRight, yImg + imgH + 28, colW, 22, 3);

      ctx.fillStyle = '#E5A93C';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(`BYLINE: ${finalStep.author} (Stage #${fullChain.length})`, xRight, Math.max(nextYRight + 12, yImg + imgH + 98));

      // ==========================================
      // STAMPED VERDICT IN CENTER BOTTOM
      // ==========================================
      const stampBoxW = 480;
      const stampBoxH = 75;
      const stampX = (width - stampBoxW) / 2;
      const stampY = height - 165;

      ctx.save();
      ctx.translate(width / 2, stampY + stampBoxH / 2);
      ctx.rotate(-0.04); // subtle physical stamp tilt

      ctx.fillStyle = '#0B0D12';
      ctx.fillRect(-stampBoxW / 2, -stampBoxH / 2, stampBoxW, stampBoxH);
      ctx.strokeStyle = driftResult.score > 60 ? '#E63956' : '#D49A32';
      ctx.lineWidth = 3;
      ctx.strokeRect(-stampBoxW / 2, -stampBoxH / 2, stampBoxW, stampBoxH);

      ctx.fillStyle = driftResult.score > 60 ? '#E63956' : '#E5A93C';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${driftResult.status.label.toUpperCase()} ★`, 0, -5);

      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillStyle = '#F5EFE6';
      ctx.fillText(`COMPUTED TRUTH DRIFT: ${driftResult.score}% • LEONIDA INVESTIGATIVE BUREAU`, 0, 18);
      ctx.restore();

      // Official Footer
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6C7280';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('LEONIDA WIRE FORENSIC DESPATCH // MANIPULATED VIA @UNLAYER/REACT-IMAGE-EDITOR ENGINE', 50, height - 42);
      ctx.textAlign = 'right';
      ctx.fillText(`CERTIFICATE #LW-${caseObj.id.toUpperCase()}-2026`, width - 50, height - 42);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `the-leonida-wire-${caseObj.id}-evidence.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('[Leonida Wire] Failed to generate canvas export:', err);
      alert('Unable to generate canvas export: ' + err.message);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  return (
    <motion.div
      className="wire-reveal wire-page-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top Nav */}
      <div className="wire-reveal__nav">
        <Link to="/cases" className="wire-reveal__back-link">
          ← RETURN TO CASE FILES
        </Link>
        <div className="wire-reveal__case-stat">
          <span>EXPOSED CASE: <strong>{caseObj.caseNumber}</strong></span>
          <span className="wire-reveal__sep">//</span>
          <Badge variant={driftResult.status.variant} size="sm">
            {driftResult.status.label}
          </Badge>
        </div>
      </div>

      {/* Screen Header */}
      <header className="wire-reveal__header">
        <div className="wire-reveal__badge-row">
          <Badge variant="wire">LEONIDA WIRE INVESTIGATION EXPOSED</Badge>
          <span className="wire-reveal__archive-ref">AUDIT CERTIFICATE #EX-2026</span>
        </div>

        <h1 className="wire-reveal__title">
          THE WIRE IS EXPOSED
        </h1>

        <p className="wire-reveal__desc">
          Compare the unvarnished raw truth against what the public was led to believe. 
          Inspect the full chain of distortion, review what changed, and export your 
          certified evidentiary dossier.
        </p>
        <div className="wire-oxford-rule" aria-hidden="true" />

        {!hasPlayerEdited && (
          <div className="wire-reveal__lock-banner">
            <div className="wire-reveal__lock-tag">
              [!] CASE EXPOSURE INCOMPLETE • AWAITING YOUR REPORT
            </div>
            <p>
              You are viewing an unsealed witness file. File your link in the React Image Editor 
              to officially seal the wire and enable full evidentiary certification.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/case/${caseObj.id}/edit`)}
              icon={<span>→</span>}
            >
              LAUNCH IMAGE EDITOR • ADD YOUR LINK
            </Button>
          </div>
        )}
      </header>

      {/* FORENSIC COMPARISON: 3D VOLUMETRIC SHATTER, INTERACTIVE WIPE, OR SIDE-BY-SIDE */}
      <section className="wire-reveal__comparison-section" aria-label="Split Photographic Comparison">
        <div className="wire-reveal__comp-header">
          <div className="wire-reveal__comp-heading-group">
            <h2 className="wire-reveal__comp-title">FORENSIC COMPARISON</h2>
            <div className="wire-comp-mode-toggle" role="tablist">
              <button
                type="button"
                className={`wire-comp-mode-btn ${comparisonMode === '3d' ? 'is-active' : ''}`}
                onClick={() => setComparisonMode('3d')}
                title="3D volumetric fracture simulation with dynamic chromatic aberration"
              >
                ◈ 3D VOLUMETRIC SHATTER
              </button>
              <button
                type="button"
                className={`wire-comp-mode-btn ${comparisonMode === 'wipe' ? 'is-active' : ''}`}
                onClick={() => setComparisonMode('wipe')}
                title="Wipe transition between raw truth and public claim"
              >
                ⇄ INTERACTIVE WIPE REVEAL
              </button>
              <button
                type="button"
                className={`wire-comp-mode-btn ${comparisonMode === 'split' ? 'is-active' : ''}`}
                onClick={() => setComparisonMode('split')}
                title="Side-by-side photographic ledger"
              >
                ☷ SIDE-BY-SIDE
              </button>
            </div>
          </div>

          <Badge
            variant={driftResult.status.variant}
            stamp
            rotate={-2}
            size="md"
          >
            {driftResult.status.label}
          </Badge>
        </div>

        {comparisonMode === '3d' ? (
          <div
            className="wire-reveal__3d-wrapper wire-corner-reticles"
            style={{
              marginBottom: 'var(--space-4)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: 'var(--shadow-deep)',
              background: '#090A0D',
            }}
          >
            <Suspense fallback={<SceneFallback label="SIMULATING 3D VOLUMETRIC FRACTURE..." />}>
              <DriftShatterScene
                rawImageUrl={getAbsoluteImageUrl(caseObj.originalImage)}
                editedImageUrl={finalStep.imageDataUrl || getAbsoluteImageUrl(caseObj.originalImage)}
                filterStyle={finalStep.imageDataUrl ? 'none' : (finalStep.filterStyle || 'none')}
                driftScore={driftResult.score}
              />
            </Suspense>

            {/* Synchronized Narrative Juxtaposition */}
            <div
              className="wire-wipe-narratives"
              style={{
                marginTop: 0,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="wire-wipe-narrative-col wire-wipe-narrative-col--raw">
                <div className="wire-wipe-col-header">
                  <span className="wire-wipe-col-tag">ARCHIVAL BASELINE</span>
                  <span className="wire-wipe-col-byline">{caseObj.originalPhotographer}</span>
                </div>
                <p className="wire-wipe-col-quote">&ldquo;{caseObj.originalCaption}&rdquo;</p>
              </div>

              <div className="wire-wipe-narrative-col wire-wipe-narrative-col--final">
                <div className="wire-wipe-col-header">
                  <span className="wire-wipe-col-tag wire-wipe-col-tag--final">MUTATED WIRE CLAIM</span>
                  <span className="wire-wipe-col-byline">{finalStep.author}</span>
                </div>
                <p className="wire-wipe-col-quote">&ldquo;{finalStep.caption}&rdquo;</p>
              </div>
            </div>
          </div>
        ) : comparisonMode === 'wipe' ? (
          <WipeRevealViewer
            rawImage={caseObj.originalImage}
            rawCaption={caseObj.originalCaption}
            rawAuthor={caseObj.originalPhotographer}
            finalImage={finalStep.imageDataUrl || caseObj.originalImage}
            finalFilter={finalStep.imageDataUrl ? 'none' : (finalStep.filterStyle || 'none')}
            finalCaption={finalStep.caption}
            finalAuthor={finalStep.author}
            driftScore={driftResult.score}
            statusLabel={driftResult.status.label}
          />
        ) : (
          <div className="wire-reveal__comp-grid">
            {/* Left: Original */}
            <div className="wire-comp-card wire-comp-card--original">
              <div className="wire-comp-card__tag">
                <span className="wire-comp-dot wire-comp-dot--amber" />
                <span>THE RAW TRUTH (ARCHIVE RECORD)</span>
              </div>

              <div className="wire-comp-card__img-wrap wire-corner-reticles">
                <img
                  src={caseObj.originalImage}
                  alt="The Raw Truth"
                  className="wire-comp-card__img"
                />
                <div className="wire-comp-card__stamp-pos">
                  <Badge variant="verified" stamp rotate={-3} size="sm">
                    ORIGINAL
                  </Badge>
                </div>
              </div>

              <div className="wire-comp-card__body">
                <span className="wire-comp-card__byline">SOURCE: {rawStep.author}</span>
                <p className="wire-comp-card__caption">&ldquo;{rawStep.caption}&rdquo;</p>
                <div className="wire-comp-card__verdict-strip">
                  <span>VERIFIED FACTUAL RECORD</span>
                </div>
              </div>
            </div>

            {/* Center Drift Meter Indicator */}
            <div className="wire-comp-divider">
              <div className="wire-comp-drift-circle">
                <span className="wire-comp-drift-val">{driftResult.score}%</span>
                <span className="wire-comp-drift-lbl">DRIFT</span>
              </div>
            </div>

            {/* Right: Final */}
            <div className="wire-comp-card wire-comp-card--final">
              <div className="wire-comp-card__tag">
                <span className="wire-comp-dot wire-comp-dot--red" />
                <span>WHAT THE PUBLIC SAW (FILED CLAIM)</span>
              </div>

              <div className="wire-comp-card__img-wrap wire-corner-reticles">
                <img
                  src={finalStep.imageDataUrl || caseObj.originalImage}
                  alt="What the public saw"
                  className="wire-comp-card__img"
                  style={{ filter: finalStep.imageDataUrl ? 'none' : (finalStep.filterStyle || 'none') }}
                />
                <div className="wire-comp-card__stamp-pos">
                  <Badge variant="fabrication" stamp rotate={3} size="sm">
                    FINAL MUTATION
                  </Badge>
                </div>
              </div>

              <div className="wire-comp-card__body">
                <span className="wire-comp-card__byline">BYLINE: {finalStep.author}</span>
                <p className="wire-comp-card__caption">&ldquo;{finalStep.caption}&rdquo;</p>
                <div className="wire-comp-card__verdict-strip wire-comp-card__verdict-strip--alert">
                  <span>RATING: {driftResult.status.label}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* "WHAT CHANGED?" MUTATION TAGS & NARRATIVE DIVERGENCE */}
      <section className="wire-reveal__changes-section" aria-label="What Changed">
        <div className="wire-changes-card">
          <div className="wire-changes-card__header">
            <h3>WHAT CHANGED?</h3>
            <span className="wire-changes-card__sub">[CUMULATIVE FORENSIC AUDIT]</span>
          </div>

          <div className="wire-changes-card__body">
            {/* Compact Mutation Tags */}
            <div className="wire-changes-row">
              <span className="wire-changes-label">APPLIED MUTATION TAGS:</span>
              <div className="wire-changes-tags">
                {(finalStep.toolsUsed && finalStep.toolsUsed.length > 0
                  ? finalStep.toolsUsed.map((t) => t.replace(/[^a-zA-Z]/g, '').toUpperCase())
                  : ['CROP', 'FILTER', 'TEXT', 'DISTORTION']
                ).filter((tag) => tag && !tag.includes('REACTIMAGEEDITOR') && !tag.includes('UNLAYER')).map((tag, i) => (
                  <span key={i} className="wire-mutation-tag">
                    {tag}
                  </span>
                ))}
                <span className="wire-mutation-tag">SATURATION</span>
                <span className="wire-mutation-tag">RE-FRAMING</span>
              </div>
            </div>

            {/* Public Narrative vs The Record */}
            <div className="wire-narrative-split">
              <div className="wire-narrative-col">
                <span className="wire-narrative-tag wire-narrative-tag--public">PUBLIC NARRATIVE:</span>
                <blockquote className="wire-narrative-quote">
                  &ldquo;{finalStep.caption}&rdquo;
                </blockquote>
              </div>

              <div className="wire-narrative-col">
                <span className="wire-narrative-tag wire-narrative-tag--record">THE RECORD:</span>
                <blockquote className="wire-narrative-quote">
                  &ldquo;{caseObj.originalCaption}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHRONOLOGICAL UNROLLED CHAIN SEQUENCE */}
      <section className="wire-reveal__sequence" aria-label="Full Custody Chronicle">
        <div className="wire-reveal__sequence-header">
          <h2>STEP-BY-STEP CUSTODY CHRONICLE</h2>
          <span className="wire-reveal__seq-count">[{chainSequence.length} RECORDED LINKS]</span>
        </div>

        <div className="wire-reveal__timeline">
          {chainSequence.map((step, idx) => (
            <div
              key={step.step}
              className={`wire-reveal-step ${step.isOriginal ? 'is-orig-step' : ''} ${
                step.isPlayer ? 'is-player-step' : ''
              }`}
            >
              <div className="wire-reveal-step__rail">
                <span className="wire-reveal-step__bullet">{step.step}</span>
                {idx < chainSequence.length - 1 && <div className="wire-reveal-step__line" />}
              </div>

              <div className="wire-reveal-step__content">
                <div className="wire-reveal-step__top">
                  <div className="wire-reveal-step__id">
                    <span className="wire-reveal-step__label">{step.label}</span>
                    <Badge
                      variant={
                        step.isOriginal
                          ? 'verified'
                          : step.isPlayer
                          ? 'fabrication'
                          : 'disputed'
                      }
                      size="sm"
                    >
                      {step.isOriginal
                        ? '0% DRIFT'
                        : `${step.deltaScore}% DRIFT`}
                    </Badge>
                  </div>
                  <span className="wire-reveal-step__time">{step.timestamp}</span>
                </div>

                <div className="wire-reveal-step__grid">
                  <div className="wire-reveal-step__img-wrap wire-corner-reticles">
                    {step.imageDataUrl ? (
                      <img
                        src={step.imageDataUrl}
                        alt={step.caption}
                        className="wire-reveal-step__img"
                      />
                    ) : (
                      <img
                        src={caseObj.originalImage}
                        alt={step.caption}
                        className="wire-reveal-step__img"
                        style={{ filter: step.filterStyle || 'none' }}
                      />
                    )}
                  </div>

                  <div className="wire-reveal-step__details">
                    <div className="wire-reveal-step__byline">
                      SOURCE: <strong>{step.author}</strong> ({step.role})
                    </div>
                    <blockquote className="wire-reveal-step__caption">
                      &ldquo;{step.caption}&rdquo;
                    </blockquote>
                    {step.toolsUsed && step.toolsUsed.length > 0 && (
                      <div className="wire-reveal-step__tools">
                        <span>ALTERATIONS:</span> {step.toolsUsed.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOWNLOAD DOSSIER ACTION & REPLAY BUTTONS */}
      <section className="wire-reveal__actions-section" aria-label="Dossier Export and Actions">
        <div className="wire-reveal__download-card">
          <div className="wire-reveal__download-info">
            <h3>DOWNLOAD YOUR WIRE DOSSIER</h3>
            <p>
              Export a composite evidence sheet containing the side-by-side photographic 
              comparison, captions, and the certified drift verdict rendered into a single 
              shareable image via the browser Canvas engine.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleDownloadWire}
            disabled={isGeneratingDownload || !hasPlayerEdited}
            icon={<span>↓</span>}
          >
            {isGeneratingDownload
              ? 'COMPOSITING DOSSIER...'
              : !hasPlayerEdited
              ? 'FILE IN IMAGE EDITOR TO UNLOCK EXPORT'
              : 'DOWNLOAD YOUR WIRE DOSSIER'}
          </Button>
        </div>

        {downloadSuccess && (
          <div className="wire-reveal__download-toast">
            <span>✓</span> EVIDENTIARY DOSSIER DOWNLOADED SUCCESSFULLY!
          </div>
        )}

        <div className="wire-reveal__nav-footer">
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate(`/case/${caseObj.id}`)}
            icon={<span>←</span>}
          >
            RETURN TO CASE
          </Button>

          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => navigate('/cases')}
          >
            INVESTIGATE NEXT WIRE
          </Button>

          {hasPlayerEdited && (
            <Button 
              variant="evidence" 
              size="md" 
              onClick={handleResetThisCase}
            >
              RESET THIS CASE
            </Button>
          )}
        </div>
      </section>
    </motion.div>
  );
}

/**
 * Helper to wrap text cleanly within canvas boundaries without overflow
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 1;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '...', x, y);
        return y + lineHeight;
      }
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}
