"use client";
import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BarState {
  value: number;
  status: "default" | "comparing" | "swapping" | "sorted";
  targetX: number;
}

interface SortingStep {
  bars: BarState[];
}

// ─── Sorting Step Generator ──────────────────────────────────────────────────

function generateBubbleSortSteps(initialValues: number[]): SortingStep[] {
  const steps: SortingStep[] = [];
  const arr = [...initialValues];
  const n = arr.length;

  const snapshot = (statuses: Record<number, BarState["status"]> = {}) => {
    steps.push({
      bars: arr.map((value, idx) => ({
        value,
        status: statuses[idx] || "default",
        targetX: (idx - (n - 1) / 2) * 1.4,
      })),
    });
  };

  snapshot();

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Comparing
      const compareStatuses: Record<number, BarState["status"]> = { [j]: "comparing", [j + 1]: "comparing" };
      for (let k = n - i; k < n; k++) compareStatuses[k] = "sorted";
      snapshot(compareStatuses);

      if (arr[j] > arr[j + 1]) {
        // Swapping
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        const swapStatuses: Record<number, BarState["status"]> = { [j]: "swapping", [j + 1]: "swapping" };
        for (let k = n - i; k < n; k++) swapStatuses[k] = "sorted";
        snapshot(swapStatuses);
      }
    }
    // Mark as sorted
    const sortedStatuses: Record<number, BarState["status"]> = {};
    for (let k = n - i - 1; k < n; k++) sortedStatuses[k] = "sorted";
    snapshot(sortedStatuses);
  }

  // Final — all sorted
  const allSorted: Record<number, BarState["status"]> = {};
  arr.forEach((_, i) => { allSorted[i] = "sorted"; });
  snapshot(allSorted);

  return steps;
}

// ─── Color Config ────────────────────────────────────────────────────────────

const COLORS = {
  default:   { color: "#27272A", emissive: "#000000", intensity: 0 },
  comparing: { color: "#3B82F6", emissive: "#3B82F6", intensity: 0.8 },
  swapping:  { color: "#22C55E", emissive: "#22C55E", intensity: 1.0 },
  sorted:    { color: "#6366F1", emissive: "#6366F1", intensity: 0.3 },
};

// ─── Individual Bar ──────────────────────────────────────────────────────────

function Bar({ value, status, targetX, index }: BarState & { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const height = value * 0.35;
  const colorConfig = COLORS[status];
  const targetColor = useMemo(() => new THREE.Color(colorConfig.color), [colorConfig.color]);
  const targetEmissive = useMemo(() => new THREE.Color(colorConfig.emissive), [colorConfig.emissive]);

  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return;

    // Smooth position lerp
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 6);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, height / 2 - 1.5, delta * 6);

    // Smooth scale lerp
    const targetScaleY = height;
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, delta * 6);

    // Smooth color lerp
    matRef.current.color.lerp(targetColor, delta * 8);
    matRef.current.emissive.lerp(targetEmissive, delta * 8);
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity,
      colorConfig.intensity,
      delta * 8
    );
  });

  return (
    <mesh ref={meshRef} position={[targetX, height / 2 - 1.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.9, 1, 0.9]} />
      <meshStandardMaterial
        ref={matRef}
        color={colorConfig.color}
        emissive={colorConfig.emissive}
        emissiveIntensity={colorConfig.intensity}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SortingBars3D() {
  const initialValues = useMemo(() => [14, 22, 8, 31, 5, 19, 11, 26], []);
  const steps = useMemo(() => generateBubbleSortSteps(initialValues), [initialValues]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [steps.length]);

  const currentStep = steps[stepIndex];

  return (
    <group position={[0, 0, 0]}>
      {currentStep.bars.map((bar, i) => (
        <Bar key={i} index={i} {...bar} />
      ))}

      {/* Ground plane — subtle reflective surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0A0A0C"
          roughness={0.6}
          metalness={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}
