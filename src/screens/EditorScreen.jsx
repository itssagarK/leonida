import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageEditor from '@unlayer/react-image-editor';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress, saveCaseProgress } from '../utils/storage';
import { getAbsoluteImageUrl, renderFilteredImageToDataUrl } from '../utils/imageHelpers';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Divider from '../components/common/Divider';
import RedactionBar from '../components/common/RedactionBar';
import './EditorScreen.css';

export default function EditorScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const caseObj = useMemo(() => getCaseById(id), [id]);
  const playerProgress = useMemo(() => getCaseProgress(caseObj.id), [caseObj.id]);
  const fullChain = useMemo(() => getEffectiveChain(caseObj, playerProgress), [caseObj, playerProgress]);

  // The latest link before player's new edit
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
  const [editorLoadSuccess, setEditorLoadSuccess] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [editorMinHeight, setEditorMinHeight] = useState(
    typeof window !== 'undefined' && window.innerWidth < 640 ? 500 : 620
  );

  useEffect(() => {
    const handleResize = () => {
      setEditorMinHeight(window.innerWidth < 640 ? 500 : 620);
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
        // If player already edited before, load their previous edit
        if (playerProgress?.playerLink?.imageDataUrl) {
          if (!isCancelled) {
            setEditorImageUrl(playerProgress.playerLink.imageDataUrl);
            setIsPreparingImage(false);
          }
          return;
        }

        // Otherwise bake the latest witness's CSS filter into a clean canvas dataUrl
        // so the player edits the actual distorted witness image
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
  const handleEditorSave = ({ dataUrl, blob }) => {
    setSavedDataUrl(dataUrl);
    setHasSavedImage(true);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
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

  // Fallback to raw original if filtered canvas fails
  const handleUseRawFallback = () => {
    setEditorLoadError(false);
    setEditorImageUrl(getAbsoluteImageUrl(caseObj.originalImage));
  };

  // Validation: both saved image AND non-empty caption required
  const canSubmit = hasSavedImage && Boolean(savedDataUrl) && Boolean(caption.trim());

  // Form submission: save to localStorage and navigate to drift status
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const newPlayerLink = {
      author: authorName.trim() || 'YOU (LEONIDA WIRE AGENT)',
      caption: caption.trim(),
      imageDataUrl: savedDataUrl,
      timestamp: new Date().toISOString(),
      toolsUsed: ['React Image Editor (Unlayer)', 'Custom Player Distortion']
    };

    saveCaseProgress(caseObj.id, {
      playerLink: newPlayerLink,
      submittedAt: new Date().toISOString()
    });

    navigate(`/case/${caseObj.id}/status`);
  };

  return (
    <div className="wire-editor-screen">
      {/* Top Breadcrumb & Status */}
      <div className="wire-editor__nav">
        <Link to={`/case/${caseObj.id}/custody`} className="wire-editor__back-link">
          &larr; CANCEL &amp; RETURN TO CUSTODY LOG
        </Link>
        <div className="wire-editor__status-pill">
          <span className="wire-editor__status-dot" />
          <span>EVIDENTIARY TERMINAL // LIVE</span>
        </div>
      </div>

      {/* Surrounding Chrome Header */}
      <header className="wire-editor__chrome-header">
        <div className="wire-editor__badge-strip">
          <Badge variant="wire">TERMINAL LINK #{fullChain.length}</Badge>
          <span className="wire-editor__dossier-ref">{caseObj.caseNumber}</span>
          <span className="wire-editor__dateline">{caseObj.location}</span>
        </div>

        <h1 className="wire-editor__title">
          FILING YOUR REPORT — CASE: {caseObj.title}
        </h1>

        <p className="wire-editor__instruction">
          You are adding the newest link in the chain. Use the complete{' '}
          <strong>React Image Editor</strong> below to crop, filter, annotate, or alter the
          photograph. When finished editing, click the <strong>&ldquo;Save&rdquo;</strong> button inside
          the editor, then draft your wire headline claim below.
        </p>

        <Divider variant="evidence" spacing="sm" />
      </header>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="wire-editor__save-toast">
          <span className="wire-toast-icon">&#10003;</span>
          <span>IMAGE EDIT SAVED TO TERMINAL BUFFER! WRITE YOUR CAPTION BELOW TO FILE.</span>
        </div>
      )}

      {/* IMAGE EDITOR CONTAINER */}
      <div className="wire-editor__workbench">
        <div className="wire-editor__workbench-topbar">
          <div className="wire-editor__workbench-tag">
            <span>TERMINAL WORKSPACE</span>
            <span className="wire-editor__tools-count">[8 CREATIVE TOOLS UNLOCKED]</span>
          </div>

          <div className="wire-editor__save-status">
            {hasSavedImage ? (
              <Badge variant="verified" size="sm">
                EDIT SAVED IN BUFFER
              </Badge>
            ) : (
              <Badge variant="disputed" size="sm">
                AWAITING EDITOR SAVE
              </Badge>
            )}
          </div>
        </div>

        {/* Loading Spinner / Preparing State */}
        {isPreparingImage && (
          <div className="wire-editor__loading-state">
            <div className="wire-spinner" />
            <p>PREPARING HIGH-RESOLUTION EVIDENCE FRAME...</p>
          </div>
        )}

        {/* Load Error State */}
        {editorLoadError && (
          <div className="wire-editor__error-panel">
            <h3>TERMINAL DECODE ERROR</h3>
            <p>
              The editor encountered an issue decoding the witness filter frame.
              You can fall back to the raw unedited negative to continue your investigation.
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

        {/* The Real Unlayer ImageEditor Component */}
        {!isPreparingImage && editorImageUrl && !editorLoadError && (
          <div className="wire-editor__component-host">
            <ImageEditor
              ref={editorRef}
              image={editorImageUrl}
              options={{ theme: 'dark' }}
              minHeight={editorMinHeight}
              onSave={handleEditorSave}
              onCancel={handleEditorCancel}
              onLoadError={handleEditorLoadError}
              onLoad={() => setEditorLoadSuccess(true)}
              onError={(err) => {
                console.warn('[Leonida Wire] Editor runtime notice:', err);
              }}
            />
          </div>
        )}

        <div className="wire-editor__workbench-footnote">
          <span>POWERED BY @UNLAYER/REACT-IMAGE-EDITOR</span>
          <span>FULL SUITE: CROP &bull; RESIZE &bull; FILTER &bull; DRAW &bull; TEXT &bull; SHAPES &bull; STICKERS &bull; FRAME</span>
        </div>
      </div>

      {/* FILING FORM: CAPTION & SUBMISSION */}
      <section className="wire-editor__filing-section">
        <form onSubmit={handleSubmitReport} className="wire-editor__form">
          <div className="wire-editor__form-header">
            <h2>STEP 2: DECLARE YOUR WIRE HEADLINE</h2>
            <span className="wire-editor__form-seq">[MANDATORY PRESS DECLARATION]</span>
          </div>

          <div className="wire-editor__field-group">
            <label htmlFor="wire-author" className="wire-editor__label">
              REPORTER BYLINE / ALIAS:
            </label>
            <input
              id="wire-author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="wire-editor__input-text"
              placeholder="e.g. YOU (LEONIDA WIRE AGENT) or @vice_investigator"
              maxLength={60}
              required
            />
          </div>

          <div className="wire-editor__field-group">
            <div className="wire-editor__label-row">
              <label htmlFor="wire-caption" className="wire-editor__label">
                YOUR CAPTION / STORY CLAIM:
              </label>
              <span className="wire-editor__char-count">
                {caption.length} / 280 CHARS
              </span>
            </div>
            <textarea
              id="wire-caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="wire-editor__textarea"
              placeholder="Write your definitive headline claim explaining what the photograph really shows... (e.g. 'CONFIDENTIAL LEAK: Coastal surveillance footage proves undercover submarine prototype extraction...')"
              maxLength={280}
              required
            />
          </div>

          {/* Submission Pre-Flight Checklist */}
          <div className="wire-editor__checklist">
            <div className={`wire-check-item ${hasSavedImage ? 'is-valid' : 'is-pending'}`}>
              <span className="wire-check-box">{hasSavedImage ? '✓' : '○'}</span>
              <span>Visual edit applied and saved via Image Editor &ldquo;Save&rdquo; button</span>
            </div>
            <div className={`wire-check-item ${caption.trim().length > 0 ? 'is-valid' : 'is-pending'}`}>
              <span className="wire-check-box">{caption.trim().length > 0 ? '✓' : '○'}</span>
              <span>Headline caption claim formulated</span>
            </div>
          </div>

          {/* Player Edit Preview Thumbnail if saved */}
          {savedDataUrl && (
            <div className="wire-editor__saved-preview">
              <span className="wire-editor__saved-tag">CAPTURED EDIT READY TO TRANSMIT:</span>
              <div className="wire-editor__saved-thumb-row">
                <img
                  src={savedDataUrl}
                  alt="Player edit preview"
                  className="wire-editor__saved-thumb"
                />
                <div className="wire-editor__saved-details">
                  <Badge variant="verified" size="sm">BUFFER LOADED</Badge>
                  <p className="wire-editor__saved-author">Byline: {authorName}</p>
                  <p className="wire-editor__saved-caption-preview">
                    &ldquo;{caption || 'No caption drafted yet'}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="wire-editor__submit-row">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              icon={<span>&gt;&gt;</span>}
            >
              FILE YOUR EDIT &bull; EXPOSE WIRE DRIFT
            </Button>

            {!canSubmit && (
              <p className="wire-editor__disabled-hint">
                {!hasSavedImage
                  ? '(!) Use the editor above to modify the photo and click "Save" inside the editor first.'
                  : '(!) Draft your wire headline in the caption box above to proceed.'}
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
