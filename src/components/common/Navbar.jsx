import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCaseById } from '../../data/cases';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  // Determine current active case if on /case/:id/...
  const caseMatch = path.match(/\/case\/([^/]+)/);
  const activeCaseId = caseMatch ? caseMatch[1] : null;
  const currentCase = activeCaseId ? getCaseById(activeCaseId) : null;

  return (
    <header className="wire-navbar">
      <div className="wire-navbar__inner">
        {/* Brand / Logo */}
        <div className="wire-navbar__brand-group">
          <Link to="/" className="wire-navbar__brand" title="The Leonida Wire — LSIB Terminal">
            <span className="wire-navbar__brand-name">THE LEONIDA WIRE</span>
            <span className="wire-navbar__brand-sub">LEONIDA STATE INVESTIGATIVE BUREAU // VICE METRO DESPATCH</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="wire-navbar__nav" aria-label="Main Navigation">
          <Link 
            to="/cases" 
            className={`wire-navbar__link ${path === '/cases' ? 'wire-navbar__link--active' : ''}`}
          >
            CASE FILES
          </Link>
          <Link 
            to="/cases" 
            className="wire-navbar__link"
            title="Active Investigative Wires"
          >
            ACTIVE WIRES
          </Link>
          <Link 
            to="/cases" 
            className="wire-navbar__link"
            title="Archived Evidence Records"
          >
            ARCHIVE
          </Link>
        </nav>

        {/* Status / Active Case Context */}
        <div className="wire-navbar__status-group">
          {currentCase ? (
            <Link 
              to={`/case/${currentCase.id}`} 
              className="wire-navbar__case-badge"
              title={`Return to case: ${currentCase.title}`}
            >
              <span className="wire-navbar__case-label">CASE:</span>
              <span className="wire-navbar__case-val">{currentCase.caseNumber}</span>
            </Link>
          ) : (
            <div className="wire-navbar__system-badge">
              <span className="wire-navbar__system-dot" />
              <span className="wire-navbar__system-text">SYSTEM ONLINE</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
