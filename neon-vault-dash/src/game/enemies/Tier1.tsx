import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { hexToWorld } from '../../utils/hexGrid';

interface EnemyProps {
  q: number;
  r: number;
}

export const StaticSentry: React.FC<EnemyProps> = ({ q, r }) => {
  const meshRef = useRef<THREE.Group>(null);
  const pos = useMemo(() => hexToWorld(q, r), [q, r]);
  const lastFire = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.02;

    // Projectile logic placeholder
    const now = state.clock.getElapsedTime();
    if (now - lastFire.current > 3) {
      // Fire slow projectile
      lastFire.current = now;
    }
  });

  return (
    <group ref={meshRef} position={[pos.x, 0.5, pos.z]}>
      <mesh>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

export const Orbiter: React.FC<EnemyProps & { radius: number }> = ({ q, r, radius }) => {
  const meshRef = useRef<THREE.Group>(null);
  const centerPos = useMemo(() => hexToWorld(q, r), [q, r]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.x = centerPos.x + Math.cos(t) * radius;
    meshRef.current.position.z = centerPos.z + Math.sin(t) * radius;
  });

  return (
    <group ref={meshRef} position={[centerPos.x, 0.5, centerPos.z]}>
      <mesh>
        <torusGeometry args={[0.3, 0.1, 12, 24]} />
        <meshStandardMaterial color="#008080" emissive="#008080" />
      </mesh>
    </group>
  );
};

export const Sweeper: React.FC<EnemyProps> = ({ q, r }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const startPos = useMemo(() => hexToWorld(q, r), [q, r]);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Linear traverse logic
    meshRef.current.position.x = startPos.x + Math.sin(state.clock.getElapsedTime() * 0.5) * 5;
  });

  return (
    <mesh ref={meshRef} position={[startPos.x, 0.5, startPos.z]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#00FFFF" />
    </mesh>
  );
};
