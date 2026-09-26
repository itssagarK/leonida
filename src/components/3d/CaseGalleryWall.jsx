import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { getAbsoluteImageUrl } from '../../utils/imageHelpers';

// Robust evidence texture loader using Three.js TextureLoader
function useEvidenceTexture(url) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (!isMounted) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        tex.needsUpdate = true;
        setTexture(tex);
      },
      undefined,
      (err) => console.warn('TextureLoader error:', err)
    );

    return () => {
      isMounted = false;
    };
  }, [url]);

  return texture;
}

// Procedural tab badge
function createTabTexture(caseNum, title) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0E1118';
  ctx.fillRect(0, 0, 512, 96);

  ctx.strokeStyle = '#D49A32';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, 506, 90);

  ctx.fillStyle = '#D49A32';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText(caseNum, 24, 45);

  ctx.fillStyle = '#F5EFE6';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText(title.substring(0, 24).toUpperCase(), 24, 76);

  return new THREE.CanvasTexture(canvas);
}

function DepthImagePlane({
  caseData,
  defaultPos,
  isActive,
  isDimmed,
  onHover,
  onSelect,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const photoTexture = useEvidenceTexture(getAbsoluteImageUrl(caseData.originalImage));
  const tabTexture = useMemo(
    () => createTabTexture(caseData.caseNumber, caseData.title),
    [caseData.caseNumber, caseData.title]
  );

  // Showcase-images depth-sorting mechanics
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    let targetZ = defaultPos[2];
    let targetY = defaultPos[1];
    let targetScale = 1.0;
    let targetRotX = 0;
    let targetRotY = defaultPos[0] > 0 ? -0.06 : 0.06;

    if (isActive || hovered) {
      // Pull forward into sharp focus (showcase-images mechanic)
      targetZ = defaultPos[2] + 0.65;
      targetY = defaultPos[1] + 0.12;
      targetScale = 1.12;
      targetRotX = 0.05;
      targetRotY = 0;
    } else if (isDimmed) {
      // Recede into depth space
      targetZ = defaultPos[2] - 0.55;
      targetY = defaultPos[1] - 0.06;
      targetScale = 0.92;
      targetRotY = defaultPos[0] > 0 ? -0.15 : 0.15;
    }

    const lerpSpeed = 7.0;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * lerpSpeed);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * lerpSpeed);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * lerpSpeed));
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, delta * lerpSpeed);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, delta * lerpSpeed);
  });

  return (
    <group
      ref={meshRef}
      position={defaultPos}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(caseData.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(caseData.id);
      }}
    >
      {/* Archival Evidence Photo Plane */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[2.1, 1.4]} />
        {photoTexture ? (
          <meshBasicMaterial
            key="with-tex"
            map={photoTexture}
            color={isDimmed && !hovered ? '#606470' : '#FFFFFF'}
          />
        ) : (
          <meshBasicMaterial key="no-tex" color="#1E2330" />
        )}
      </mesh>

      {/* Backing Mounting Frame Plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.18, 1.48, 0.02]} />
        <meshBasicMaterial color="#0C0E14" />
      </mesh>

      {/* High-Contrast Gold Border */}
      <lineSegments geometry={useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.18, 1.48, 0.005)), [])} position={[0, 0, 0.025]}>
        <lineBasicMaterial
          color={isActive || hovered ? '#E5A93C' : '#D49A32'}
          opacity={isActive || hovered ? 1.0 : isDimmed ? 0.35 : 0.75}
          transparent
        />
      </lineSegments>

      {/* Case Identification Tab (Top Header) */}
      <mesh position={[0, 0.84, 0.02]}>
        <planeGeometry args={[2.1, 0.2]} />
        <meshBasicMaterial map={tabTexture} />
      </mesh>

      {/* Contact Shadow Under Image Plane */}
      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={isDimmed ? 0.25 : isActive || hovered ? 0.9 : 0.6}
        scale={3.6}
        blur={1.6}
        color="#030406"
      />
    </group>
  );
}

function GalleryScene({ cases, activeId, onSelectCase }) {
  const groupRef = useRef();
  const [hoveredId, setHoveredId] = useState(null);

  // Gallery-wide mouse tilt parallax
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const px = state.pointer.x * 0.18;
    const py = state.pointer.y * 0.12;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, px, delta * 3.5);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -py, delta * 3.5);
  });

  return (
    <group ref={groupRef}>
      {/* Architectural Lighting (Peter Tarka inspired) */}
      <ambientLight intensity={0.7} color="#D8DFEE" />
      <directionalLight position={[0, 3.5, 4.0]} intensity={3.0} color="#FFF4D8" />
      <pointLight position={[-3.0, 1.0, 2.5]} intensity={1.5} color="#FFD080" />
      <pointLight position={[3.0, 1.0, 2.5]} intensity={1.5} color="#FFD080" />

      {/* Render depth-sorted evidence planes */}
      {cases.map((c, idx) => {
        const xOffset = idx === 0 ? -1.45 : 1.45;
        const defaultPos = [xOffset, 0, 0];
        const isActive = activeId === c.id || hoveredId === c.id;
        const isDimmed = (activeId !== null || hoveredId !== null) && !isActive;

        return (
          <DepthImagePlane
            key={c.id}
            caseData={c}
            defaultPos={defaultPos}
            isActive={isActive}
            isDimmed={isDimmed}
            onHover={setHoveredId}
            onSelect={onSelectCase}
          />
        );
      })}
    </group>
  );
}

export default function CaseGalleryWall({ cases, onSelectCase }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (caseId) => {
    setSelectedId(caseId);
    setTimeout(() => {
      onSelectCase(caseId);
    }, 600);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '460px',
        position: 'relative',
        userSelect: 'none',
        background: '#07080A',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <GalleryScene
          cases={cases}
          activeId={selectedId}
          onSelectCase={handleSelect}
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
          background: 'rgba(8, 9, 12, 0.85)',
          padding: '4px 12px',
          border: '1px solid rgba(212, 154, 50, 0.3)',
        }}
      >
        [ 3D DEPTH GALLERY // HOVER TO FOCUS • CLICK TO ENTER ]
      </div>
    </div>
  );
}
