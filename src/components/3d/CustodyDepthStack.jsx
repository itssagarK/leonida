import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { getAbsoluteImageUrl } from '../../utils/imageHelpers';

// Helper to bake image with optional CSS filter onto an offscreen canvas
function loadFilteredTexture(url, filterStyle, dataUrl, callback) {
  const src = dataUrl || getAbsoluteImageUrl(url);
  if (!src) return;

  const img = new Image();
  if (src.startsWith('http://') || src.startsWith('https://')) {
    img.crossOrigin = 'anonymous';
  }
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(img.naturalWidth || 800, 1024);
    canvas.height = Math.min(img.naturalHeight || 600, 768);
    const ctx = canvas.getContext('2d');

    if (!dataUrl && filterStyle && filterStyle !== 'none') {
      ctx.filter = filterStyle;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    callback(tex);
  };
  img.onerror = (e) => {
    console.warn('[CustodyDepthStack] Failed to load image:', src, e);
  };
  img.src = src;
}

// Procedural Tab / Badge Texture for each stage plate
function createStagePlateTab(title, subtitle, isRaw, isPlayer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0B0D12';
  ctx.fillRect(0, 0, 512, 80);

  const strokeColor = isPlayer ? '#E63956' : isRaw ? '#4A90E2' : '#D49A32';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, 506, 74);

  ctx.fillStyle = strokeColor;
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillText(title, 20, 36);

  ctx.fillStyle = '#C8CFDC';
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.fillText(subtitle.substring(0, 30).toUpperCase(), 20, 64);

  return new THREE.CanvasTexture(canvas);
}

function DepthStagePlane({
  stage,
  index,
  activeIndex,
  rawImageUrl,
  onSelect,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState(null);

  const isActive = index === activeIndex;
  const diff = index - activeIndex;

  useEffect(() => {
    let isMounted = true;
    loadFilteredTexture(rawImageUrl, stage.filterStyle, stage.imageDataUrl, (tex) => {
      if (isMounted) setTexture(tex);
    });
    return () => {
      isMounted = false;
    };
  }, [rawImageUrl, stage.filterStyle, stage.imageDataUrl]);

  const tabTitle = stage.isRaw
    ? '[00] RAW NEGATIVE'
    : stage.isPlayerSubmission
    ? `[0${index}] YOUR FILED LINK`
    : `[0${index}] WITNESS #${stage.step}`;

  const tabSubtitle = stage.author || (stage.isRaw ? 'POLICE REPOSITORY' : 'UNKNOWN SOURCE');

  const tabTexture = useMemo(
    () => createStagePlateTab(tabTitle, tabSubtitle, stage.isRaw, stage.isPlayerSubmission),
    [tabTitle, tabSubtitle, stage.isRaw, stage.isPlayerSubmission]
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let targetScale = 1.0;

    if (isActive) {
      targetZ = 0.55;
      targetX = 0;
      targetY = 0;
      targetScale = 1.05;
      targetRotY = 0;
      targetRotX = 0.02;
    } else if (diff < 0) {
      // Preceding stage (earlier in custody): stacked back to the left
      targetX = diff * 1.15;
      targetZ = diff * 0.7 - 0.25 + (hovered ? 0.25 : 0);
      targetY = diff * 0.04;
      targetRotY = 0.24;
      targetScale = Math.max(0.68, 1.0 + diff * 0.08);
    } else {
      // Subsequent stage (later in custody): stacked back to the right
      targetX = diff * 1.15;
      targetZ = -diff * 0.7 - 0.25 + (hovered ? 0.25 : 0);
      targetY = -diff * 0.04;
      targetRotY = -0.24;
      targetScale = Math.max(0.68, 1.0 - diff * 0.08);
    }

    const speed = 7.5;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * speed);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * speed);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * speed);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, delta * speed);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, delta * speed);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * speed));
  });

  const borderColor = isActive
    ? stage.isPlayerSubmission
      ? '#E63956'
      : '#E5A93C'
    : hovered
    ? '#D49A32'
    : '#4A5060';

  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.28, 1.48, 0.005)), []);

  return (
    <group
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
    >
      {/* Photo Plate */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[2.2, 1.4]} />
        {texture ? (
          <meshBasicMaterial
            key="with-tex"
            map={texture}
            color={isActive ? '#FFFFFF' : hovered ? '#CBD2E0' : '#454854'}
          />
        ) : (
          <meshBasicMaterial key="no-tex" color="#141720" />
        )}
      </mesh>

      {/* Backing Mounting Plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.28, 1.48, 0.02]} />
        <meshBasicMaterial color="#0A0C10" />
      </mesh>

      {/* Plate Border */}
      <lineSegments geometry={edgesGeo} position={[0, 0, 0.025]}>
        <lineBasicMaterial
          color={borderColor}
          opacity={isActive ? 1.0 : hovered ? 0.8 : 0.25}
          transparent
        />
      </lineSegments>

      {/* Top Header Tab */}
      <mesh position={[0, 0.84, 0.02]}>
        <planeGeometry args={[2.2, 0.18]} />
        <meshBasicMaterial map={tabTexture} />
      </mesh>
    </group>
  );
}

function CustodyStackScene({
  timelineStates,
  activeIndex,
  rawImageUrl,
  onSelectIndex,
}) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const px = state.pointer.x * 0.16;
    const py = state.pointer.y * 0.10;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, px, delta * 3.5);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -py, delta * 3.5);
  });

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.65} color="#D0D8E8" />
      <directionalLight position={[0, 3.5, 4.0]} intensity={3.2} color="#FFF5DB" />
      <pointLight position={[-3.5, 1.5, 2.0]} intensity={1.6} color="#FFD488" />
      <pointLight position={[3.5, 1.5, 2.0]} intensity={1.6} color="#FFD488" />

      {/* Render depth stack */}
      {timelineStates.map((stage, idx) => (
        <DepthStagePlane
          key={stage.id || idx}
          stage={stage}
          index={idx}
          activeIndex={activeIndex}
          rawImageUrl={rawImageUrl}
          onSelect={onSelectIndex}
        />
      ))}

      {/* Ground Contact Shadow for Active Stage */}
      <ContactShadows
        position={[0, -0.92, 0.5]}
        opacity={0.85}
        scale={3.8}
        blur={1.8}
        color="#030406"
      />
    </group>
  );
}

export default function CustodyDepthStack({
  timelineStates,
  activeIndex,
  rawImageUrl,
  onSelectIndex,
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '480px',
        position: 'relative',
        userSelect: 'none',
        background: '#07080A',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.7], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <CustodyStackScene
          timelineStates={timelineStates}
          activeIndex={activeIndex}
          rawImageUrl={rawImageUrl}
          onSelectIndex={onSelectIndex}
        />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          top: '14px',
          right: '16px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          color: 'var(--accent-amber, #D49A32)',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
          background: 'rgba(8, 9, 12, 0.88)',
          padding: '4px 12px',
          border: '1px solid rgba(212, 154, 50, 0.3)',
        }}
      >
        [ 3D CUSTODY DEPTH STACK // CLICK ANY EVIDENCE STAGE TO FOCUS ]
      </div>
    </div>
  );
}
