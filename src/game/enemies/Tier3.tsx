import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface EnemyProps {
  q: number;
  r: number;
}

export const PhaseShifter: React.FC<EnemyProps> = () => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { playerPosition } = useGameStore();
  const lastPlayerPos = useRef(new THREE.Vector3(...playerPosition));

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;
    const currentPlayerPos = new THREE.Vector3(...playerPosition);
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

export const GravitySentinel: React.FC<EnemyProps> = () => {
  const meshRef = useRef<THREE.Group>(null);
  const { playerPosition, applyExternalForce } = useGameStore();

  useFrame(() => {
      if (!meshRef.current) return;
      const p = new THREE.Vector3(...playerPosition);
      const s = new THREE.Vector3();
      meshRef.current.getWorldPosition(s);
      const dist = p.distanceTo(s);
      if (dist < 3.0) {
          // Apply perpendicular force to simulate arc
          const toPlayer = new THREE.Vector3().subVectors(p, s).normalize();
          const perp = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x);
          const force = perp.multiplyScalar(0.5 * (1 - dist/3.0));
          applyExternalForce([force.x, force.y, force.z]);
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

export const MirrorDrone: React.FC<EnemyProps> = () => {
  const meshRef = useRef<THREE.Group>(null);
  const { playerPosition } = useGameStore();

  useFrame(() => {
    if (!meshRef.current) return;
    // Mirror player movement across its own local origin relative to parent entity
    // Actually, MirrorDrone usually mirrors across the arena center.
    // If it's placed at some x,z, it should probably override its position.
    meshRef.current.position.set(-playerPosition[0], 0, -playerPosition[2]);
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
