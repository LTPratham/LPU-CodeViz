"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

// ─── Particle Config ─────────────────────────────────────────────────────────

const CODE_SYMBOLS = ["{", "}", "<", ">", ";", "//", "=>", "()", "[]", "&&", "||", "++", "fn", "if", "0", "1"];

interface Particle {
  symbol: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  floatIntensity: number;
  floatSpeed: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      symbol: CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)],
      position: [
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 3,
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ],
      scale: 0.08 + Math.random() * 0.12,
      speed: 0.1 + Math.random() * 0.3,
      floatIntensity: 0.5 + Math.random() * 1.5,
      floatSpeed: 0.5 + Math.random() * 2,
      opacity: 0.04 + Math.random() * 0.1,
    });
  }
  return particles;
}

// ─── Single Floating Symbol ──────────────────────────────────────────────────

function FloatingSymbol({ particle }: { particle: Particle }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * particle.speed;
    groupRef.current.rotation.y = particle.rotation[1] + t * 0.3;
    groupRef.current.rotation.z = particle.rotation[2] + Math.sin(t) * 0.1;
  });

  return (
    <Float
      speed={particle.floatSpeed}
      rotationIntensity={0.2}
      floatIntensity={particle.floatIntensity}
      floatingRange={[-0.3, 0.3]}
    >
      <group
        ref={groupRef}
        position={particle.position}
        rotation={particle.rotation}
        scale={particle.scale}
      >
        {/* Use a simple plane with text texture for performance */}
        <mesh>
          <planeGeometry args={[2.5, 2.5]} />
          <meshBasicMaterial
            color="#3B82F6"
            transparent
            opacity={particle.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Glowing Orb Particles (lightweight alternative) ─────────────────────────

function GlowOrb({ position, color, size, speed }: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FloatingParticles() {
  const particles = useMemo(() => generateParticles(20), []);

  const orbs = useMemo(() => [
    { position: [-6, 2, -5] as [number, number, number], color: "#3B82F6", size: 0.08, speed: 0.8 },
    { position: [7, -1, -4] as [number, number, number], color: "#8B5CF6", size: 0.06, speed: 1.2 },
    { position: [-3, 3, -6] as [number, number, number], color: "#22C55E", size: 0.07, speed: 0.6 },
    { position: [5, 3, -3] as [number, number, number], color: "#3B82F6", size: 0.05, speed: 1.0 },
    { position: [-8, -2, -5] as [number, number, number], color: "#6366F1", size: 0.09, speed: 0.5 },
    { position: [9, 1, -7] as [number, number, number], color: "#22C55E", size: 0.06, speed: 0.9 },
    { position: [0, 4, -8] as [number, number, number], color: "#8B5CF6", size: 0.07, speed: 0.7 },
    { position: [-5, -3, -4] as [number, number, number], color: "#3B82F6", size: 0.05, speed: 1.1 },
    { position: [4, -3, -6] as [number, number, number], color: "#6366F1", size: 0.08, speed: 0.4 },
    { position: [-2, 5, -5] as [number, number, number], color: "#22C55E", size: 0.04, speed: 1.3 },
    { position: [8, -2, -8] as [number, number, number], color: "#3B82F6", size: 0.06, speed: 0.8 },
    { position: [-7, 4, -7] as [number, number, number], color: "#8B5CF6", size: 0.05, speed: 0.6 },
  ], []);

  return (
    <group>
      {/* Floating code symbol planes */}
      {particles.map((p, i) => (
        <FloatingSymbol key={`sym-${i}`} particle={p} />
      ))}
      {/* Glowing orbs scattered in space */}
      {orbs.map((orb, i) => (
        <GlowOrb key={`orb-${i}`} {...orb} />
      ))}
    </group>
  );
}
