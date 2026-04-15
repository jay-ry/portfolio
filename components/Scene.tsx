"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 2000 }) {
  const mesh = useRef<THREE.Points>(null);
  const elapsed = useRef(0);
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      const t = Math.random();
      colors[i * 3] = t < 0.5 ? 0 : 1;
      colors[i * 3 + 1] = t < 0.5 ? 1 : 0;
      colors[i * 3 + 2] = t < 0.5 ? 0.88 : 0.24;
    }
    return { positions, colors };
  }, [count]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!mesh.current) return;
    mesh.current.rotation.y = elapsed.current * 0.02;
    mesh.current.rotation.x = Math.sin(elapsed.current * 0.01) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function GridPlane() {
  const ref = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (ref.current) ref.current.position.z = (elapsed.current * 0.5) % 2;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      <planeGeometry args={[40, 40, 30, 30]} />
      <meshBasicMaterial color="#00ffe0" wireframe opacity={0.06} transparent />
    </mesh>
  );
}

export default function Scene() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <Particles />
        <GridPlane />
        <fog attach="fog" args={["#020408", 10, 30]} />
      </Canvas>
    </div>
  );
}
