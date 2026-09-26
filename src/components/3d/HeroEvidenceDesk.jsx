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
          color="#E6D3A3"
        />
      </mesh>

      {/* Internal Archival Photographic Print */}
      <mesh position={[0.1, 0.028, 0.05]} rotation={[0, 0.04, 0]}>
        <boxGeometry args={[2.1, 0.015, 1.5]} />
        <meshStandardMaterial
          roughness={0.3}
          metalness={0.05}
          color="#FFFFFF"
        />
      </mesh>

      {/* Folder Tab (Top Right) */}
      <mesh position={[0.7, 0.018, -0.95]}>
        <boxGeometry args={[0.75, 0.02, 0.16]} />
        <meshStandardMaterial
          roughness={0.7}
          metalness={0.05}
          color="#D4BC82"
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
            color="#EEDCB0"
          />
        </mesh>
      </group>

      {/* Brass Fastener Clip */}
      <mesh position={[-0.9, 0.055, -0.7]} rotation={[0, 0.2, 0]} castShadow>
        <torusGeometry args={[0.08, 0.015, 16, 32, Math.PI * 1.6]} />
        <meshStandardMaterial
          color="#D97706"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function DirectusSculpturalAccents() {
  const torusRef = useRef();
  const sphereRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.4;
      torusRef.current.rotation.y = t * 0.6;
      torusRef.current.position.y = 0.42 + Math.sin(t * 1.5) * 0.05;
    }
    if (sphereRef.current) {
      sphereRef.current.position.y = 0.22 + Math.cos(t * 1.8) * 0.03;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Glossy Directus Electric Violet Torus Ring */}
      <mesh ref={torusRef} position={[-1.75, 0.42, 0.4]} rotation={[0.4, 0.2, 0.5]} castShadow>
        <torusGeometry args={[0.3, 0.1, 24, 48]} />
        <meshStandardMaterial
          color="#6442EF"
          roughness={0.12}
          metalness={0.25}
        />
      </mesh>

      {/* Glossy High-Voltage Neon Coral Sphere */}
      <mesh ref={sphereRef} position={[1.65, 0.22, 0.65]} castShadow>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial
          color="#FF2A6D"
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>

      {/* Cyber Cyan Architectural Pedestal Cylinder */}
      <mesh position={[1.65, 0.04, -0.6]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.16, 32]} />
        <meshStandardMaterial
          color="#00B8F0"
          roughness={0.2}
          metalness={0.35}
        />
      </mesh>

      {/* Solar Amber Beveled Cube */}
      <mesh position={[-1.6, 0.12, -0.7]} rotation={[0.2, 0.5, 0]} castShadow>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshStandardMaterial
          color="#F59E0B"
          roughness={0.18}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

function SculpturalVoidScene({ onSelect }) {
  const deskTexture = useMemo(() => getDeskSurfaceTexture(), []);

  return (
    <>
      {/* Peter Tarka Architectural Daylight Key Light */}
      <spotLight
        position={[2.8, 5.0, 3.0]}
        angle={0.65}
        penumbra={0.8}
        intensity={5.0}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Soft Sky Fill Light */}
      <directionalLight
        position={[-3.8, 2.5, -2.5]}
        intensity={1.5}
        color="#D9E6F2"
      />

      {/* Warm Sun Rim */}
      <pointLight position={[0, 2.2, 1.8]} intensity={1.8} color="#FFF2DC" />
      <ambientLight intensity={0.9} color="#ECEEF2" />

      {/* 3D Floating Evidence Slab */}
      <SculpturalEvidenceSlab onSelect={onSelect} />

      {/* Directus Bold 3D Sculptural Accents */}
      <DirectusSculpturalAccents />

      {/* Realistic Soft Contact Shadow */}
      <ContactShadows
        position={[0, -0.015, 0]}
        opacity={0.6}
        scale={4.8}
        blur={1.6}
        far={2}
        color="#1A1C22"
      />

      {/* Architectural Studio Plinth / Ground Plane */}
      <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial
          map={deskTexture}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle Postprocessing */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.92} intensity={0.2} />
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
        background: '#EAEBF0',
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
          color: 'var(--accent-amber, #D97706)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          opacity: 0.95,
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '4px 12px',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        [ 3D VOLUMETRIC DOSSIER // CURSOR PARALLAX ACTIVE ]
      </div>
    </div>
  );
}
