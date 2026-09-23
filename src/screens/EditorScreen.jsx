import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageEditor from '@unlayer/react-image-editor';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress, saveCaseProgress } from '../utils/storage';
import { getAbsoluteImageUrl, renderFilteredImageToDataUrl } from '../utils/imageHelpers';
import { computeDrift } from '../lib/driftEngine';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './EditorScreen.css';

export default function EditorScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const filingSectionRef = useRef(null);

  const caseObj = useMemo(() => getCaseById(id), [id]);
  const playerProgress = useMemo(() => getCaseProgress(caseObj.id), [caseObj.id]);
  const fullChain = useMemo(() => getEffectiveChain(caseObj, playerProgress), [caseObj, playerProgress]);

  // Compute live drift benchmark for the case
  const driftAudit = useMemo(() => computeDrift(caseObj, fullChain), [caseObj, fullChain]);

  // The latest link before player's edit
  const lastWitness = caseObj.chain[caseObj.chain.length - 1];

  // Editor states
  const [editorImageUrl, setEditorImageUrl] = useState('');
  const [isPreparingImage, setIsPreparingImage] = useState(true);
  const [savedDataUrl, setSavedDataUrl] = useState(
    playerProgress?.playerLink?.imageDataUrl || null
  );
  const [hasSavedImage, setHasSavedImage] = useState(
    Boolean(playerProgress?.playerLink?.imageDataUrl)
  );
  const [caption, setCaption] = useState(
    playerProgress?.playerLink?.caption || ''
  );
  const [authorName, setAuthorName] = useState(
    playerProgress?.playerLink?.author || 'YOU (LEONIDA WIRE AGENT)'
  );
  const [editorLoadError, setEditorLoadError] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(
    Boolean(playerProgress?.playerLink?.imageDataUrl)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorMinHeight, setEditorMinHeight] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 520 : 640
  );

  useEffect(() => {
    const handleResize = () => {
      setEditorMinHeight(window.innerWidth < 768 ? 520 : 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare initial image for the editor
  useEffect(() => {
    let isCancelled = false;

    async function prepareImage() {
      setIsPreparingImage(true);
      setEditorLoadError(false);

      try {
        if (playerProgress?.playerLink?.imageDataUrl) {
          if (!isCancelled) {
            setEditorImageUrl(playerProgress.playerLink.imageDataUrl);
            setIsPreparingImage(false);
          }
          return;
        }

        const bakedDataUrl = await renderFilteredImageToDataUrl(
          caseObj.originalImage,
          lastWitness?.filterStyle || 'none'
        );

        if (!isCancelled) {
          setEditorImageUrl(bakedDataUrl);
          setIsPreparingImage(false);
        }
      } catch (err) {
        console.error('[Leonida Wire] Error preparing editor image:', err);
        if (!isCancelled) {
          setEditorImageUrl(getAbsoluteImageUrl(caseObj.originalImage));
          setIsPreparingImage(false);
        }
      }
    }

    prepareImage();

    return () => {
      isCancelled = true;
    };
  }, [caseObj, lastWitness, playerProgress]);

  // Handler when player clicks "Save" inside Unlayer's ImageEditor
  const handleEditorSave = ({ dataUrl }) => {
    setSavedDataUrl(dataUrl);
    setHasSavedImage(true);
    setSaveSuccessNotice(true);
    // Smoothly scroll down to filing step if desired
    if (filingSectionRef.current) {
      filingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Handler when player clicks "Cancel" inside Unlayer's ImageEditor
  const handleEditorCancel = () => {
    navigate(`/case/${caseObj.id}/custody`);
  };

  // Handler when ImageEditor fails to load image
  const handleEditorLoadError = () => {
    console.error('[Leonida Wire] Unlayer ImageEditor onLoadError triggered');
    setEditorLoadError(true);
  };

  const handleUseRawFallback = () => {
    setEditorLoadError(false);
    setEditorImageUrl(getAbsoluteImageUrl(caseObj.originalImage));
  };

  // Reset current edit buffer
  const handleResetEdit = () => {
    if (window.confirm('Reset your unsaved visual edits on this case?')) {
      setSavedDataUrl(null);
      setHasSavedImage(false);
      setSaveSuccessNotice(false);
      setCaption('');
      setIsPreparingImage(true);
      setTimeout(async () => {
        try {
          const baked = await renderFilteredImageToDataUrl(
            caseObj.originalImage,
            lastWitness?.filterStyle || 'none'
          );
          setEditorImageUrl(baked);
        } catch {
          setEditorImageUrl(getAbsoluteImageUrl(caseObj.originalImage));
        }
        setIsPreparingImage(false);
      }, 100);
    }
  };

  // Validation: both saved image AND non-empty caption required
  const canSubmit = hasSavedImage && Boolean(savedDataUrl) && Boolean(caption.trim());

  // Form submission: save to localStorage and navigate to drift status
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    const newPlayerLink = {
      author: authorName.trim() || 'YOU (LEONIDA WIRE AGENT)',
      caption: caption.trim(),
      imageDataUrl: savedDataUrl,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' EST',
      toolsUsed: ['React Image Editor (Unlayer)', 'Custom Player Distortion']
    };

    saveCaseProgress(caseObj.id, {
      playerLink: newPlayerLink,
      submittedAt: new Date().toISOString()
    });

    navigate(`/case/${caseObj.id}/status`);
  };

  return (
    <div className="wire-editor-screen wire-page-container">
      {/* Top Header / Breadcrumb */}
      <div className="wire-editor__topbar">
        <Link to={`/case/${caseObj.id}/custody`} className="wire-editor__back-link">
          ← BACK TO CUSTODY LOG
        </Link>
        <div className="wire-editor__terminal-id">
          <span className="wire-editor__live-dot" />
          <span>EVIDENTIARY WORKBENCH // TERMINAL #01</span>
        </div>
      </div>

      {/* Screen Title & Context */}
      <header className="wire-editor__masthead">
        <div className="wire-editor__badge-row">
          <Badge variant="wire">{caseObj.caseNumber}</Badge>
          <span className="wire-editor__scene-tag">SCENE: {caseObj.location}</span>
          <span className="wire-editor__clock">{caseObj.dateLogged}</span>
        </div>
        <h1 className="wire-editor__page-title">
          VISUAL EVIDENCE WORKBENCH
        </h1>
        <p className="wire-editor__sublead">
          Manipulate the current chain-head photograph using the React Image Editor. Click 
          <strong> &ldquo;Save&rdquo;</strong> in the editor toolbar, then record your official 
          headline claim to file your link.
        </p>
      </header>

      {/* THREE-ZONE WORKBENCH LAYOUT */}
      <div className="wire-editor__three-zone">
        
        {/* ======================================================== */}
        {/* ZONE 1 (LEFT): CASE CONTEXT                              */}
        {/* ======================================================== */}
        <aside className="wire-editor__zone-left" aria-label="Case Context">
          <div className="wire-context-card">
            <div className="wire-context-card__header">
              <span className="wire-context-card__title">CASE CONTEXT</span>
              <span className="wire-context-card__id">{caseObj.caseNumber}</span>
            </div>

            <div className="wire-context-card__body">
              <div className="wire-context-item">
                <span className="wire-context-label">EVIDENCE TITLE:</span>
                <span className="wire-context-val wire-context-val--bold">{caseObj.title}</span>
              </div>

              <div className="wire-context-item">
                <span className="wire-context-label">LOCATION:</span>
                <span className="wire-context-val">{caseObj.location}</span>
              </div>

              <div className="wire-context-item">
                <span className="wire-context-label">TIMESTAMP:</span>
                <span className="wire-context-val">{caseObj.dateLogged}</span>
              </div>

              <div className="wire-context-item">
                <span className="wire-context-label">BRIEFING:</span>
                <p className="wire-context-desc">{caseObj.originalCaption}</p>
              </div>

              <div className="wire-context-item">
                <span className="wire-context-label">EVIDENCE STATUS:</span>
                <div className="wire-context-status">
                  <Badge variant={hasSavedImage ? 'verified' : 'disputed'} size="sm">
                    {hasSavedImage ? 'BUFFER CAPTURED' : 'AWAITING EDIT'}
                  </Badge>
                </div>
              </div>

              <div className="wire-context-item">
                <span className="wire-context-label">BASELINE KEYWORDS:</span>
                <div className="wire-context-tags">
                  {caseObj.baselineTags.map((tag, i) => (
                    <span key={i} className="wire-context-tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* ZONE 2 (CENTER): IMAGE EDITOR                            */}
        {/* ======================================================== */}
        <main className="wire-editor__zone-center" aria-label="Image Editor Canvas">
          <div className="wire-canvas-frame">
            <div className="wire-canvas-frame__header">
              <div className="wire-canvas-frame__badge">
                <span className="wire-canvas-frame__bullet">■</span>
                <span>REACT IMAGE EDITOR // CANVAS</span>
              </div>
              <div className="wire-canvas-frame__tools-indicator">
                8 TOOLS LOADED
              </div>
            </div>

            {/* Save Status Banner */}
            {saveSuccessNotice && (
              <div className="wire-canvas-frame__success-banner" role="status">
                <span className="wire-success-icon">✓</span>
                <div className="wire-success-text">
                  <strong>EDIT SAVED:</strong> Evidence buffer captured successfully. Proceed to filing step below.
                </div>
              </div>
            )}

            {/* Loading / Decoding State */}
            {isPreparingImage && (
              <div className="wire-editor__loading-panel">
                <div className="wire-loading-spinner" />
                <p className="wire-loading-text">PREPARING EVIDENCE FRAME IN BUFFER...</p>
              </div>
            )}

            {/* Error Fallback Panel */}
            {editorLoadError && (
              <div className="wire-editor__error-panel">
                <h3>TERMINAL DECODE ERROR</h3>
                <p>
                  The editor encountered an issue decoding the witness filter frame.
                  You can fall back to the raw unedited negative to continue.
                </p>
                <div className="wire-editor__error-actions">
                  <Button variant="primary" size="sm" onClick={handleUseRawFallback}>
                    RELOAD WITH RAW NEGATIVE
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
                    RETRY
                  </Button>
                </div>
              </div>
            )}

            {/* Embedded Unlayer Image Editor */}
            {!isPreparingImage && editorImageUrl && !editorLoadError && (
              <div className="wire-editor__host">
                <ImageEditor
                  ref={editorRef}
                  image={editorImageUrl}
                  options={{ theme: 'dark' }}
                  minHeight={editorMinHeight}
                  onSave={handleEditorSave}
                  onCancel={handleEditorCancel}
                  onLoadError={handleEditorLoadError}
                  onError={(err) => {
                    console.warn('[Leonida Wire] Editor runtime error:', err);
                    setEditorLoadError(true);
                  }}
                />
              </div>
            )}

            <div className="wire-canvas-frame__footer">
              <span className="wire-canvas-engine-tag">@UNLAYER/REACT-IMAGE-EDITOR ENGINE</span>
              <span className="wire-canvas-hint">Click &ldquo;Save&rdquo; in the editor toolbar to capture changes</span>
            </div>
          </div>
        </main>

        {/* ======================================================== */}
        {/* ZONE 3 (RIGHT): EDIT IMPACT                              */}
        {/* ======================================================== */}
        <aside className="wire-editor__zone-right" aria-label="Edit Impact and Metrics">
          <div className="wire-impact-panel">
            <div className="wire-impact-panel__header">
              <span className="wire-impact-panel__title">EDIT IMPACT</span>
              <span className="wire-impact-panel__dot" />
            </div>

            {/* Tools Used / Suite */}
            <div className="wire-impact-section">
              <div className="wire-impact-section__label">TOOLS UNLOCKED</div>
              <div className="wire-impact-tools-grid">
                {['Crop', 'Filter', 'Draw', 'Text', 'Shapes', 'Stickers', 'Frame', 'Resize'].map((tool, i) => (
                  <span key={i} className="wire-tool-badge">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Editorial Signal Metrics */}
            <div className="wire-impact-section">
              <div className="wire-impact-section__label">EDITORIAL SIGNAL</div>
              <div className="wire-signal-list">
                <div className="wire-signal-row">
                  <span className="wire-signal-name">Visibility</span>
                  <span className="wire-signal-val wire-signal-val--amber">+{Math.min(95, 60 + (caseObj.chain.length * 8))}</span>
                </div>
                <div className="wire-signal-row">
                  <span className="wire-signal-name">Manipulation</span>
                  <span className="wire-signal-val wire-signal-val--crimson">+{hasSavedImage ? 85 : 45}</span>
                </div>
                <div className="wire-signal-row">
                  <span className="wire-signal-name">Focus</span>
                  <span className="wire-signal-val wire-signal-val--cyan">+{hasSavedImage ? 90 : 35}</span>
                </div>
                <div className="wire-signal-row wire-signal-row--highlight">
                  <span className="wire-signal-name">Base Drift</span>
                  <span className="wire-signal-val wire-signal-val--gold">+{driftAudit.score}%</span>
                </div>
              </div>
            </div>

            {/* Evidence State Progression */}
            <div className="wire-impact-section">
              <div className="wire-impact-section__label">EVIDENCE STATE</div>
              <div className="wire-state-flow">
                <div className="wire-state-step is-active">
                  <span className="wire-state-step__dot" />
                  <span className="wire-state-step__text">RAW RECORD</span>
                </div>
                <span className="wire-state-flow__arrow">↓</span>
                <div className={`wire-state-step ${hasSavedImage ? 'is-active is-saved' : 'is-pending'}`}>
                  <span className="wire-state-step__dot" />
                  <span className="wire-state-step__text">
                    {hasSavedImage ? '✓ EDITED (BUFFER SAVED)' : 'AWAITING EDIT'}
                  </span>
                </div>
                <span className="wire-state-flow__arrow">↓</span>
                <div className={`wire-state-step ${canSubmit ? 'is-active is-ready' : 'is-pending'}`}>
                  <span className="wire-state-step__dot" />
                  <span className="wire-state-step__text">FILED TO WIRE</span>
                </div>
              </div>
            </div>

            {/* Impact Actions */}
            <div className="wire-impact-actions">
              <Button
                variant="evidence"
                size="md"
                onClick={handleResetEdit}
              >
                RESET BUFFER
              </Button>
            </div>
          </div>
        </aside>

      </div>

      {/* ======================================================== */}
      {/* FOCUSED FILING STEP: HEADLINE & TRANSMISSION              */}
      {/* ======================================================== */}
      <section 
        className="wire-filing-section" 
        ref={filingSectionRef}
        aria-label="File Wire Despatch"
      >
        <div className="wire-filing-card">
          <div className="wire-filing-card__header">
            <div>
              <span className="wire-filing-card__seq">STEP 02 // PRESS TRANSMISSION</span>
              <h2 className="wire-filing-card__title">FILE YOUR WIRE DESPATCH</h2>
            </div>
            <Badge variant={canSubmit ? 'verified' : 'disputed'} size="sm">
              {canSubmit ? 'READY TO TRANSMIT' : 'REQUIREMENTS PENDING'}
            </Badge>
          </div>

          <form onSubmit={handleSubmitReport} className="wire-filing-form">
            <div className="wire-filing-form__grid">
              {/* Byline */}
              <div className="wire-form-group">
                <label htmlFor="wire-author-input" className="wire-form-label">
                  REPORTER BYLINE / ALIAS:
                </label>
                <input
                  id="wire-author-input"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="wire-form-input"
                  placeholder="e.g. YOU (LEONIDA WIRE AGENT)"
                  maxLength={60}
                  required
                />
              </div>

              {/* Classification Tag */}
              <div className="wire-form-group">
                <label className="wire-form-label">
                  TRANSMISSION CHANNEL:
                </label>
                <input
                  type="text"
                  disabled
                  value="LEONIDA STATE INVESTIGATIVE DESPATCH // UNRESTRICTED"
                  className="wire-form-input wire-form-input--readonly"
                />
              </div>
            </div>

            {/* Headline / Story Claim */}
            <div className="wire-form-group">
              <div className="wire-form-label-row">
                <label htmlFor="wire-caption-input" className="wire-form-label">
                  HEADLINE / CAPTION CLAIM:
                </label>
                <span className="wire-char-counter">
                  {caption.length} / 280 CHARACTERS
                </span>
              </div>
              <textarea
                id="wire-caption-input"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="wire-form-textarea"
                placeholder="Write your definitive headline claim explaining what the edited photograph shows... (e.g. 'BREAKING: High-speed coastal submersible prototype intercepted at marina slipway...')"
                maxLength={280}
                required
              />
            </div>

            {/* Pre-flight Checklist */}
            <div className="wire-filing-checklist">
              <div className={`wire-checklist-item ${hasSavedImage ? 'is-valid' : 'is-pending'}`}>
                <span className="wire-checklist-mark">{hasSavedImage ? '✓' : '○'}</span>
                <span>Visual edit saved in editor buffer</span>
              </div>
              <div className={`wire-checklist-item ${caption.trim().length > 0 ? 'is-valid' : 'is-pending'}`}>
                <span className="wire-checklist-mark">{caption.trim().length > 0 ? '✓' : '○'}</span>
                <span>Headline claim formulated</span>
              </div>
            </div>

            {/* Save Preview Thumbnail If Available */}
            {savedDataUrl && (
              <div className="wire-filing-preview-strip">
                <div className="wire-filing-preview-thumb-box">
                  <img
                    src={savedDataUrl}
                    alt="Captured buffer"
                    className="wire-filing-preview-thumb"
                  />
                  <div className="wire-filing-preview-stamp">BUFFER READY</div>
                </div>
                <div className="wire-filing-preview-info">
                  <span className="wire-filing-preview-author">Byline: {authorName}</span>
                  <p className="wire-filing-preview-quote">
                    &ldquo;{caption || 'Awaiting headline claim...'}&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="wire-filing-action-bar">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!canSubmit || isSubmitting}
                icon={<span>→</span>}
              >
                {isSubmitting ? 'TRANSMITTING REPORT...' : 'FILE YOUR EDIT • EXPOSE WIRE DRIFT'}
              </Button>

              {!canSubmit && (
                <div className="wire-filing-pending-tip">
                  {!hasSavedImage
                    ? '(!) Step 1 incomplete: Click "Save" inside the React Image Editor above.'
                    : '(!) Step 2 incomplete: Type a story headline in the caption box above to enable filing.'}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
