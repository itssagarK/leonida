import React, { useState, useEffect, useRef } from 'react';
import './WireAudioScanner.css';

const FREQUENCIES = [
  {
    id: 'ch-01',
    code: '94.2 MHz',
    name: 'VICE HARBOR',
    colorClass: 'wire-scanner__chan-btn--purple',
    transcript: 'HARBOR PATROL [UNIT 12]: Red sports coupe submerged at Slipway 4. Winch cable secured, towing to depot.',
  },
  {
    id: 'ch-02',
    code: '104.5 MHz',
    name: 'METRO DISPATCH',
    colorClass: 'wire-scanner__chan-btn--coral',
    transcript: 'DISPATCH: All units, verify unconfirmed 911 reports of submerged craft off Starfish Key. Probable hoax.',
  },
  {
    id: 'ch-03',
    code: '89.1 MHz',
    name: 'AMBROSIA RELAY',
    colorClass: 'wire-scanner__chan-btn--cyan',
    transcript: 'COUNTY ROADS [CREW 7]: Culvert generator operational on Route 84. Heavy mist, illuminating ditch.',
  },
  {
    id: 'ch-04',
    code: '108.8 MHz',
    name: 'PIRATE WIRE',
    colorClass: 'wire-scanner__chan-btn--amber',
    transcript: 'LEONIDA WIRE INTERCEPT: High-value negative acquired. Editorial drift sequence initiated.',
  },
];

export default function WireAudioScanner() {
  const [isOn, setIsOn] = useState(false);
  const [activeChan, setActiveChan] = useState(FREQUENCIES[0]);
  const audioCtxRef = useRef(null);

  // Synthesize realistic radio burst via Web Audio API on click
  const playRadioBurst = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      // White noise buffer for authentic radio static burst
      const bufferSize = ctx.sampleRate * 0.12; // 120ms burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Bandpass filter to mimic walkie-talkie / radio squelch
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseNode.start();

      // Subtle high pitch radio beep
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1240, ctx.currentTime + 0.08);
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime + 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context silently falls back if not supported
    }
  };

  const handleToggle = () => {
    const next = !isOn;
    setIsOn(next);
    if (next) playRadioBurst();
  };

  const handleSelectChannel = (chan) => {
    setActiveChan(chan);
    if (!isOn) setIsOn(true);
    playRadioBurst();
  };

  return (
    <div className="wire-scanner">
      <div className="wire-scanner__bar">
        <div className="wire-scanner__left">
          <button
            type="button"
            className={`wire-scanner__toggle-btn ${isOn ? 'is-active' : ''}`}
            onClick={handleToggle}
            title={isOn ? 'Deactivate Scanner' : 'Activate Police Wire Scanner'}
          >
            <span className="wire-scanner__status-led" />
            <span>{isOn ? 'SCANNER LIVE' : 'WIRE SCANNER'}</span>
          </button>

          <div className={`wire-scanner__spectrum ${isOn ? 'is-playing' : ''}`}>
            <div className="wire-scanner__spectrum-bar" />
            <div className="wire-scanner__spectrum-bar" />
            <div className="wire-scanner__spectrum-bar" />
            <div className="wire-scanner__spectrum-bar" />
            <div className="wire-scanner__spectrum-bar" />
          </div>
        </div>

        <div className="wire-scanner__channels">
          {FREQUENCIES.map((chan) => (
            <button
              key={chan.id}
              type="button"
              className={`wire-scanner__chan-btn ${chan.colorClass} ${
                activeChan.id === chan.id && isOn ? 'is-active' : ''
              }`}
              onClick={() => handleSelectChannel(chan)}
            >
              <span>{chan.code}</span>
              <span>{chan.name}</span>
            </button>
          ))}
        </div>

        <div className="wire-scanner__feed">
          <span className="wire-scanner__feed-freq">[{activeChan.code}]</span>
          <span className="wire-scanner__feed-text">
            {isOn ? (
              activeChan.transcript
            ) : (
              <em>FREQUENCY MONITOR STANDBY // SELECT CHANNEL TO INTERCEPT DISPATCH</em>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
