import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface EnemyProps {
  q: number;
  r: number;
  id: string;
}

export const PhaseShifter: React.FC<EnemyProps> = ({ id }) => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lastPlayerPos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;
    const playerPos = useGameStore.getState().playerPosition;
    const currentPlayerPos = new THREE.Vector3(...playerPos);
    const isMoving = currentPlayerPos.distanceTo(lastPlayerPos.current) > 0.01;

    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, isMoving ? 0.1 : 1.0, 0.1);
    meshRef.current.visible = materialRef.current.opacity > 0.2;

    lastPlayerPos.current.copy(currentPlayerPos);
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <dodecahedronGeometry args={[0.5]} />
        <meshStandardMaterial ref={materialRef} color="#800080" transparent opacity={0.6} emissive="#FF00FF" />
      </mesh>
    </group>
  );
};

export const GravitySentinel: React.FC<EnemyProps> = ({ id }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
      if (!meshRef.current) return;
      const state = useGameStore.getState();
      const p = new THREE.Vector3(...state.playerPosition);
      const s = new THREE.Vector3();
      meshRef.current.getWorldPosition(s);
      const dist = p.distanceTo(s);
      if (dist < 3.0) {
          // Apply perpendicular force to simulate arc
          const toPlayer = new THREE.Vector3().subVectors(p, s).normalize();
          const perp = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x);
          const force = perp.multiplyScalar(0.5 * (1 - dist/3.0));
          state.applyExternalForce([force.x, force.y, force.z]);
      }
  });

  return (
    <group ref={meshRef}>
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

export const MirrorDrone: React.FC<EnemyProps> = ({ id }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const playerPos = useGameStore.getState().playerPosition;
    meshRef.current.position.set(-playerPos[0], 0, -playerPos[2]);
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#000000" metalness={1} roughness={0} />
      </mesh>
    </group>
  );
};
