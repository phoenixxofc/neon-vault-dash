import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { hexToWorld } from '../../utils/hexGrid';

interface EnemyProps {
  q: number;
  r: number;
}

export const EchoHunter: React.FC<EnemyProps> = ({ q, r }) => {
  const meshRef = useRef<THREE.Group>(null);
  const pos = useMemo(() => hexToWorld(q, r), [q, r]);

  // Reacts to player dashes - logic would involve subscribing to dash events

  return (
    <group ref={meshRef} position={[pos.x, 0.5, pos.z]}>
      <mesh>
        <coneGeometry args={[0.4, 0.8, 4]} />
        <meshStandardMaterial color="#FFA500" emissive="#FFA500" />
      </mesh>
    </group>
  );
};

export const Tether: React.FC<{ posA: [number, number], posB: [number, number] }> = ({ posA, posB }) => {
  const meshARef = useRef<THREE.Group>(null);
  const meshBRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  const worldA = useMemo(() => hexToWorld(posA[0], posA[1]), [posA]);
  const worldB = useMemo(() => hexToWorld(posB[0], posB[1]), [posB]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const offset = Math.sin(t) * 2;
    if (meshARef.current && meshBRef.current && beamRef.current) {
      meshARef.current.position.x = worldA.x + offset;
      meshBRef.current.position.x = worldB.x + offset;

      const midPoint = new THREE.Vector3().lerpVectors(meshARef.current.position, meshBRef.current.position, 0.5);
      beamRef.current.position.copy(midPoint);
      beamRef.current.lookAt(meshBRef.current.position);
      beamRef.current.scale.z = meshARef.current.position.distanceTo(meshBRef.current.position);
    }
  });

  return (
    <group>
      <group ref={meshARef} position={[worldA.x, 0.5, worldA.z]}>
        <mesh><sphereGeometry args={[0.3]} /><meshStandardMaterial color="#FFFF00" /></mesh>
      </group>
      <group ref={meshBRef} position={[worldB.x, 0.5, worldB.z]}>
        <mesh><sphereGeometry args={[0.3]} /><meshStandardMaterial color="#FFFF00" /></mesh>
      </group>
      <mesh ref={beamRef} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={5} />
      </mesh>
    </group>
  );
};

export const MineLayer: React.FC<EnemyProps> = ({ q, r }) => {
  const pos = useMemo(() => hexToWorld(q, r), [q, r]);
  return (
    <mesh position={[pos.x, 0.1, pos.z]}>
      <cylinderGeometry args={[0.5, 0.5, 0.05, 6]} />
      <meshStandardMaterial color="#FF4500" transparent opacity={0.5} />
    </mesh>
  );
};
