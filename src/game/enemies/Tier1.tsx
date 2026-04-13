import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnemyProps {
  q: number;
  r: number;
}

export const StaticSentry: React.FC<EnemyProps> = () => {
  const meshRef = useRef<THREE.Group>(null);
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
    <group ref={meshRef}>
      <mesh>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

export const Orbiter: React.FC<EnemyProps & { radius: number }> = ({ radius }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.z = Math.sin(t) * radius;
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <torusGeometry args={[0.3, 0.1, 12, 24]} />
        <meshStandardMaterial color="#008080" emissive="#008080" />
      </mesh>
    </group>
  );
};

export const Sweeper: React.FC<EnemyProps> = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Linear traverse logic
    meshRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#00FFFF" />
    </mesh>
  );
};
