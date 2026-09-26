import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getManilaPaperTexture, getDeskSurfaceTexture, getPaperNormalMap } from './textures';

function SculpturalEvidenceSlab({ onSelect }) {
  const groupRef = useRef();
  const coverRef = useRef();
  const [hovered, setHovered] = useState(false);

  const paperTexture = useMemo(() => getManilaPaperTexture('THE LEONIDA WIRE // DECLASSIFIED'), []);
  const normalMap = useMemo(() => getPaperNormalMap(), []);

  // Smooth, slow, deliberate parallax following cursor
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const px = state.pointer.x * 0.25;
    const py = state.pointer.y * 0.2;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, px - 0.12, delta * 3.0);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -py + 0.18, delta * 3.0);

    const targetY = hovered ? 0.18 : 0;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 4.0);

    if (coverRef.current) {
      const targetCoverAngle = hovered ? -0.25 : -0.06;
      coverRef.current.rotation.z = THREE.MathUtils.lerp(coverRef.current.rotation.z, targetCoverAngle, delta * 4.0);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[0.18, -0.12, 0]}
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
        if (onSelect) onSelect();
      }}
    >
      {/* Heavy Architectural Evidence Base Slab */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.035, 1.75]} />
        <meshStandardMaterial
          map={paperTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.2, 0.2)}
          roughness={0.7}
          metalness={0.06}
          color="#DEC792"
        />
      </mesh>

      {/* Internal Archival Photographic Print */}
      <mesh position={[0.1, 0.028, 0.05]} rotation={[0, 0.04, 0]}>
        <boxGeometry args={[2.1, 0.015, 1.5]} />
        <meshStandardMaterial
          roughness={0.35}
          metalness={0.08}
          color="#FAF4EB"
        />
      </mesh>

      {/* Folder Tab (Top Right) */}
      <mesh position={[0.7, 0.018, -0.95]}>
        <boxGeometry args={[0.75, 0.02, 0.16]} />
        <meshStandardMaterial
          roughness={0.7}
          metalness={0.05}
          color="#C9B078"
        />
      </mesh>

      {/* Top Cover Flap */}
      <group position={[-1.2, 0.032, 0]}>
        <mesh
          ref={coverRef}
          position={[1.2, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.4, 0.025, 1.75]} />
          <meshStandardMaterial
            map={paperTexture}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.25, 0.25)}
            roughness={0.7}
            metalness={0.06}
            color="#E4CF9C"
          />
        </mesh>
      </group>

      {/* Brass Fastener Clip */}
      <mesh position={[-0.9, 0.055, -0.7]} rotation={[0, 0.2, 0]} castShadow>
        <torusGeometry args={[0.08, 0.015, 16, 32, Math.PI * 1.6]} />
        <meshStandardMaterial
          color="#DDA236"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

function SculpturalVoidScene({ onSelect }) {
  const deskTexture = useMemo(() => getDeskSurfaceTexture(), []);

  return (
    <>
      {/* Peter Tarka Architectural Key Beam: High-Angle Focused Spotlight */}
      <spotLight
        position={[2.8, 5.0, 3.0]}
        angle={0.6}
        penumbra={0.8}
        intensity={6.5}
        color="#FFF0D0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Soft Noir Cyan-Slate Rim Light */}
      <directionalLight
        position={[-3.8, 2.5, -2.5]}
        intensity={1.8}
        color="#4A7599"
      />

      {/* Warm Ground Fill */}
      <pointLight position={[0, 2.0, 1.5]} intensity={2.0} color="#FFDCA8" />
      <ambientLight intensity={0.65} color="#181D26" />

      {/* 3D Floating Evidence Slab */}
      <SculpturalEvidenceSlab onSelect={onSelect} />

      {/* Realistic Soft Contact Shadow */}
      <ContactShadows
        position={[0, -0.015, 0]}
        opacity={0.85}
        scale={4.8}
        blur={1.8}
        far={2}
        color="#030406"
      />

      {/* Darkroom Plinth / Ground Plane */}
      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial
          map={deskTexture}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Subtle Postprocessing */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.88} intensity={0.3} />
      </EffectComposer>
    </>
  );
}

export default function HeroEvidenceDesk({ onSelectFolder }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '440px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 2.2, 3.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <SculpturalVoidScene onSelect={onSelectFolder} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          color: 'var(--accent-amber, #D49A32)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          opacity: 0.85,
          background: 'rgba(8, 9, 12, 0.85)',
          padding: '4px 12px',
          border: '1px solid rgba(212, 154, 50, 0.3)',
        }}
      >
        [ 3D VOLUMETRIC DOSSIER // CURSOR PARALLAX ACTIVE ]
      </div>
    </div>
  );
}
