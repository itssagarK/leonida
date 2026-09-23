import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress, clearCaseProgress } from '../utils/storage';
import { computeDrift } from '../lib/driftEngine';
import { getAbsoluteImageUrl } from '../utils/imageHelpers';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Divider from '../components/common/Divider';
import './RevealScreen.css';

export default function RevealScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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
      const width = 1200;
      const height = 800;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Background
      ctx.fillStyle = '#0A0B0E';
      ctx.fillRect(0, 0, width, height);

      // Border rule
      ctx.strokeStyle = '#2B2F3D';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      // Top banner
      ctx.fillStyle = '#12141C';
      ctx.fillRect(16, 16, width - 32, 70);

      ctx.fillStyle = '#FF4D6D';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText('THE LEONIDA WIRE // EVIDENTIARY DOSSIER', 36, 56);

      ctx.fillStyle = '#FFB84D';
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText(`${caseObj.caseNumber} • ${caseObj.location}`, width - 420, 48);

      ctx.fillStyle = '#8E95A5';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(`STATUS: ${driftResult.status.label} (${driftResult.score}% DRIFT)`, width - 420, 68);

      // Helper to load image
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
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

      // Draw Left Column: Original
      const colW = 540;
      const imgH = 340;
      const yImg = 130;

      // Left Image Box
      ctx.fillStyle = '#161922';
      ctx.fillRect(36, yImg - 30, colW, 30);
      ctx.fillStyle = '#06D6A0';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('ORIGINAL BASELINE // RAW NEGATIVE', 46, yImg - 10);

      ctx.drawImage(origImg, 36, yImg, colW, imgH);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(36, yImg, colW, imgH);

      // Left Caption
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic 16px Georgia, serif';
      wrapText(ctx, `"${caseObj.originalCaption}"`, 36, yImg + imgH + 30, colW, 22);

      ctx.fillStyle = '#8E95A5';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(`SOURCE: ${caseObj.originalPhotographer}`, 36, yImg + imgH + 110);

      // Draw Right Column: Final Filed Report
      const xRight = 624;
      ctx.fillStyle = '#161922';
      ctx.fillRect(xRight, yImg - 30, colW, 30);
      ctx.fillStyle = '#FF4D6D';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`FINAL REPORT // ${finalStep.author}`, xRight + 10, yImg - 10);

      ctx.drawImage(finalImg, xRight, yImg, colW, imgH);
      ctx.strokeStyle = 'rgba(255, 77, 109, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(xRight, yImg, colW, imgH);

      // Right Caption
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic 16px Georgia, serif';
      wrapText(ctx, `"${finalStep.caption}"`, xRight, yImg + imgH + 30, colW, 22);

      ctx.fillStyle = '#FFB84D';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(`BYLINE: ${finalStep.author} (Link #${fullChain.length})`, xRight, yImg + imgH + 110);

      // Big Stamped Verdict in Center Bottom
      ctx.fillStyle = '#0D0E14';
      ctx.fillRect(width / 2 - 180, height - 120, 360, 60);
      ctx.strokeStyle = driftResult.status.variant === 'fabrication' ? '#E63946' : '#FFB84D';
      ctx.lineWidth = 3;
      ctx.strokeRect(width / 2 - 180, height - 120, 360, 60);

      ctx.fillStyle = driftResult.status.variant === 'fabrication' ? '#E63946' : '#FFB84D';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(driftResult.status.label, width / 2, height - 88);

      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`COMPUTED TRUTH DRIFT: ${driftResult.score}%`, width / 2, height - 70);

      // Footer
      ctx.textAlign = 'left';
      ctx.fillStyle = '#555C6E';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('LEONIDA WIRE INVESTIGATIVE BUREAU // PRODUCED WITH @UNLAYER/REACT-IMAGE-EDITOR', 36, height - 26);

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
    <div className="wire-reveal">
      {/* Top Nav */}
      <div className="wire-reveal__nav">
        <Link to="/cases" className="wire-reveal__back-link">
          &larr; RETURN TO DOSSIER ARCHIVE
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
          <span className="wire-reveal__archive-ref">CERTIFIED AUDIT #EX-2026</span>
        </div>

        <h1 className="wire-reveal__title">
          THE COMPLETE CHAIN OF DISTORTION
        </h1>

        <p className="wire-reveal__desc">
          Follow the descent from the raw baseline negative to the final published story.
          Witness how each alteration, filter, and speculative caption pulled the truth
          further from reality.
        </p>

        <Divider variant="evidence" spacing="md" />
      </header>

      {/* CHRONOLOGICAL UNROLLED CHAIN SEQUENCE */}
      <section className="wire-reveal__sequence">
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
                  <div className="wire-reveal-step__img-wrap">
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

      {/* SIDE-BY-SIDE: ORIGINAL TRUTH vs. FINAL WIRE */}
      <section className="wire-reveal__comparison-section">
        <div className="wire-reveal__comp-header">
          <h2>FORENSIC COMPARISON: RAW TRUTH vs. PUBLIC WIRE</h2>
          <Badge
            variant={driftResult.status.variant}
            stamp
            rotate={-2}
            size="md"
          >
            {driftResult.status.label}
          </Badge>
        </div>

        <div className="wire-reveal__comp-grid">
          {/* Left: Original */}
          <div className="wire-comp-card wire-comp-card--original">
            <div className="wire-comp-card__tag">
              <span className="wire-comp-dot wire-comp-dot--green" />
              <span>THE RAW TRUTH (NEGATIVE)</span>
            </div>

            <div className="wire-comp-card__img-wrap">
              <img
                src={caseObj.originalImage}
                alt="Original photo"
                className="wire-comp-card__img"
              />
              <div className="wire-comp-card__stamp-pos">
                <Badge variant="verified" stamp rotate={-3} size="sm">
                  ORIGINAL
                </Badge>
              </div>
            </div>

            <div className="wire-comp-card__body">
              <span className="wire-comp-card__byline">{rawStep.author}</span>
              <p className="wire-comp-card__caption">&ldquo;{rawStep.caption}&rdquo;</p>
              <div className="wire-comp-card__verdict-strip">
                <span>VERIFIABLE FACTUAL DATA</span>
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
              <span>WHAT THE PUBLIC BELIEVED</span>
            </div>

            <div className="wire-comp-card__img-wrap">
              <img
                src={finalStep.imageDataUrl || caseObj.originalImage}
                alt="Final mutated image"
                className="wire-comp-card__img"
              />
              <div className="wire-comp-card__stamp-pos">
                <Badge variant="fabrication" stamp rotate={4} size="sm">
                  FINAL MUTATION
                </Badge>
              </div>
            </div>

            <div className="wire-comp-card__body">
              <span className="wire-comp-card__byline">{finalStep.author} (You)</span>
              <p className="wire-comp-card__caption">&ldquo;{finalStep.caption}&rdquo;</p>
              <div className="wire-comp-card__verdict-strip wire-comp-card__verdict-strip--alert">
                <span>RATING: {driftResult.status.label}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD DOSSIER ACTION & REPLAY BUTTONS */}
      <section className="wire-reveal__actions-section">
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
            disabled={isGeneratingDownload}
            icon={<span>&#11123;</span>}
          >
            {isGeneratingDownload ? 'COMPOSITING DOSSIER...' : 'DOWNLOAD YOUR WIRE IMAGE'}
          </Button>
        </div>

        {downloadSuccess && (
          <div className="wire-reveal__download-toast">
            <span>&#10003;</span> EVIDENTIARY DOSSIER DOWNLOADED SUCCESSFULLY!
          </div>
        )}

        <div className="wire-reveal__nav-footer">
          <Link to="/cases">
            <Button variant="secondary" size="md">
              &larr; PLAY ANOTHER CASE
            </Button>
          </Link>
          <Link to={`/case/${caseObj.id}/custody`}>
            <Button variant="evidence" size="md">
              INSPECT CUSTODY SCRUBBER AGAIN
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md">
              WIRE FRONT PAGE
            </Button>
          </Link>
          {hasPlayerEdited && (
            <Button variant="danger" size="md" onClick={handleResetThisCase}>
              &#8634; RESET THIS CASE
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * Helper to wrap text cleanly within canvas boundaries
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
