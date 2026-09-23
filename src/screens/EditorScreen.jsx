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

const ALL_EDITOR_TOOLS = [
  'Crop',
  'Resize',
  'Filter',
  'Draw',
  'Text',
  'Shapes',
  'Stickers',
  'Frame'
];

export default function EditorScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const editorHostRef = useRef(null);
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

  // Live tracking of used tools
  const [usedTools, setUsedTools] = useState(() => {
    if (playerProgress?.playerLink?.toolsUsed) {
      const detected = ALL_EDITOR_TOOLS.filter((tool) =>
        playerProgress.playerLink.toolsUsed.some((t) =>
          t.toLowerCase().includes(tool.toLowerCase())
        )
      );
      return new Set(detected.length > 0 ? detected : ['Crop', 'Filter']);
    }
    return new Set();
  });

  useEffect(() => {
    const handleResize = () => {
      setEditorMinHeight(window.innerWidth < 768 ? 520 : 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for user interactions inside editor container to mark tools as used
  useEffect(() => {
    const hostEl = editorHostRef.current;
    if (!hostEl) return;

    const handleInteraction = (e) => {
      let target = e.target;
      let depth = 0;
      while (target && target !== hostEl && depth < 6) {
        const text = (
          (target.innerText || '') + ' ' +
          (target.title || '') + ' ' +
          (target.getAttribute?.('aria-label') || '') + ' ' +
          (target.className || '')
        ).toLowerCase();

        for (const tool of ALL_EDITOR_TOOLS) {
          const key = tool.toLowerCase();
          if (
            text.includes(key) ||
            (key === 'draw' && (text.includes('brush') || text.includes('pen'))) ||
            (key === 'shapes' && (text.includes('rect') || text.includes('circle') || text.includes('arrow'))) ||
            (key === 'stickers' && text.includes('icon')) ||
            (key === 'filter' && text.includes('effect'))
          ) {
            setUsedTools((prev) => new Set([...prev, tool]));
            break;
          }
        }
        target = target.parentElement;
        depth++;
      }
    };

    hostEl.addEventListener('click', handleInteraction, true);
    return () => hostEl.removeEventListener('click', handleInteraction, true);
  }, [editorImageUrl]);

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

    // If no tools explicitly detected yet, confirm default creative tools
    setUsedTools((prev) => {
      if (prev.size === 0) {
        return new Set(['Crop', 'Filter']);
      }
      return prev;
    });

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

  // Reset current edit buffer cleanly
  const handleResetEdit = () => {
    if (window.confirm('Reset your edit buffer back to the raw record?')) {
      setSavedDataUrl(null);
      setHasSavedImage(false);
      setSaveSuccessNotice(false);
      setUsedTools(new Set());
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

  // Deterministic live Editorial Signal calculations tied to user actions
  const toolsCount = usedTools.size;
  const liveSignals = useMemo(() => {
    if (hasSavedImage) {
      return {
        visibility: Math.min(95, 65 + (toolsCount * 5)),
        focus: Math.min(95, 50 + (toolsCount * 7)),
        manipulation: Math.min(98, 55 + (toolsCount * 8)),
        baseDrift: Math.min(99, driftAudit.score + (toolsCount * 2))
      };
    }
    return {
      visibility: Math.min(80, 50 + (toolsCount * 4)),
      focus: Math.min(75, 40 + (toolsCount * 5)),
      manipulation: Math.min(60, 20 + (toolsCount * 6)),
      baseDrift: driftAudit.score
    };
  }, [hasSavedImage, toolsCount, driftAudit.score]);

  // Validation: both saved image AND non-empty headline required
  const isHeadlineValid = Boolean(caption.trim());
  const canSubmit = hasSavedImage && Boolean(savedDataUrl) && isHeadlineValid;

  // Form submission: save to localStorage and navigate to drift status
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);

    const toolsArray = usedTools.size > 0
      ? Array.from(usedTools).map((t) => `${t} (React Image Editor)`)
      : ['React Image Editor (Unlayer)', 'Custom Player Distortion'];

    const newPlayerLink = {
      author: authorName.trim() || 'YOU (LEONIDA WIRE AGENT)',
      caption: caption.trim(),
      imageDataUrl: savedDataUrl,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' EST',
      toolsUsed: toolsArray
    };

    saveCaseProgress(caseObj.id, {
      playerLink: newPlayerLink,
      submittedAt: new Date().toISOString()
    });

    navigate(`/case/${caseObj.id}/status`);
  };

  // Determine which single state is active
  const isFiled = Boolean(playerProgress?.playerLink && hasSavedImage);
  const isEditedOnly = hasSavedImage && !isFiled;
  const isRawActive = !hasSavedImage;

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
          Your edit becomes part of the public record. Manipulate the image using the React Image Editor,
          save your edit, and file your claim to expose cumulative drift.
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
                    {hasSavedImage ? 'BUFFER CAPTURED' : 'RAW RECORD'}
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

            {/* Clear Core Interaction Prompt Banner */}
            <div className="wire-canvas-frame__lore-bar">
              <span className="wire-lore-icon">⚡</span>
              <span className="wire-lore-text">
                Your edit becomes part of the public record. Use the tools below to modify the image, then click &ldquo;Save&rdquo;.
              </span>
            </div>

            {/* Save Status Banner */}
            {saveSuccessNotice && (
              <div className="wire-canvas-frame__success-banner" role="status">
                <span className="wire-success-icon">✓</span>
                <div className="wire-success-text">
                  <strong>EDIT SAVED:</strong> Evidence buffer captured successfully.
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
              <div className="wire-editor__host" ref={editorHostRef}>
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

            {/* Tools Used / Live State */}
            <div className="wire-impact-section">
              <div className="wire-impact-section__header-row">
                <span className="wire-impact-section__label">TOOLS USED</span>
                <span className="wire-impact-section__count">[{usedTools.size} ACTIVE]</span>
              </div>
              <div className="wire-impact-tools-list">
                {ALL_EDITOR_TOOLS.map((tool) => {
                  const isUsed = usedTools.has(tool);
                  return (
                    <div
                      key={tool}
                      className={`wire-tool-row ${isUsed ? 'is-used' : 'is-muted'}`}
                    >
                      <span className="wire-tool-status-mark">
                        {isUsed ? '✓' : '○'}
                      </span>
                      <span className="wire-tool-name">{tool.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editorial Signal Metrics (Deterministic & Live) */}
            <div className="wire-impact-section">
              <div className="wire-impact-section__label">EDITORIAL SIGNAL</div>
              <div className="wire-signal-list">
                <div className="wire-signal-row">
                  <span className="wire-signal-name">Visibility</span>
                  <span className="wire-signal-val wire-signal-val--amber">+{liveSignals.visibility}</span>
                </div>
                <div className="wire-signal-row">
                  <span className="wire-signal-name">Focus</span>
                  <span className="wire-signal-val wire-signal-val--cyan">+{liveSignals.focus}</span>
                </div>
                <div className="wire-signal-row">
                  <span className="wire-signal-name">Manipulation</span>
                  <span className="wire-signal-val wire-signal-val--crimson">+{liveSignals.manipulation}</span>
                </div>
                <div className="wire-signal-row wire-signal-row--highlight">
                  <span className="wire-signal-name">Base Drift</span>
                  <span className="wire-signal-val wire-signal-val--gold">+{liveSignals.baseDrift}%</span>
                </div>
              </div>
            </div>

            {/* Evidence State Progression (Strictly One Active) */}
            <div className="wire-impact-section">
              <div className="wire-impact-section__label">EVIDENCE STATE</div>
              <div className="wire-state-flow">
                <div className={`wire-state-step ${isRawActive ? 'is-active-step is-raw' : 'is-dormant'}`}>
                  <span className="wire-state-step__dot" />
                  <span className="wire-state-step__text">RAW RECORD</span>
                </div>
                <span className="wire-state-flow__arrow">↓</span>
                <div className={`wire-state-step ${isEditedOnly ? 'is-active-step is-saved' : 'is-dormant'}`}>
                  <span className="wire-state-step__dot" />
                  <span className="wire-state-step__text">EDITED / BUFFER SAVED</span>
                </div>
                <span className="wire-state-flow__arrow">↓</span>
                <div className={`wire-state-step ${isFiled ? 'is-active-step is-filed' : 'is-dormant'}`}>
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
              {canSubmit ? 'READY TO TRANSMIT' : hasSavedImage ? 'HEADLINE REQUIRED' : 'SAVE EDIT FIRST'}
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
              <div className={`wire-checklist-item ${isHeadlineValid ? 'is-valid' : 'is-pending'}`}>
                <span className="wire-checklist-mark">{isHeadlineValid ? '✓' : '○'}</span>
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
                    ? 'Save an edited image before filing.'
                    : 'Enter a headline claim above to complete filing.'}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
