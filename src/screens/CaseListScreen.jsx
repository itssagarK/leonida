import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllCases, getEffectiveChain } from '../data/cases';
import { getCaseProgress } from '../utils/storage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './CaseListScreen.css';

export default function CaseListScreen() {
  const navigate = useNavigate();
  const cases = getAllCases();

  return (
    <div className="wire-caselist wire-page-container">
      {/* Top Breadcrumb & Metadata */}
      <div className="wire-caselist__topbar">
        <Link to="/" className="wire-caselist__back">
          ← BACK TO WIRE DESPATCH
        </Link>
        <span className="wire-caselist__secure-tag">
          EVIDENTIARY ARCHIVE // 2 UNRESTRICTED DOSSIERS
        </span>
      </div>

      {/* Screen Title & Description */}
      <header className="wire-caselist__header">
        <div className="wire-caselist__header-badge">
          <Badge variant="wire">LEONIDA EVIDENCE ARCHIVE</Badge>
          <span className="wire-caselist__header-freq">CLASSIFIED REPOSITORY // SECTOR 04</span>
        </div>
        <h1 className="wire-caselist__title">ACTIVE EVIDENCE DOSSIERS</h1>
        <div className="wire-oxford-rule" aria-hidden="true" />
        <p className="wire-caselist__lead">
          Select an evidentiary folder to review raw police negatives, audit the chain of witness 
          tampering, and mount the image into the <strong>React Image Editor</strong> to file your transmission.
        </p>
      </header>

      {/* Evidence Folders Grid */}
      <div className="wire-caselist__folders">
        {cases.map((c, index) => {
          const progress = getCaseProgress(c.id);
          const fullChain = getEffectiveChain(c, progress);
          const hasPlayerFiled = Boolean(progress && progress.playerLink);
          const latestLink = fullChain[fullChain.length - 1];
          const estTime = index === 0 ? '~3 MIN READ' : '~4 MIN READ';
          const difficulty = index === 0 ? 'MODERATE DRIFT' : 'HIGH VOLATILITY';

          return (
            <article
              key={c.id}
              className="wire-folder"
              onClick={() => navigate(`/case/${c.id}`)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/case/${c.id}`);
                }
              }}
              role="button"
              aria-label={`Open case ${c.caseNumber}: ${c.title}`}
            >
              {/* Folder Tab with Paperclip & Seal */}
              <div className="wire-folder__tab-row">
                <div className="wire-folder__tab">
                  <span className="wire-folder__paperclip" aria-hidden="true">📎</span>
                  <span className="wire-folder__tab-num">{c.caseNumber}</span>
                  <span className="wire-folder__tab-cat">{c.category}</span>
                </div>
                <div className="wire-folder__tape">
                  {hasPlayerFiled ? 'CERTIFIED FILED' : 'RESTRICTED EVIDENCE'}
                </div>
              </div>

              {/* Folder Content Container */}
              <div className="wire-folder__content">
                {/* Visual Thumbnail Archival Mount */}
                <div className="wire-folder__thumb-box wire-corner-reticles">
                  <div className="wire-folder__thumb-matte">
                    <img
                      src={latestLink.imageDataUrl || c.originalImage}
                      alt={c.title}
                      className="wire-folder__thumb-img"
                      style={{ filter: latestLink.imageDataUrl ? 'none' : (latestLink.filterStyle || 'none') }}
                      loading="lazy"
                    />
                  </div>
                  <div className="wire-folder__thumb-overlay">
                    <Badge 
                      variant={hasPlayerFiled ? 'verified' : 'disputed'} 
                      size="sm"
                      stamp
                    >
                      {hasPlayerFiled ? 'FILED' : 'UNRESOLVED'}
                    </Badge>
                  </div>
                  <div className="wire-folder__docket-stamp">
                    REG. #{c.id.toUpperCase()}
                  </div>
                </div>

                {/* Details Body */}
                <div className="wire-folder__body">
                  <div className="wire-folder__meta-row">
                    <span className="wire-folder__evidence-count">
                      {fullChain.length} EVIDENCE {fullChain.length === 1 ? 'LINK' : 'LINKS'}
                    </span>
                    <span className="wire-folder__sep">•</span>
                    <span className="wire-folder__metric wire-folder__metric--volatility">{difficulty}</span>
                    <span className="wire-folder__sep">•</span>
                    <span className="wire-folder__metric">{estTime}</span>
                  </div>

                  <h2 className="wire-folder__title">{c.title}</h2>
                  <p className="wire-folder__summary">{c.subtitle}</p>

                  <div className="wire-folder__location-row">
                    <span className="wire-folder__loc-label">INCIDENT SCENE:</span>
                    <span className="wire-folder__loc-val">{c.location}</span>
                  </div>

                  {/* Primary CTA */}
                  <div className="wire-folder__action">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/case/${c.id}`);
                      }}
                      icon={<span>→</span>}
                    >
                      INSPECT DOSSIER
                    </Button>
                    <span className="wire-folder__subaction-label">
                      {hasPlayerFiled ? 'VIEW FILED RECORD' : 'REVIEW CUSTODY & EDIT'}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
