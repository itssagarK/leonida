import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

// Safe texture loader with repeat, offset, and optional filter baking
function useSplitTexture(url, isRightHalf = false, filterStyle = 'none') {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;
    const img = new Image();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1200;
        canvas.height = img.naturalHeight || 800;
        const ctx = canvas.getContext('2d');

        if (filterStyle && filterStyle !== 'none') {
          ctx.filter = filterStyle;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(0.5, 1);
        tex.offset.set(isRightHalf ? 0.5 : 0, 0);
        tex.needsUpdate = true;
        setTexture(tex);
      } catch (err) {
        console.warn('Canvas texture creation fallback:', err);
        const tex = new THREE.Texture(img);
        tex.needsUpdate = true;
        tex.repeat.set(0.5, 1);
        tex.offset.set(isRightHalf ? 0.5 : 0, 0);
        setTexture(tex);
      }
    };

    img.onerror = (e) => {
      console.warn('Image load error for 3D split:', e);
    };

    img.src = url;
  }, [url, isRightHalf, filterStyle]);

  return texture;
}

// Procedural Shard Piece along the fracture seam
function FractureShard({ initialPos, initialRot, driftFactor }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const displacement = driftFactor * 0.28;
    meshRef.current.position.x = initialPos[0] + Math.sin(t * 1.5 + initialPos[1]) * 0.03 * driftFactor;
    meshRef.current.position.y = initialPos[1] + Math.cos(t * 1.2 + initialPos[0]) * 0.02 * driftFactor;
    meshRef.current.position.z = initialPos[2] + displacement + Math.sin(t * 2.0) * 0.02 * driftFactor;

    meshRef.current.rotation.x = initialRot[0] + t * 0.2 * driftFactor;
    meshRef.current.rotation.y = initialRot[1] + t * 0.3 * driftFactor;
  });

  return (
    <mesh ref={meshRef} position={initialPos} rotation={initialRot}>
      <tetrahedronGeometry args={[0.075, 0]} />
      <meshBasicMaterial color="#EF2354" />
    </mesh>
  );
}

function ShatterPlates({ rawImageUrl, editedImageUrl, filterStyle = 'none', driftScore }) {
  const groupRef = useRef();
  const leftPlateRef = useRef();
  const rightPlateRef = useRef();

  // Load left half of raw record and right half of mutated narrative
  const leftTexture = useSplitTexture(rawImageUrl, false, 'none');
  const rightTexture = useSplitTexture(editedImageUrl || rawImageUrl, true, filterStyle);

  const driftFactor = Math.min(1, Math.max(0, driftScore / 100));

  const shards = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      pos: [(Math.random() - 0.5) * 0.12, (i - 5.5) * 0.16, 0.04],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Mouse parallax
    const px = state.pointer.x * 0.18;
    const py = state.pointer.y * 0.14;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, px, delta * 4.0);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -py, delta * 4.0);

    // Left plate (Raw Record) angles backward and stays grounded in baseline
    if (leftPlateRef.current) {
      const targetLeftRotY = -0.22 * driftFactor;
      const targetLeftPosX = -0.74 - 0.1 * driftFactor;
      const targetLeftPosZ = -0.08 * driftFactor;
      leftPlateRef.current.rotation.y = THREE.MathUtils.lerp(leftPlateRef.current.rotation.y, targetLeftRotY, delta * 3.5);
      leftPlateRef.current.position.x = THREE.MathUtils.lerp(leftPlateRef.current.position.x, targetLeftPosX, delta * 3.5);
      leftPlateRef.current.position.z = THREE.MathUtils.lerp(leftPlateRef.current.position.z, targetLeftPosZ, delta * 3.5);
    }

    // Right plate (Manipulated Narrative) twists forward toward public eye
    if (rightPlateRef.current) {
      const targetRightRotY = 0.28 * driftFactor;
      const targetRightPosX = 0.74 + 0.18 * driftFactor;
      const targetRightPosZ = 0.24 * driftFactor;
      rightPlateRef.current.rotation.y = THREE.MathUtils.lerp(rightPlateRef.current.rotation.y, targetRightRotY, delta * 3.5);
      rightPlateRef.current.position.x = THREE.MathUtils.lerp(rightPlateRef.current.position.x, targetRightPosX, delta * 3.5);
      rightPlateRef.current.position.z = THREE.MathUtils.lerp(rightPlateRef.current.position.z, targetRightPosZ, delta * 3.5);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Ambient and daylight architectural studio lights */}
      <ambientLight intensity={0.9} color="#ECEEF2" />
      <directionalLight position={[0, 3.0, 4.0]} intensity={3.5} color="#FFFFFF" />

      {/* LEFT HALF: THE RAW ARCHIVAL RECORD */}
      <group ref={leftPlateRef} position={[-0.74, 0, 0]}>
        {/* Archival Photographic Print */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.42, 1.62]} />
          {leftTexture ? (
            <meshBasicMaterial key="left-tex" map={leftTexture} />
          ) : (
            <meshBasicMaterial key="left-notex" color="#EAEBF0" />
          )}
        </mesh>
        {/* Backing Mounting Slab */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.46, 1.66, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Photo Mount Border */}
        <lineSegments
          geometry={useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.46, 1.66, 0.005)), [])}
          position={[0, 0, 0.025]}
        >
          <lineBasicMaterial color="#D97706" opacity={0.85} transparent />
        </lineSegments>
      </group>

      {/* RIGHT HALF: THE MANIPULATED WIRE CLAIM */}
      <group ref={rightPlateRef} position={[0.74, 0, 0]}>
        {/* Mutated Photographic Print */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.42, 1.62]} />
          {rightTexture ? (
            <meshBasicMaterial key="right-tex" map={rightTexture} />
          ) : (
            <meshBasicMaterial key="right-notex" color="#EAEBF0" />
          )}
        </mesh>
        {/* Backing Mounting Slab */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.46, 1.66, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Tamper Border */}
        <lineSegments
          geometry={useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.46, 1.66, 0.005)), [])}
          position={[0, 0, 0.025]}
        >
          <lineBasicMaterial
            color={driftScore > 65 ? '#EF2354' : '#E29314'}
            opacity={0.9}
            transparent
          />
        </lineSegments>
      </group>

      {/* Central Fracture Line Emissive Glow */}
      {driftFactor > 0.15 && (
        <mesh position={[0, 0, 0.03]} scale={[0.025 + driftFactor * 0.03, 1.7, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#EF2354"
            transparent
            opacity={Math.min(0.95, driftFactor * 1.2)}
          />
        </mesh>
      )}

      {/* Floating Fracture Shards */}
      {driftFactor > 0.25 &&
        shards.map((s, idx) => (
          <FractureShard
            key={idx}
            initialPos={s.pos}
            initialRot={s.rot}
            driftFactor={driftFactor}
          />
        ))}

      <ContactShadows
        position={[0, -0.95, 0]}
        opacity={0.55}
        scale={3.8}
        blur={1.6}
        color="#1A1C22"
      />
    </group>
  );
}

