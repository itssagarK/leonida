import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Divider from '../components/common/Divider';
import RedactionBar from '../components/common/RedactionBar';
import './LandingScreen.css';

export default function LandingScreen() {
  const navigate = useNavigate();

  const handleStartWire = () => {
    // Navigate to the case archive list
    navigate('/cases');
  };

  return (
    <div className="wire-landing">
      {/* Editorial Dateline Bar */}
      <div className="wire-landing__dateline-bar">
        <div className="wire-landing__dateline-col">
          <span className="wire-landing__meta-tag">EDITION</span>
          <span className="wire-landing__meta-val">LATE WIRE // CITIZEN LEAKS</span>
        </div>
        <div className="wire-landing__dateline-col">
          <span className="wire-landing__meta-tag">DATELINE</span>
          <span className="wire-landing__meta-val">VICE BEACH &bull; PORT GELLHORN &bull; LEONIDA</span>
        </div>
        <div className="wire-landing__dateline-col wire-landing__dateline-col--right">
          <Badge variant="developing" stamp rotate={-2} size="sm">
            WIRE OVERLOAD
          </Badge>
        </div>
      </div>

      {/* Main Masthead Container */}
      <header className="wire-landing__masthead">
        <div className="wire-landing__masthead-badge-row">
          <Badge variant="wire">LEONIDA WIRE DESPATCH SERVICE</Badge>
          <span className="wire-landing__masthead-id">CIRCULATION: 48,209 NODES // UNRESTRICTED</span>
        </div>

        <h1 className="wire-landing__nameplate">
          THE LEONIDA WIRE
        </h1>

        <div className="wire-landing__submasthead">
          <span>THE UNOFFICIAL CHRONICLE OF WITNESS MUTATIONS, HOT EVIDENCE & DRIFTING TRUTH</span>
        </div>

        <Divider variant="evidence" spacing="md" />
      </header>

      {/* The Core Premise Box */}
      <section className="wire-landing__lead-story">
        <div className="wire-landing__lead-header">
          <div className="wire-landing__bulletin-tag">
            <span className="wire-landing__dot-pulse" />
            URGENT WIRE MEMO
          </div>
          <div className="wire-landing__lead-ref">
            DOC_REF: #LW-2026-CONFIDENTIAL
          </div>
        </div>

        <div className="wire-landing__premise-box">
          <p className="wire-landing__premise-text">
            Every story in Leonida begins with a single photograph. By the time it filters through
            shady informants, social clout-chasers, and midnight tabloids, the original truth is{' '}
            <RedactionBar revealsOnHover classified>COMPLETELY COMPROMISED</RedactionBar>.
          </p>

          <p className="wire-landing__premise-sub">
            Your assignment: Inspect the unbroken <strong>custody log</strong> of witness edits, scrub
            the distortion slider to witness how the narrative drifted, then inject your own visual
            evidence using the built-in <strong>React Image Editor</strong> to close the case.
          </p>
        </div>
      </section>

      {/* Fictional Wire Headlines Teletype */}
      <section className="wire-landing__headlines">
        <div className="wire-landing__section-title">
          <span>// ACTIVE EVIDENTIARY DOSSIERS DETECTED</span>
          <span className="wire-landing__feed-freq">FREQ: 94.7 MHz</span>
        </div>

        <div className="wire-landing__case-cards">
          {/* Dossier 1 Preview */}
          <div className="wire-dossier-card" onClick={() => navigate('/case/case-01')}>
            <div className="wire-dossier-card__header">
              <span className="wire-dossier-card__num">CASE #01-A</span>
              <Badge variant="disputed">4 WITNESS EDITS</Badge>
            </div>
            <h2 className="wire-dossier-card__title">
              THE OCEAN DRIVE "SUPERCAR SUBMERSIBLE"
            </h2>
            <p className="wire-dossier-card__snippet">
              Started as an abandoned rental sedan towed from the marina slipway. Ended as a
              billionaire’s prototype waterproof espionage vehicle escaping the Vice Beach canal.
            </p>
            <div className="wire-dossier-card__footer">
              <span className="wire-dossier-card__status">DRIFT LEVEL: SEVERE</span>
              <span className="wire-dossier-card__action">INSPECT FILE &rarr;</span>
            </div>
          </div>

          {/* Dossier 2 Preview */}
          <div className="wire-dossier-card" onClick={() => navigate('/case/case-02')}>
            <div className="wire-dossier-card__header">
              <span className="wire-dossier-card__num">CASE #02-B</span>
              <Badge variant="legend">3 WITNESS EDITS</Badge>
            </div>
            <h2 className="wire-dossier-card__title">
              MIDNIGHT AT THE AMBROSIA SWAMP ROADS
            </h2>
            <p className="wire-dossier-card__snippet">
              A blurry snapshot of an off-grid airboat searchlight evolved into an extraterrestrial
              saucer landing pad witnessed by five anonymous truckers.
            </p>
            <div className="wire-dossier-card__footer">
              <span className="wire-dossier-card__status">DRIFT LEVEL: URBAN LEGEND</span>
              <span className="wire-dossier-card__action">INSPECT FILE &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Wire Rules / Protocol Banner */}
      <section className="wire-landing__protocol">
        <div className="wire-landing__protocol-col">
          <span className="wire-landing__step-num">01</span>
          <h4>SCRUB LOG</h4>
          <p>Drag the custody slider to watch witness claims warp the raw photograph.</p>
        </div>
        <div className="wire-landing__protocol-divider" />
        <div className="wire-landing__protocol-col">
          <span className="wire-landing__step-num">02</span>
          <h4>FORGE YOUR LINK</h4>
          <p>Use the full-suite React Image Editor to crop, filter, annotate and file your edit.</p>
        </div>
        <div className="wire-landing__protocol-divider" />
        <div className="wire-landing__protocol-col">
          <span className="wire-landing__step-num">03</span>
          <h4>EXPOSE THE WIRE</h4>
          <p>Unroll the side-by-side drift score and generate your certified evidentiary export.</p>
        </div>
      </section>

      {/* Main Action Bar */}
      <div className="wire-landing__action-bar">
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartWire}
          icon={<span>&gt;&gt;</span>}
        >
          ENTER THE WIRE &bull; OPEN ACTIVE CASE
        </Button>
      </div>

      {/* Archival Footnote */}
      <footer className="wire-landing__footer">
        <div className="wire-landing__disclaimer">
          PRESS DISPATCH // ALL ASSETS FICTIONAL // LEONIDA WIRE INVESTIGATIVE BUREAU
          <br />
          POWERED BY @UNLAYER/REACT-IMAGE-EDITOR ENGINE
        </div>
      </footer>
    </div>
  );
}
