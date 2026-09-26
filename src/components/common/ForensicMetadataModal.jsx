import React, { useState } from 'react';
import './ForensicMetadataModal.css';
import { getAbsoluteImageUrl } from '../../utils/imageHelpers';

export default function ForensicMetadataModal({ isOpen, onClose, caseData, activeImageUrl }) {
  const [filterMode, setFilterMode] = useState('normal'); // 'normal' | 'ela' | 'luminance' | 'edge' | 'infrared'

  if (!isOpen || !caseData) return null;

  const imgSrc = activeImageUrl || getAbsoluteImageUrl(caseData.originalImage);

  return (
    <div className="wire-forensic-modal-backdrop" onClick={onClose}>
      <div className="wire-forensic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wire-forensic-modal__header">
          <div className="wire-forensic-modal__title-group">
            <span className="wire-badge wire-badge--purple">FORENSIC LAB // ELA</span>
            <h2 className="wire-forensic-modal__title">
              OPTICAL & EXIF FORENSIC INSPECTOR — {caseData.caseNumber}
            </h2>
          </div>
          <button
            type="button"
            className="wire-forensic-modal__close-btn"
            onClick={onClose}
          >
            ✕ CLOSE
          </button>
        </div>

        <div className="wire-forensic-modal__body">
          {/* Left: Interactive Optical Diagnostic Viewport */}
          <div className="wire-forensic-viewport-pane">
            <div className="wire-forensic-viewport-box">
              <img
                src={imgSrc}
                alt="Forensic Optical Examination"
                className={`wire-forensic-viewport-img wire-forensic-viewport-img--${filterMode}`}
              />
              <div className="wire-forensic-reticle-overlay" />
            </div>

            <div className="wire-forensic-filter-buttons">
              <button
                type="button"
                className={`wire-forensic-filter-btn ${filterMode === 'normal' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('normal')}
              >
                ● UNALTERED
              </button>
              <button
                type="button"
                className={`wire-forensic-filter-btn ${filterMode === 'ela' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('ela')}
              >
                🔬 ELA ARTIFACTS
              </button>
              <button
                type="button"
                className={`wire-forensic-filter-btn ${filterMode === 'luminance' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('luminance')}
              >
                ☀ LUMINANCE VECTOR
              </button>
              <button
                type="button"
                className={`wire-forensic-filter-btn ${filterMode === 'edge' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('edge')}
              >
                ⚡ HIGH-PASS EDGE
              </button>
              <button
                type="button"
                className={`wire-forensic-filter-btn ${filterMode === 'infrared' ? 'is-active' : ''}`}
                onClick={() => setFilterMode('infrared')}
              >
                🔥 INFRARED SPECTRUM
              </button>
            </div>
          </div>

          {/* Right: Telemetry & EXIF Readings */}
          <div className="wire-forensic-telemetry-pane">
            <div className="wire-telemetry-section">
              <div className="wire-telemetry-title">SENSOR & OPTICAL EXIF DATA</div>
              <div className="wire-telemetry-grid">
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">CAMERA SENSOR</span>
                  <span className="wire-telemetry-val">Sony Exmor RS 48MP</span>
                </div>
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">FOCAL LENGTH</span>
                  <span className="wire-telemetry-val">24.0mm (f/1.78)</span>
                </div>
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">SHUTTER EXPOSURE</span>
                  <span className="wire-telemetry-val">1/2400s @ ISO 160</span>
                </div>
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">COLOR SPACE</span>
                  <span className="wire-telemetry-val">Display P3 / sRGB</span>
                </div>
              </div>
            </div>

            <div className="wire-telemetry-section">
              <div className="wire-telemetry-title">GEOSPATIAL & REGISTRATION</div>
              <div className="wire-telemetry-grid">
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">LEONIDA COORDINATES</span>
                  <span className="wire-telemetry-val">25.7617° N, 80.1918° W</span>
                </div>
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">BEARING</span>
                  <span className="wire-telemetry-val">142° SE (Magnetic)</span>
                </div>
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">TIMESTAMP DIGEST</span>
                  <span className="wire-telemetry-val">{caseData.dateLogged}</span>
                </div>
                <div className="wire-telemetry-item">
                  <span className="wire-telemetry-label">ORIGINAL SOURCE</span>
                  <span className="wire-telemetry-val">{caseData.originalPhotographer}</span>
                </div>
              </div>
            </div>

            <div className="wire-telemetry-section">
              <div className="wire-telemetry-title">CRYPTO INTEGRITY & TAMPER AUDIT</div>
              <div className="wire-tamper-meter">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>COMPRESSION ANOMALY INDEX</span>
                  <strong style={{ color: 'var(--accent-coral)' }}>74.2% HIGH TAMPER RISK</strong>
                </div>
                <div className="wire-tamper-meter-bar">
                  <div className="wire-tamper-meter-fill" style={{ width: '74.2%' }} />
                </div>
              </div>

              <div className="wire-telemetry-item">
                <span className="wire-telemetry-label">SHA-256 DIGITAL FINGERPRINT</span>
                <span className="wire-telemetry-val wire-telemetry-val--code">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
