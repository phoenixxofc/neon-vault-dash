import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { hexToWorld } from '../../utils/hexGrid';

interface EnemyProps {
  q: number;
  r: number;
}

export const PhaseShifter: React.FC<EnemyProps> = ({ q, r }) => {
  const meshRef = useRef<THREE.Group>(null);
  const pos = useMemo(() => hexToWorld(q, r), [q, r]);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Transparent while player is moving logic
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.2;
  });

  return (
    <group ref={meshRef} position={[pos.x, 0.5, pos.z]}>
      <mesh>
        <dodecahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#800080" transparent opacity={0.6} emissive="#FF00FF" />
      </mesh>
    </group>
  );
};

export const GravitySentinel: React.FC<EnemyProps> = ({ q, r }) => {
  const meshRef = useRef<THREE.Group>(null);
  const pos = useMemo(() => hexToWorld(q, r), [q, r]);

  return (
    <group ref={meshRef} position={[pos.x, 0, pos.z]}>
      <mesh>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <meshStandardMaterial color="#4B0082" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="#800080" />
      </mesh>
    </group>
  );
};

export const MirrorDrone: React.FC<EnemyProps> = ({ q, r }) => {
  const meshRef = useRef<THREE.Group>(null);
  const pos = useMemo(() => hexToWorld(q, r), [q, r]);

  return (
    <group ref={meshRef} position={[pos.x, 0.5, pos.z]}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#000000" metalness={1} roughness={0} />
      </mesh>
    </group>
  );
};
