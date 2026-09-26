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
        background: '#0D0F14',
        color: 'var(--accent-lime, #D4FF00)',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '11px',
        letterSpacing: '0.14em',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(212, 255, 0, 0.25)',
          borderTopColor: 'var(--accent-lime, #D4FF00)',
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
