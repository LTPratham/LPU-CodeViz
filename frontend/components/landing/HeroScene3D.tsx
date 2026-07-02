"use client";
import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import SortingBars3D from "./SortingBars3D";
import FloatingParticles from "./FloatingParticles";

// ─── Subtle Mouse-Follow Camera ──────────────────────────────────────────────

function CameraRig() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    // Subtle parallax based on mouse position
    const t = state.clock.elapsedTime;
    const mouseX = state.pointer.x * 0.3;
    const mouseY = state.pointer.y * 0.15;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.5 + mouseY, 0.02);

    // Gentle breathing/sway
    camera.position.x += Math.sin(t * 0.2) * 0.02;
    camera.position.y += Math.cos(t * 0.15) * 0.01;

    camera.lookAt(0, -0.2, 0);
  });

  return null;
}

// ─── Lighting Setup ──────────────────────────────────────────────────────────

function SceneLighting() {
  return (
    <>
      {/* Ambient base light — very dim */}
      <ambientLight intensity={0.15} color="#8B9DC3" />

      {/* Main key light — cool blue from top-right */}
      <directionalLight
        position={[5, 8, 3]}
        intensity={0.6}
        color="#CBD5E1"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-near={0.1}
      />

      {/* Fill light — subtle blue from left */}
      <pointLight position={[-6, 3, 2]} intensity={0.3} color="#3B82F6" distance={15} />

      {/* Rim light — purple accent from behind */}
      <pointLight position={[0, 2, -5]} intensity={0.2} color="#8B5CF6" distance={12} />

      {/* Ground bounce — very subtle warm */}
      <pointLight position={[0, -3, 0]} intensity={0.05} color="#FDE68A" distance={8} />
    </>
  );
}

// ─── Main 3D Scene ───────────────────────────────────────────────────────────

export default function HeroScene3D() {
  return (
    <div
      style={{
        width: "100%",
        height: 420,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(39, 39, 42, 0.6)",
      }}
    >
      {/* Gradient overlay at bottom for blending into page */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to top, #09090B, transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.5, 7], fov: 45, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "#09090B" }}
      >
        <Suspense fallback={null}>
          {/* Camera rig for subtle mouse parallax */}
          <CameraRig />

          {/* Lighting */}
          <SceneLighting />

          {/* Fog for depth */}
          <fog attach="fog" args={["#09090B", 8, 22]} />

          {/* Main sorting visualization */}
          <SortingBars3D />

          {/* Ambient floating particles */}
          <FloatingParticles />

          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.4}
              luminanceSmoothing={0.9}
              intensity={1.2}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.15} darkness={0.65} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Step indicator overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "rgba(17, 17, 19, 0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(39, 39, 42, 0.6)",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 11,
          color: "#A1A1AA",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", animation: "pulse 2s infinite" }} />
        <span>Live Bubble Sort Simulation</span>
        <span style={{ color: "#52525B" }}>·</span>
        <span style={{ color: "#52525B" }}>Auto-playing</span>
      </div>
    </div>
  );
}