export default function DriftShatterScene({
  rawImageUrl,
  editedImageUrl,
  filterStyle = 'none',
  driftScore = 75
}) {
  const aberrationOffset = useMemo(() => {
    const factor = Math.min(1, Math.max(0, driftScore / 100));
    const offsetVal = 0.001 + factor * 0.004;
    return new THREE.Vector2(offsetVal, offsetVal);
  }, [driftScore]);

  return (
    <div
      style={{
        width: '100%',
        height: '460px',
        position: 'relative',
        background: '#0D0F14',
        userSelect: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.7], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ShatterPlates
          rawImageUrl={rawImageUrl}
          editedImageUrl={editedImageUrl}
          filterStyle={filterStyle}
          driftScore={driftScore}
        />

        {/* Postprocessing: Chromatic Aberration scaled by Drift */}
        <EffectComposer disableNormalPass multisampling={0}>
          <ChromaticAberration offset={aberrationOffset} />
        </EffectComposer>
      </Canvas>

      {/* Floating HUD Badges */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '16px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          color: '#E8E8E8',
          letterSpacing: '0.1em',
          background: 'rgba(10, 11, 14, 0.92)',
          padding: '4px 10px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
        }}
      >
        EXHIBIT A: RAW RECORD
      </div>

      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          color: driftScore > 70 ? 'var(--accent-danger, #FF4D00)' : 'var(--accent-lime, #D4FF00)',
          letterSpacing: '0.1em',
          background: 'rgba(10, 11, 14, 0.92)',
          padding: '4px 10px',
          border: `1px solid ${driftScore > 70 ? 'var(--accent-danger)' : 'var(--accent-lime)'}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
        }}
      >
        EXHIBIT B: FRACTURED NARRATIVE (+{driftScore}% DRIFT)
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          color: 'var(--accent-lime, #D4FF00)',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
          opacity: 0.95,
          background: 'rgba(10, 11, 14, 0.92)',
          padding: '4px 12px',
          border: '1px solid rgba(212, 255, 0, 0.4)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        [ 3D VOLUMETRIC FRACTURE // MOVE CURSOR TO INSPECT SEAM ]
      </div>
    </div>
  );
}
