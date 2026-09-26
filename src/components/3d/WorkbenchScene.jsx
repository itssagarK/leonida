import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { getDeskSurfaceTexture } from './textures';

function PhysicalEvidenceLamp() {
  const lampHeadRef = useRef();
  const spotLightRef = useRef();

  // Subtle electrical hum and slight cursor tracking
  useFrame((state) => {
    if (!lampHeadRef.current) return;
    const t = state.clock.elapsedTime;
    // Micro-flicker of vintage incandescent filament
    const flicker = Math.sin(t * 12) * 0.04 + Math.cos(t * 31) * 0.02;
    if (spotLightRef.current) {
      spotLightRef.current.intensity = 4.0 + flicker;
    }

    // Gentle parallax tracking of the lamp head
    const px = state.pointer.x * 0.08;
    const py = state.pointer.y * 0.06;
    lampHeadRef.current.rotation.y = THREE.MathUtils.lerp(lampHeadRef.current.rotation.y, px - 0.35, 0.05);
    lampHeadRef.current.rotation.x = THREE.MathUtils.lerp(lampHeadRef.current.rotation.x, py + 0.6, 0.05);
  });

  return (
    <group position={[3.6, 1.8, -0.8]}>
      {/* Heavy Cast-Iron / Brass Desk Lamp Base */}
      <mesh position={[0, -1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.12, 32]} />
        <meshStandardMaterial
          color="#22262E"
          roughness={0.4}
          metalness={0.85}
        />
      </mesh>

      {/* Brass Articulated Lower Arm Rod */}
      <mesh position={[-0.25, -0.9, 0]} rotation={[0, 0, -0.28]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.8, 16]} />
        <meshStandardMaterial
          color="#D49A32"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Elbow Joint / Tension Springs */}
      <mesh position={[-0.55, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 20]} />
        <meshStandardMaterial color="#333842" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Upper Arm Rod angling inward towards canvas */}
      <mesh position={[-0.95, 0.55, 0]} rotation={[0, 0, 0.55]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
        <meshStandardMaterial
          color="#D49A32"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Lamp Head Group (Shade & Bulb) */}
      <group ref={lampHeadRef} position={[-1.4, 0.95, 0]}>
        {/* Conical Metallic Lampshade */}
        <mesh rotation={[0, 0, -0.4]} castShadow>
          <coneGeometry args={[0.45, 0.55, 32, 1, true]} />
          <meshStandardMaterial
            color="#14171E"
            roughness={0.35}
            metalness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Interior Brass Reflector */}
        <mesh position={[0, -0.05, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.42, 0.45, 32, 1, true]} />
          <meshStandardMaterial
            color="#FFC866"
            roughness={0.15}
            metalness={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Glowing Incandescent Light Bulb */}
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial
            color="#FFF4D0"
            emissive="#FFAA33"
            emissiveIntensity={3.5}
            roughness={0.1}
          />
        </mesh>

        {/* Downward Directional Spotlight Illuminating the Workbench */}
        <spotLight
          ref={spotLightRef}
          position={[0, -0.12, 0]}
          target-position={[-2.5, -2.5, 0]}
          angle={0.85}
          penumbra={0.7}
          intensity={4.2}
          color="#FFB84D"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
      </group>
    </group>
  );
}

function WorkbenchSceneContent() {
  const deskTexture = useMemo(() => getDeskSurfaceTexture(), []);

  return (
    <>
      <ambientLight intensity={0.35} color="#151A24" />

      {/* Cool Slate Rim Light for Depth */}
      <directionalLight
        position={[-4.5, 2.5, -2.0]}
        intensity={0.85}
        color="#3E5C76"
      />

      {/* Physical Evidence Lamp */}
      <PhysicalEvidenceLamp />

      {/* Desk Workbench Surface */}
      <mesh position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial
          map={deskTexture}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Subtle Bloom on the Lamp Bulb */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={0.9} intensity={0.5} />
      </EffectComposer>
    </>
  );
}

export default function WorkbenchScene() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
        overflow: 'hidden',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0.8, 3.8], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <WorkbenchSceneContent />
      </Canvas>
    </div>
  );
}
