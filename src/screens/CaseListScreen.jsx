import React, { useState, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllCases, getEffectiveChain } from '../data/cases';
import { getCaseProgress } from '../utils/storage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import SceneFallback from '../components/3d/SceneFallback';
import './CaseListScreen.css';

// Lazy-load 3D Case Scenes
const CaseGalleryWall = lazy(() => import('../components/3d/CaseGalleryWall'));
const CaseFoldersDesk = lazy(() => import('../components/3d/CaseFoldersDesk'));
import CrimeBoardView from '../components/cases/CrimeBoardView';

export default function CaseListScreen() {
  const navigate = useNavigate();
  const cases = getAllCases();
  const [viewMode, setViewMode] = useState('gallery'); // 'gallery' | 'desk' | 'pinboard' | 'grid'

  const handleSelectCase = (caseId) => {
    navigate(`/case/${caseId}`);
  };

  return (
    <motion.div
      className="wire-caselist wire-page-container"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
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

        {/* View Mode Toggle with Bold Directus Styling */}
        <div className="wire-caselist__view-toggle" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`wire-view-toggle-btn ${viewMode === 'gallery' ? 'is-active' : ''}`}
            onClick={() => setViewMode('gallery')}
            style={{
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: viewMode === 'gallery' ? 'var(--accent-purple)' : '#FFFFFF',
              color: viewMode === 'gallery' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid ' + (viewMode === 'gallery' ? 'var(--accent-purple)' : 'rgba(0, 0, 0, 0.12)'),
              boxShadow: viewMode === 'gallery' ? '0 2px 8px rgba(100, 66, 239, 0.25)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            [ ◈ 3D DEPTH GALLERY ]
          </button>
          <button
            type="button"
            className={`wire-view-toggle-btn ${viewMode === 'desk' ? 'is-active' : ''}`}
            onClick={() => setViewMode('desk')}
            style={{
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: viewMode === 'desk' ? 'var(--accent-amber)' : '#FFFFFF',
              color: viewMode === 'desk' ? '#0F1115' : 'var(--text-secondary)',
              border: '1px solid ' + (viewMode === 'desk' ? 'var(--accent-amber)' : 'rgba(0, 0, 0, 0.12)'),
              boxShadow: viewMode === 'desk' ? '0 2px 8px rgba(217, 119, 6, 0.25)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            [ 📁 3D PHYSICAL DESK ]
          </button>
          <button
            type="button"
            className={`wire-view-toggle-btn ${viewMode === 'pinboard' ? 'is-active' : ''}`}
            onClick={() => setViewMode('pinboard')}
            style={{
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: viewMode === 'pinboard' ? 'var(--accent-coral)' : '#FFFFFF',
              color: viewMode === 'pinboard' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid ' + (viewMode === 'pinboard' ? 'var(--accent-coral)' : 'rgba(0, 0, 0, 0.12)'),
              boxShadow: viewMode === 'pinboard' ? '0 2px 8px rgba(255, 42, 109, 0.25)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            [ 📌 CRIME PINBOARD ]
          </button>
          <button
            type="button"
            className={`wire-view-toggle-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: viewMode === 'grid' ? '#0F1115' : '#FFFFFF',
              color: viewMode === 'grid' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid ' + (viewMode === 'grid' ? '#0F1115' : 'rgba(0, 0, 0, 0.12)'),
              boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            [ ☷ ARCHIVAL DOSSIER CARDS ]
          </button>
        </div>
      </header>

      {/* 3D Depth Gallery View */}
      {viewMode === 'gallery' && (
        <div
          className="wire-caselist__3d-wrapper wire-corner-reticles"
          style={{
            width: '100%',
            marginBottom: 'var(--space-5)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: 'var(--shadow-paper)',
            background: '#EAEBF0',
          }}
        >
          <Suspense fallback={<SceneFallback label="LOADING 3D EVIDENCE DEPTH GALLERY..." />}>
            <CaseGalleryWall cases={cases} onSelectCase={handleSelectCase} />
          </Suspense>
        </div>
      )}

      {/* 3D Physical Desk View */}
      {viewMode === 'desk' && (
        <div
          className="wire-caselist__3d-wrapper wire-corner-reticles"
          style={{
            width: '100%',
            marginBottom: 'var(--space-5)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: 'var(--shadow-paper)',
            background: '#EAEBF0',
          }}
        >
          <Suspense fallback={<SceneFallback label="ARRANGING EVIDENCE DESK..." />}>
            <CaseFoldersDesk cases={cases} onSelectCase={handleSelectCase} />
          </Suspense>
        </div>
      )}

      {/* Crime Pinboard View */}
      {viewMode === 'pinboard' && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <CrimeBoardView cases={cases} onSelectCase={handleSelectCase} />
        </div>
      )}

      {/* Evidence Folders Grid (shown in grid view or as ledger below) */}
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
              onClick={() => handleSelectCase(c.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectCase(c.id);
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
                        handleSelectCase(c.id);
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
    </motion.div>
  );
}
