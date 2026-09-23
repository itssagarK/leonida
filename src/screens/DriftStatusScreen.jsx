import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress } from '../utils/storage';
import { computeDrift } from '../lib/driftEngine';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Divider from '../components/common/Divider';
import RedactionBar from '../components/common/RedactionBar';
import './DriftStatusScreen.css';

export default function DriftStatusScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const caseObj = useMemo(() => getCaseById(id), [id]);
  const playerProgress = useMemo(() => getCaseProgress(caseObj.id), [caseObj.id]);
  const fullChain = useMemo(() => getEffectiveChain(caseObj, playerProgress), [caseObj, playerProgress]);

  // Compute truth drift analysis
  const driftResult = useMemo(
    () => computeDrift(caseObj, fullChain),
    [caseObj, fullChain]
  );

  const playerLink = fullChain.find((l) => l.isPlayerSubmission) || fullChain[fullChain.length - 1];

  return (
    <div className="wire-drift-status">
      {/* Top Ledger Navigation */}
      <div className="wire-drift-status__nav">
        <Link to={`/case/${caseObj.id}/custody`} className="wire-drift-status__back-link">
          &larr; BACK TO CUSTODY SCRUBBER
        </Link>
        <div className="wire-drift-status__chain-indicator">
          <span>AUDIT DOSSIER: <strong>{caseObj.caseNumber}</strong></span>
          <span className="wire-drift-status__sep">//</span>
          <span>STATUS: <strong>SEALED &amp; TRANSMITTED</strong></span>
        </div>
      </div>

      {/* Main Audit Masthead */}
      <header className="wire-drift-status__header">
        <div className="wire-drift-status__badge-row">
          <Badge variant="wire">LEONIDA WIRE TRANSMISSION AUDIT</Badge>
          <span className="wire-drift-status__case-id">
            CHAIN LENGTH: {fullChain.length} STAGES
          </span>
        </div>

        <h1 className="wire-drift-status__title">
          TRUTH DRIFT ANALYSIS // REPORT CERTIFIED
        </h1>

        <Divider variant="evidence" spacing="md" />

        {!hasPlayerLink && (
          <div className="wire-drift-status__lock-banner">
            <div className="wire-drift-status__lock-tag">
              [!] CASE AUDIT INCOMPLETE &bull; AWAITING YOUR REPORT
            </div>
            <p>
              This case has not yet been sealed. The React Image Editor is the only way to advance
              the wire and complete the chain of custody. File your visual edit to unlock your
              certified drift verdict.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/case/${caseObj.id}/edit`)}
              icon={<span>&gt;&gt;</span>}
            >
              LAUNCH REACT IMAGE EDITOR &bull; ADD YOUR LINK
            </Button>
          </div>
        )}
      </header>

      {/* BIG STAMPED VERDICT HERO */}
      <section className="wire-drift-verdict">
        <div className="wire-drift-verdict__stamp-container">
          <Badge
            variant={driftResult.status.variant}
            stamp
            rotate={driftResult.status.stampRotate}
            size="lg"
            className="wire-drift-verdict__stamp"
          >
            {driftResult.status.label}
          </Badge>
          <span className="wire-drift-verdict__stamp-sub">PUBLIC RECORD RATING</span>
        </div>

        <div className="wire-drift-verdict__score-panel">
          <div className="wire-drift-verdict__meter-wrap">
            <span className="wire-drift-verdict__score-val">{driftResult.score}%</span>
            <span className="wire-drift-verdict__score-lbl">COMPUTED DRIFT INDEX</span>
          </div>

          <p className="wire-drift-verdict__tone">
            &ldquo;{driftResult.status.tone}&rdquo;
          </p>

          <p className="wire-drift-verdict__explanation">
            {driftResult.explanation}
          </p>
        </div>
      </section>

      {/* METRIC BREAKDOWN & KEYWORD AUDIT */}
      <section className="wire-drift-metrics">
        <div className="wire-drift-metrics__col">
          <h3>EVIDENTIARY DECAY FACTORS</h3>
          <div className="wire-drift-factor-list">
            <div className="wire-drift-factor">
              <span className="wire-drift-factor__name">Chain Length Drag ({driftResult.chainLength} links):</span>
              <span className="wire-drift-factor__val">+{driftResult.breakdown.lengthFactor} pts</span>
            </div>
            <div className="wire-drift-factor">
              <span className="wire-drift-factor__name">Original Semantic Decay:</span>
              <span className="wire-drift-factor__val">+{driftResult.breakdown.originalDecay} pts</span>
            </div>
            <div className="wire-drift-factor">
              <span className="wire-drift-factor__name">Inter-Witness Volatility:</span>
              <span className="wire-drift-factor__val">+{driftResult.breakdown.stepVolatility} pts</span>
            </div>
            <div className="wire-drift-factor">
              <span className="wire-drift-factor__name">Sensational Clout Amplification:</span>
              <span className="wire-drift-factor__val">+{driftResult.breakdown.sensationalBonus} pts</span>
            </div>
          </div>
        </div>

        <div className="wire-drift-metrics__col">
          <h3>LEXICAL FORENSICS</h3>
          <div className="wire-drift-keywords-section">
            <div>
              <span className="wire-drift-kw-tag">SURVIVING BASELINE WORDS:</span>
              <div className="wire-drift-pills">
                {driftResult.retainedWords.length > 0 ? (
                  driftResult.retainedWords.map((w, i) => (
                    <span key={i} className="wire-drift-pill wire-drift-pill--retained">
                      {w}
                    </span>
                  ))
                ) : (
                  <span className="wire-drift-kw-none">[0% RETENTION - ALL BASELINE WORDS ERASED]</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span className="wire-drift-kw-tag">MUTATED SENSATIONAL WORDS:</span>
              <div className="wire-drift-pills">
                {driftResult.mutatedWords.map((w, i) => (
                  <span key={i} className="wire-drift-pill wire-drift-pill--mutated">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST LINK SUMMARY */}
      <section className="wire-drift-summary">
        <div className="wire-drift-summary__header">
          <span>YOUR FILED EVIDENCE RECORD</span>
          <Badge variant="verified" size="sm">TRANSMITTED LINK #{fullChain.length}</Badge>
        </div>

        <div className="wire-drift-summary__body">
          <div className="wire-drift-summary__img-wrap">
            <img
              src={playerLink.imageDataUrl || caseObj.originalImage}
              alt="Player submitted report"
              className="wire-drift-summary__img"
            />
          </div>

          <div className="wire-drift-summary__meta">
            <div className="wire-drift-summary__byline">
              <span>REPORTER BYLINE:</span>
              <strong>{playerLink.author}</strong>
            </div>

            <blockquote className="wire-drift-summary__quote">
              &ldquo;{playerLink.caption}&rdquo;
            </blockquote>

            <div className="wire-drift-summary__note">
              <span>CHAIN DELTA:</span>
              <p>
                From &ldquo;{caseObj.originalCaption}&rdquo; &rarr; Final filed headline claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPOSE THE WIRE PRIMARY CALL TO ACTION */}
      <div className="wire-drift-status__actions">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(`/case/${caseObj.id}/reveal`)}
          icon={<span>&gt;&gt;</span>}
        >
          EXPOSE THE WIRE &bull; UNROLL THE FULL STORY
        </Button>

        <div className="wire-drift-status__sub-actions">
          <Link to={`/case/${caseObj.id}/custody`}>
            <Button variant="secondary" size="md">
              INSPECT IN CUSTODY SCRUBBER
            </Button>
          </Link>
          <Link to={`/case/${caseObj.id}/edit`}>
            <Button variant="evidence" size="md">
              RE-EDIT IN IMAGE EDITOR
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
