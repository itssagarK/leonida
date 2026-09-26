import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getManilaPaperTexture, getDeskSurfaceTexture, getPaperNormalMap } from './textures';

function EvidenceFolder({ onSelect }) {
  const groupRef = useRef();
  const coverRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Procedural textures
  const paperTexture = useMemo(() => getManilaPaperTexture('THE LEONIDA WIRE // ARCHIVE'), []);
  const normalMap = useMemo(() => getPaperNormalMap(), []);

  // Parallax & subtle breathe on pointer move
  useFrame((state) => {
    if (!groupRef.current) return;
    const px = state.pointer.x; // -1 to +1
    const py = state.pointer.y;

    // Smooth lerp parallax rotation
    const targetRotY = px * 0.22 - 0.15;
    const targetRotX = -py * 0.18 + 0.12;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.06);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.06);

    // Hover lift & slight cover opening
    const targetY = hovered ? 0.2 : 0;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);

    if (coverRef.current) {
      const targetCoverAngle = hovered ? -0.22 : -0.05;
      coverRef.current.rotation.z = THREE.MathUtils.lerp(coverRef.current.rotation.z, targetCoverAngle, 0.08);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[0.1, -0.15, 0]}
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
      {/* Folder Back / Base Slab */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.3, 0.03, 1.7]} />
        <meshStandardMaterial
          map={paperTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.2, 0.2)}
          roughness={0.78}
          metalness={0.05}
          color="#D2BA85"
        />
      </mesh>

      {/* Internal Evidence Document / 8x10 Print Peeking Out */}
      <mesh position={[0.1, 0.025, 0.05]} rotation={[0, 0.03, 0]}>
        <boxGeometry args={[2.0, 0.015, 1.45]} />
        <meshStandardMaterial
          roughness={0.4}
          metalness={0.08}
          color="#FAF4EB"
        />
      </mesh>

      {/* Folder Tab (Sticking out of top right) */}
      <mesh position={[0.65, 0.015, -0.92]}>
        <boxGeometry args={[0.75, 0.02, 0.16]} />
        <meshStandardMaterial
          roughness={0.8}
          metalness={0.05}
          color="#C2A870"
        />
      </mesh>

      {/* Folder Top Cover (hinged on the left) */}
      <group position={[-1.15, 0.03, 0]}>
        <mesh
          ref={coverRef}
          position={[1.15, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.3, 0.025, 1.7]} />
          <meshStandardMaterial
            map={paperTexture}
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.3, 0.3)}
            roughness={0.75}
            metalness={0.05}
            color="#D8C28E"
          />
        </mesh>
      </group>

      {/* Brass Paperclip Accent (Top Left) */}
      <mesh position={[-0.85, 0.05, -0.68]} rotation={[0, 0.2, 0]} castShadow>
        <torusGeometry args={[0.08, 0.014, 12, 28, Math.PI * 1.6]} />
        <meshStandardMaterial
          color="#DDA236"
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
}

function DeskScene({ onSelect }) {
  const deskTexture = useMemo(() => getDeskSurfaceTexture(), []);

  return (
    <>
      {/* Noir Key Light: Warm Incandescent Desk Lamp */}
      <spotLight
        position={[2.0, 3.8, 2.2]}
        angle={0.7}
        penumbra={0.7}
        intensity={5.5}
        color="#F8B342"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Warm Incident Overhead Fill */}
      <pointLight position={[0, 2.2, 1.5]} intensity={2.4} color="#FFE0A0" />

      {/* Noir Cool Rim Light: Cold Steel 1980s Miami Vice Backlight */}
      <directionalLight
        position={[-3.5, 2.2, -2.5]}
        intensity={1.8}
        color="#5A88B0"
      />

      {/* Ambient Fill Light */}
      <ambientLight intensity={0.75} color="#222834" />

      {/* 3D Evidence Folder resting physically on the desk */}
      <EvidenceFolder onSelect={onSelect} />

      {/* Realistic Soft Contact Shadow */}
      <ContactShadows
        position={[0, -0.015, 0]}
        opacity={0.85}
        scale={4.5}
        blur={1.6}
        far={2}
        color="#040507"
      />

      {/* Desktop Surface Plane */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial
          map={deskTexture}
          roughness={0.88}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric Postprocessing */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom
          luminanceThreshold={0.85}
          luminanceSmoothing={0.2}
          intensity={0.4}
        />
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
        minHeight: '380px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 2.0, 3.4], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <DeskScene onSelect={onSelectFolder} />
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
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          opacity: 0.8,
          background: 'rgba(10, 11, 14, 0.7)',
          padding: '4px 10px',
          border: '1px solid rgba(212, 154, 50, 0.3)',
        }}
      >
        [ INTERACTIVE 3D DOSSIER // MOVE CURSOR TO EXAMINE ]
      </div>
    </div>
  );
}
