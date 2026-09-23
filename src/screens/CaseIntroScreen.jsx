import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, getEffectiveChain, getAllCases } from '../data/cases';
import { getCaseProgress, clearCaseProgress } from '../utils/storage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './CaseIntroScreen.css';

export default function CaseIntroScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const caseObj = useMemo(() => getCaseById(id), [id]);
  const playerProgress = useMemo(() => getCaseProgress(caseObj.id), [caseObj.id, refreshTrigger]);
  const fullChain = useMemo(() => getEffectiveChain(caseObj, playerProgress), [caseObj, playerProgress]);
  const allCases = getAllCases();

  useEffect(() => {
    const handleProgressChange = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('wire_progress_updated', handleProgressChange);
    return () => window.removeEventListener('wire_progress_updated', handleProgressChange);
  }, []);

  const latestLink = fullChain[fullChain.length - 1];
  const witnessCount = caseObj.chain.length;
  const hasPlayerEdited = Boolean(playerProgress && playerProgress.playerLink);

  const handleResetCase = () => {
    if (window.confirm('Reset this case and remove your filed report?')) {
      clearCaseProgress(caseObj.id);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="wire-case-intro wire-page-container">
      {/* Top Dossier Breadcrumb Navigation */}
      <div className="wire-case-intro__nav">
        <Link to="/cases" className="wire-case-intro__back-link">
          ← BACK TO CASE FILES
        </Link>
        <div className="wire-case-intro__dossier-switcher">
          <span className="wire-case-intro__switcher-label">DOSSIER:</span>
          {allCases.map((c) => (
            <Link
              key={c.id}
              to={`/case/${c.id}`}
              className={`wire-case-intro__switcher-btn ${
                c.id === caseObj.id ? 'is-active' : ''
              }`}
            >
              {c.caseNumber}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <header className="wire-case-intro__header">
        <div className="wire-case-intro__meta-strip">
          <Badge variant="wire">{caseObj.caseNumber}</Badge>
          <span className="wire-case-intro__loc">SCENE: {caseObj.location}</span>
          <span className="wire-case-intro__timestamp">{caseObj.dateLogged}</span>
          {hasPlayerEdited ? (
            <div className="wire-case-intro__status-action-row">
              <Badge variant="verified" stamp rotate={-2}>
                PLAYER SUBMISSION ON FILE
              </Badge>
              <button
                onClick={handleResetCase}
                className="wire-case-intro__reset-btn"
                title="Reset this case to initial witness state"
              >
                [RESET THIS CASE]
              </button>
            </div>
          ) : (
            <Badge variant="disputed" stamp rotate={-2}>
              EVIDENCE DRIFT ACTIVE
            </Badge>
          )}
        </div>

        <h1 className="wire-case-intro__title">{caseObj.title}</h1>
        <p className="wire-case-intro__subtitle">{caseObj.subtitle}</p>
      </header>

      {/* Evidentiary Chain Progression Gauge */}
      <div className="wire-case-intro__gauge">
        <div className="wire-case-intro__gauge-stat">
          <span className="wire-case-intro__gauge-num">{witnessCount}</span>
          <div className="wire-case-intro__gauge-label">
            WITNESS EDITS LOGGED IN CUSTODY CHAIN
          </div>
        </div>

        <div className="wire-case-intro__gauge-nodes">
          <div className="wire-gauge-node is-original">
            <span className="wire-gauge-node__dot" />
            <span className="wire-gauge-node__text">Raw Record</span>
          </div>
          {caseObj.chain.map((link, idx) => (
            <React.Fragment key={link.id}>
              <span className="wire-gauge-arrow">→</span>
              <div className="wire-gauge-node is-witness">
                <span className="wire-gauge-node__dot" />
                <span className="wire-gauge-node__text">Witness #{idx + 1}</span>
              </div>
            </React.Fragment>
          ))}
          <span className="wire-gauge-arrow">→</span>
          <div className={`wire-gauge-node is-player ${hasPlayerEdited ? 'is-complete' : 'is-pending'}`}>
            <span className="wire-gauge-node__dot" />
            <span className="wire-gauge-node__text">
              {hasPlayerEdited ? 'Your Filed Edit' : 'Your Link'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Chain-Head Image Preview Card */}
      <div className="wire-case-intro__preview-card">
        <div className="wire-case-intro__preview-header">
          <span className="wire-case-intro__preview-tag">
            CURRENT CHAIN-HEAD // EVIDENCE BUFFER
          </span>
          <Badge variant={latestLink.isPlayerSubmission ? 'verified' : 'disputed'} size="sm">
            {latestLink.isPlayerSubmission ? 'PLAYER REPORT' : `WITNESS #${latestLink.step}`}
          </Badge>
        </div>

        <div className="wire-case-intro__preview-viewport">
          {latestLink.imageDataUrl ? (
            <img
              src={latestLink.imageDataUrl}
              alt="Current chain state"
              className="wire-case-intro__preview-img"
            />
          ) : (
            <img
              src={caseObj.originalImage}
              alt="Current chain state"
              className="wire-case-intro__preview-img"
              style={{ filter: latestLink.filterStyle || 'none' }}
            />
          )}

          <div className="wire-case-intro__preview-overlay-stamp">
            <Badge variant="wire" stamp rotate={3} size="md">
              LATEST CLAIM
            </Badge>
          </div>
        </div>

        <div className="wire-case-intro__preview-caption-panel">
          <div className="wire-case-intro__caption-meta">
            <span className="wire-case-intro__caption-author">
              {latestLink.author} ({latestLink.handle}) • {latestLink.role}
            </span>
            <span className="wire-case-intro__caption-time">{latestLink.timestamp}</span>
          </div>
          <p className="wire-case-intro__caption-text">
            “{latestLink.caption}”
          </p>
          <div className="wire-case-intro__caption-tools">
            <span className="wire-case-intro__tools-label">APPLIED MUTATIONS:</span>
            {latestLink.toolsUsed.map((tool, idx) => (
              <span key={idx} className="wire-tool-pill">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Dispatch Actions */}
      <div className="wire-case-intro__actions">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(`/case/${caseObj.id}/custody`)}
          icon={<span>→</span>}
        >
          OPEN CUSTODY LOG &amp; SCRUB SLIDER
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate(`/case/${caseObj.id}/edit`)}
          icon={<span>✎</span>}
        >
          ADD YOUR LINK (EDITOR)
        </Button>
      </div>
    </div>
  );
}
