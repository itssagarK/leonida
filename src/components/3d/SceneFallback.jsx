import React from 'react';

export default function SceneFallback({ label = 'INITIALIZING 3D EVIDENCE ENVIRONMENT...' }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#EAEBF0',
        color: 'var(--accent-amber, #D97706)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '11px',
        letterSpacing: '0.14em',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(217, 119, 6, 0.25)',
          borderTopColor: 'var(--accent-amber, #D97706)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px',
        }}
      />
      <div>● {label}</div>
      <div
        style={{
          marginTop: '6px',
          fontSize: '9px',
          color: 'var(--text-muted, #7E8597)',
        }}
      >
        HARDWARE ACCELERATED WEBGL // PBR SHADERS
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
