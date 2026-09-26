import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseById, getEffectiveChain } from '../data/cases';
import { getCaseProgress } from '../utils/storage';
import { computeDrift } from '../lib/driftEngine';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
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

  const hasPlayerLink = Boolean(fullChain.find((l) => l.isPlayerSubmission));
  const playerLink = fullChain.find((l) => l.isPlayerSubmission) || fullChain[fullChain.length - 1];

  return (
    <div className="wire-drift wire-page-container">
      {/* Top Breadcrumb & Status */}
      <div className="wire-drift__topbar">
        <Link to={`/case/${caseObj.id}/custody`} className="wire-drift__back-link">
          ← BACK TO CUSTODY LOG
        </Link>
        <div className="wire-drift__case-tag">
          <span>AUDIT DOSSIER: <strong>{caseObj.caseNumber}</strong></span>
          <span className="wire-drift__sep">//</span>
          <span>STATUS: <strong>SEALED &amp; TRANSMITTED</strong></span>
        </div>
      </div>

      {/* Screen Masthead */}
      <header className="wire-drift__header">
        <div className="wire-drift__badge-row">
          <Badge variant="wire">LEONIDA TRANSMISSION AUDIT</Badge>
          <span className="wire-drift__chain-stages">
            TOTAL CHAIN LENGTH: {fullChain.length} STAGES
          </span>
        </div>
        <h1 className="wire-drift__title">
          EDITORIAL TRUTH DRIFT ANALYSIS
        </h1>
        <p className="wire-drift__lead">
          Forensic measurement of factual narrative decay between the baseline crime-scene 
          negative and the final headline filed to the Leonida wire.
        </p>
        <div className="wire-oxford-rule" aria-hidden="true" />

        {!hasPlayerLink && (
          <div className="wire-drift__unsealed-alert">
            <div className="wire-drift__unsealed-badge">[!] NOTICE: CASE UNSEALED</div>
            <p>
              Your personal edit has not yet been filed on this case. Advance to the React Image 
              Editor to inject your report into the chain.
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

      {/* CENTRAL LARGE DRIFT SCORE & VERDICT HERO */}
      <section className="wire-drift-hero" aria-label="Drift Verdict">
        <div className="wire-drift-hero__score-box">
          <div className="wire-drift-hero__metric">
            <span className="wire-drift-hero__number">{driftResult.score}%</span>
            <span className="wire-drift-hero__label">EDITORIAL DRIFT</span>
          </div>

          <div className="wire-drift-hero__stamp-wrap">
            <Badge
              variant={driftResult.status.variant}
              stamp
              rotate={driftResult.status.stampRotate}
              size="lg"
            >
              {driftResult.status.label}
            </Badge>
            <span className="wire-drift-hero__stamp-caption">PUBLIC RECORD RATING</span>
          </div>
        </div>

        <div className="wire-drift-hero__explanation">
          <p className="wire-drift-hero__tone">
            &ldquo;{driftResult.status.tone}&rdquo;
          </p>
          <p className="wire-drift-hero__details">
            {driftResult.explanation}
          </p>
        </div>
      </section>

      {/* HORIZONTAL PROGRESSION STRIP */}
      <section className="wire-drift-progression" aria-label="Narrative Progression">
        <div className="wire-progression-step">
          <div className="wire-progression-step__badge">01 / RAW RECORD</div>
          <div className="wire-progression-step__title">Archival Negative</div>
          <div className="wire-progression-step__desc">
            Unaltered forensic baseline captured at scene
          </div>
        </div>

        <div className="wire-progression-arrow">───→</div>

        <div className="wire-progression-step wire-progression-step--active">
          <div className="wire-progression-step__badge">02 / EDITED EVIDENCE</div>
          <div className="wire-progression-step__title">React Image Editor</div>
          <div className="wire-progression-step__desc">
            Visual manipulations &amp; witness distortions applied
          </div>
        </div>

        <div className="wire-progression-arrow">───→</div>

        <div className="wire-progression-step">
          <div className="wire-progression-step__badge">03 / INTERPRETATION</div>
          <div className="wire-progression-step__title">Public Wire Claim</div>
          <div className="wire-progression-step__desc">
            Final sensationalized headline published to public
          </div>
        </div>
      </section>

      {/* COMPACT EVIDENCE BREAKDOWN & LEXICAL FORENSICS */}
      <div className="wire-drift-breakdown-grid">
        {/* Evidentiary Decay Factors */}
        <section className="wire-breakdown-card">
          <div className="wire-breakdown-card__header">
            <h3>EVIDENTIARY DECAY FACTORS</h3>
            <span className="wire-breakdown-card__tag">[INDEX COMPONENT WEIGHTS]</span>
          </div>

          <div className="wire-breakdown-card__factors">
            <div className="wire-breakdown-factor">
              <span className="wire-factor-name">Chain Length Drag ({driftResult.chainLength} links)</span>
              <span className="wire-factor-val">+{driftResult.breakdown.lengthFactor} pts</span>
            </div>
            <div className="wire-breakdown-factor">
              <span className="wire-factor-name">Original Semantic Decay</span>
              <span className="wire-factor-val">+{driftResult.breakdown.originalDecay} pts</span>
            </div>
            <div className="wire-breakdown-factor">
              <span className="wire-factor-name">Inter-Witness Volatility</span>
              <span className="wire-factor-val">+{driftResult.breakdown.stepVolatility} pts</span>
            </div>
            <div className="wire-breakdown-factor">
              <span className="wire-factor-name">Sensational Buzzword Amplification</span>
              <span className="wire-factor-val">+{driftResult.breakdown.sensationalBonus} pts</span>
            </div>
          </div>
        </section>

        {/* Lexical Forensics Card */}
        <section className="wire-breakdown-card">
          <div className="wire-breakdown-card__header">
            <h3>LEXICAL FORENSICS</h3>
            <span className="wire-breakdown-card__tag">[VOCABULARY SURVIVAL]</span>
          </div>

          <div className="wire-breakdown-card__lexical">
            <div className="wire-lexical-group">
              <span className="wire-lexical-label">SURVIVING BASELINE WORDS:</span>
              <div className="wire-lexical-pills">
                {driftResult.retainedWords.length > 0 ? (
                  driftResult.retainedWords.map((w, i) => (
                    <span key={i} className="wire-drift-pill wire-drift-pill--retained">
                      {w}
                    </span>
                  ))
                ) : (
                  <span className="wire-drift-empty">[0% RETENTION — ALL BASELINE WORDS MUTATED]</span>
                )}
              </div>
            </div>

            <div className="wire-lexical-group">
              <span className="wire-lexical-label">SENSATIONAL MUTATED WORDS:</span>
              <div className="wire-lexical-pills">
                {driftResult.mutatedWords.map((w, i) => (
                  <span key={i} className="wire-drift-pill wire-drift-pill--mutated">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FILED EVIDENCE RECORD SUMMARY */}
      <section className="wire-drift-summary-card">
        <div className="wire-drift-summary-card__header">
          <span className="wire-summary-title">FINAL TRANSMITTED EVIDENCE RECORD</span>
          <Badge variant="verified" size="sm">
            STAGE #{fullChain.length}
          </Badge>
        </div>

        <div className="wire-drift-summary-card__body">
          <div className="wire-drift-summary-card__thumb-box wire-corner-reticles">
            <img
              src={playerLink.imageDataUrl || caseObj.originalImage}
              alt="Transmitted report"
              className="wire-drift-summary-card__thumb"
              style={{ filter: playerLink.imageDataUrl ? 'none' : (playerLink.filterStyle || 'none') }}
            />
          </div>

          <div className="wire-drift-summary-card__content">
            <div className="wire-summary-byline">
              <span className="wire-summary-label">REPORTER BYLINE:</span>
              <span className="wire-summary-val">{playerLink.author}</span>
            </div>

            <blockquote className="wire-summary-quote">
              &ldquo;{playerLink.caption}&rdquo;
            </blockquote>

            <div className="wire-summary-baseline-comp">
              <span className="wire-summary-label">ORIGINAL RECORD:</span>
              <p className="wire-summary-baseline-text">
                &ldquo;{caseObj.originalCaption}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY CTA & SUB-ACTIONS */}
      <div className="wire-drift__action-footer">
        <Button
          variant="primary"
          size="lg"
          disabled={!hasPlayerLink}
          onClick={() => navigate(`/case/${caseObj.id}/reveal`)}
          icon={<span>→</span>}
        >
          EXPOSE THE WIRE
        </Button>

        <div className="wire-drift__sub-buttons">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(`/case/${caseObj.id}/custody`)}
          >
            RETURN TO CUSTODY LOG
          </Button>

          <Button
            variant="evidence"
            size="md"
            onClick={() => navigate(`/case/${caseObj.id}/edit`)}
          >
            RE-EDIT IN IMAGE EDITOR
          </Button>
        </div>
      </div>
    </div>
  );
}
