import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllCases, getEffectiveChain } from '../data/cases';
import { getCaseProgress } from '../utils/storage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Divider from '../components/common/Divider';
import './CaseListScreen.css';

export default function CaseListScreen() {
  const navigate = useNavigate();
  const cases = getAllCases();

  return (
    <div className="wire-caselist">
      {/* Top Breadcrumb */}
      <div className="wire-caselist__nav">
        <Link to="/" className="wire-caselist__back-link">
          &larr; RETURN TO WIRE MASTHEAD
        </Link>
        <span className="wire-caselist__filter-tag">EVIDENTIARY ARCHIVE // 2 CASES UNSEALED</span>
      </div>

      {/* Header */}
      <header className="wire-caselist__header">
        <div className="wire-caselist__badge-row">
          <Badge variant="wire">LEONIDA WIRE DOSSIERS</Badge>
          <span className="wire-caselist__freq">SECURE FREQ 94.7 MHz</span>
        </div>
        <h1 className="wire-caselist__title">ACTIVE WIRE INVESTIGATIONS</h1>
        <p className="wire-caselist__desc">
          Select an active evidentiary dossier. Each case contains a baseline photograph that has
          been successively distorted by multiple witnesses. Open the custody log, review the
          distortion slider, and submit your link to expose the wire.
        </p>
        <Divider variant="solid" spacing="md" />
      </header>

      {/* Case Grid */}
      <div className="wire-caselist__grid">
        {cases.map((c) => {
          const progress = getCaseProgress(c.id);
          const fullChain = getEffectiveChain(c, progress);
          const hasPlayerFiled = Boolean(progress && progress.playerLink);
          const latestLink = fullChain[fullChain.length - 1];

          return (
            <div
              key={c.id}
              className="wire-case-card"
              onClick={() => navigate(`/case/${c.id}`)}
            >
              {/* Image Preview */}
              <div className="wire-case-card__thumb-wrap">
                <img
                  src={latestLink.imageDataUrl || c.originalImage}
                  alt={c.title}
                  className="wire-case-card__img"
                  style={{ filter: latestLink.imageDataUrl ? 'none' : (latestLink.filterStyle || 'none') }}
                />
                <div className="wire-case-card__thumb-tag">
                  {hasPlayerFiled ? (
                    <Badge variant="verified" stamp rotate={-2}>
                      REPORT FILED
                    </Badge>
                  ) : (
                    <Badge variant="disputed" stamp rotate={3}>
                      {c.chain.length} WITNESS LINKS
                    </Badge>
                  )}
                </div>
              </div>

              {/* Info Body */}
              <div className="wire-case-card__body">
                <div className="wire-case-card__meta">
                  <span className="wire-case-card__num">{c.caseNumber}</span>
                  <span className="wire-case-card__loc">{c.location}</span>
                </div>

                <h2 className="wire-case-card__title">{c.title}</h2>
                <p className="wire-case-card__subtitle">{c.subtitle}</p>

                <div className="wire-case-card__latest-claim">
                  <span className="wire-case-card__claim-label">HEAD CLAIM:</span>
                  <p>&ldquo;{latestLink.caption}&rdquo;</p>
                </div>

                <div className="wire-case-card__footer">
                  <span className="wire-case-card__timestamp">{c.dateLogged}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/case/${c.id}`);
                    }}
                  >
                    INSPECT DOSSIER &rarr;
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
