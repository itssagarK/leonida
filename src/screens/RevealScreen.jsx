import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress, clearCaseProgress } from '../utils/storage';
import { computeDrift } from '../lib/driftEngine';
import { getAbsoluteImageUrl } from '../utils/imageHelpers';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
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
      ctx.fillStyle = '#090A0D';
      ctx.fillRect(0, 0, width, height);

      // Border rule
      ctx.strokeStyle = '#D49A32';
      ctx.lineWidth = 3;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      // Top banner
      ctx.fillStyle = '#11141B';
      ctx.fillRect(16, 16, width - 32, 70);

      ctx.fillStyle = '#F4EFE6';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('THE LEONIDA WIRE // OFFICIAL EVIDENTIARY DOSSIER', 36, 56);

      ctx.fillStyle = '#D49A32';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`${caseObj.caseNumber} • ${caseObj.location}`, width - 420, 48);

      ctx.fillStyle = '#A0A7B5';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(`VERDICT: ${driftResult.status.label} (${driftResult.score}% DRIFT)`, width - 420, 68);

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

      // Draw Left Column: Original
      const colW = 540;
      const imgH = 340;
      const yImg = 130;

      // Left Image Box
      ctx.fillStyle = '#11141B';
      ctx.fillRect(36, yImg - 30, colW, 30);
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText('ORIGINAL BASELINE // THE RAW TRUTH', 46, yImg - 10);

      ctx.drawImage(origImg, 36, yImg, colW, imgH);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(36, yImg, colW, imgH);

      // Left Caption
      ctx.fillStyle = '#F4EFE6';
      ctx.font = 'italic 15px Georgia, serif';
      const nextYLeft = wrapText(ctx, `"${caseObj.originalCaption}"`, 36, yImg + imgH + 26, colW, 20, 3);

      ctx.fillStyle = '#A0A7B5';
      ctx.font = '11px "Courier New", monospace';
      ctx.fillText(`SOURCE: ${caseObj.originalPhotographer}`, 36, Math.max(nextYLeft + 10, yImg + imgH + 95));

      // Draw Right Column: Final Filed Report
      const xRight = 624;
      ctx.fillStyle = '#11141B';
      ctx.fillRect(xRight, yImg - 30, colW, 30);
      ctx.fillStyle = '#E63956';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillText(`FINAL TRANSMISSION // WHAT THE PUBLIC SAW`, xRight + 10, yImg - 10);

      ctx.drawImage(finalImg, xRight, yImg, colW, imgH);
      ctx.strokeStyle = 'rgba(230, 57, 86, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(xRight, yImg, colW, imgH);

      // Right Caption
      ctx.fillStyle = '#F4EFE6';
      ctx.font = 'italic 15px Georgia, serif';
      const nextYRight = wrapText(ctx, `"${finalStep.caption}"`, xRight, yImg + imgH + 26, colW, 20, 3);

      ctx.fillStyle = '#D49A32';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(`BYLINE: ${finalStep.author} (Link #${fullChain.length})`, xRight, Math.max(nextYRight + 10, yImg + imgH + 95));

      // Big Stamped Verdict in Center Bottom
      ctx.fillStyle = '#090A0D';
      ctx.fillRect(width / 2 - 180, height - 120, 360, 60);
      ctx.strokeStyle = '#D49A32';
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 180, height - 120, 360, 60);

      ctx.fillStyle = '#D49A32';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(driftResult.status.label, width / 2, height - 88);

      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillStyle = '#F4EFE6';
      ctx.fillText(`COMPUTED TRUTH DRIFT: ${driftResult.score}%`, width / 2, height - 70);

      // Footer
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6C7280';
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText('LEONIDA WIRE INVESTIGATIVE BUREAU // POWERED BY @UNLAYER/REACT-IMAGE-EDITOR', 36, height - 26);

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
    <div className="wire-reveal wire-page-container">
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

      {/* SIDE-BY-SIDE: THE RAW TRUTH vs. WHAT THE PUBLIC SAW */}
      <section className="wire-reveal__comparison-section" aria-label="Split Photographic Comparison">
        <div className="wire-reveal__comp-header">
          <h2 className="wire-reveal__comp-title">FORENSIC COMPARISON</h2>
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
              <span>THE RAW TRUTH</span>
            </div>

            <div className="wire-comp-card__img-wrap">
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
              <span>WHAT THE PUBLIC SAW</span>
            </div>

            <div className="wire-comp-card__img-wrap">
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
    </div>
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
