import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getManilaPaperTexture, getDeskSurfaceTexture, getPaperNormalMap } from './textures';

// Helper to create tab badge texture without external font network dependencies
function getTabBadgeTexture(caseNumber) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#D49A32';
  ctx.fillRect(0, 0, 256, 64);

  ctx.strokeStyle = '#0A0B0E';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 56);

  ctx.fillStyle = '#0A0B0E';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(caseNumber, 128, 34);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function PhysicalCaseFolder({
  caseData,
  defaultPos,
  defaultRot,
  isSelected,
  isDimmed,
  onHover,
  onSelect,
}) {
  const groupRef = useRef();
  const coverRef = useRef();
  const documentRef = useRef();
  const [hovered, setHovered] = useState(false);

  const paperTexture = useMemo(
    () => getManilaPaperTexture(`${caseData.caseNumber} // ${caseData.title}`),
    [caseData]
  );
  const normalMap = useMemo(() => getPaperNormalMap(), []);
  const tabTexture = useMemo(() => getTabBadgeTexture(caseData.caseNumber), [caseData.caseNumber]);

  // Frame animation physics
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    let targetY = defaultPos[1];
    let targetZ = defaultPos[2];
    let targetRotX = defaultRot[0];
    let targetRotY = defaultRot[1];
    let targetCoverAngle = -0.04;
    let targetDocY = 0.025;

    if (isSelected) {
      targetY = 0.65;
      targetZ = 0.95;
      targetRotX = 0.35;
      targetRotY = 0;
      targetCoverAngle = -1.75;
      targetDocY = 0.12;
    } else if (hovered && !isDimmed) {
      targetY = defaultPos[1] + 0.22;
      targetZ = defaultPos[2] + 0.15;
      targetRotX = defaultRot[0] + 0.12;
      targetCoverAngle = -0.35;
    } else if (isDimmed) {
      targetY = defaultPos[1] - 0.08;
      targetZ = defaultPos[2] - 0.25;
      targetRotX = defaultRot[0] - 0.05;
    }

    const lerpSpeed = isSelected ? 6.5 : 8.5;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * lerpSpeed);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * lerpSpeed);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * lerpSpeed);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * lerpSpeed);

    if (coverRef.current) {
      coverRef.current.rotation.z = THREE.MathUtils.lerp(
        coverRef.current.rotation.z,
        targetCoverAngle,
        delta * (isSelected ? 5.5 : 8.0)
      );
    }

    if (documentRef.current) {
      documentRef.current.position.y = THREE.MathUtils.lerp(
        documentRef.current.position.y,
        targetDocY,
        delta * 6.0
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={defaultPos}
      rotation={defaultRot}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (onHover) onHover(caseData.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        if (onHover) onHover(null);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(caseData.id);
      }}
    >
      {/* Folder Base Tray */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.9, 0.03, 1.45]} />
        <meshStandardMaterial
          map={paperTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.2, 0.2)}
          roughness={0.8}
          metalness={0.05}
          color={isDimmed ? '#8A7A57' : '#D8C28E'}
        />
      </mesh>

      {/* Internal Evidence Document */}
      <mesh ref={documentRef} position={[0, 0.025, 0]}>
        <boxGeometry args={[1.72, 0.012, 1.25]} />
        <meshStandardMaterial
          roughness={0.45}
          metalness={0.06}
          color={isDimmed ? '#B8B2A7' : '#FAF4EB'}
        />
      </mesh>

      {/* Case Number Badge Tab */}
      <mesh position={[0.5, 0.02, -0.78]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.65, 0.16]} />
        <meshBasicMaterial map={tabTexture} />
      </mesh>

      {/* Folder Top Flap */}
      <group position={[-0.95, 0.025, 0]}>
        <mesh
          ref={coverRef}
          position={[0.95, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.9, 0.02, 1.45]} />
          <meshStandardMaterial
            map={paperTexture}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.25, 0.25)}
            roughness={0.78}
            metalness={0.05}
            color={isDimmed ? '#948360' : '#E0CE9E'}
          />
        </mesh>
      </group>

      {/* 3D Contact Shadow */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={isDimmed ? 0.3 : hovered || isSelected ? 0.85 : 0.65}
        scale={3.0}
        blur={1.6}
        far={1.8}
        color="#040507"
      />
    </group>
  );
}

function DeskScene({ cases, selectedId, onSelectCase }) {
  const deskTexture = useMemo(() => getDeskSurfaceTexture(), []);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <>
      {/* Warm Key Spotlight */}
      <spotLight
        position={[1.8, 4.2, 2.4]}
        angle={0.75}
        penumbra={0.75}
        intensity={5.5}
        color="#F8B342"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Overhead Fill */}
      <pointLight position={[0, 2.5, 1.4]} intensity={2.4} color="#FFE0A0" />

      {/* Cool Rim Fill */}
      <directionalLight
        position={[-3.2, 2.2, -2.0]}
        intensity={1.8}
        color="#5A88B0"
      />
      <ambientLight intensity={0.75} color="#222834" />

      {/* Desk Surface */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial map={deskTexture} roughness={0.88} metalness={0.1} />
      </mesh>

      {/* Render 3D Folders for Available Cases */}
      {cases.map((c, idx) => {
        const xOffset = idx === 0 ? -1.35 : 1.35;
        const defaultPos = [xOffset, 0, 0];
        const defaultRot = [0.08, idx === 0 ? 0.14 : -0.14, idx === 0 ? -0.03 : 0.03];
        const isSelected = selectedId === c.id;
        const isDimmed = selectedId !== null && !isSelected;

        return (
          <PhysicalCaseFolder
            key={c.id}
            caseData={c}
            defaultPos={defaultPos}
            defaultRot={defaultRot}
            isSelected={isSelected}
            isDimmed={isDimmed}
            onHover={setHoveredId}
            onSelect={onSelectCase}
          />
        );
      })}

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.88} intensity={0.3} />
      </EffectComposer>
    </>
  );
}

export default function CaseFoldersDesk({ cases, onSelectCase }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (caseId) => {
    setSelectedId(caseId);
    setTimeout(() => {
      onSelectCase(caseId);
    }, 700);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '460px',
        position: 'relative',
        userSelect: 'none',
        background: '#0D0F14',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 2.4, 3.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <DeskScene
          cases={cases}
          selectedId={selectedId}
          onSelectCase={handleSelect}
        />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          color: 'var(--accent-lime, #D4FF00)',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
          background: 'rgba(10, 11, 14, 0.92)',
          padding: '4px 10px',
          border: '1px solid rgba(212, 255, 0, 0.4)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        [ 3D EVIDENCE DESK // CLICK FOLDER TO LIFT & OPEN ]
      </div>
    </div>
  );
}
