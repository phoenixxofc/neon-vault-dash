import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GhostPlayer: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.x = Math.sin(t * 0.5) * 4;
    meshRef.current.position.z = Math.cos(t * 0.3) * 4;
    meshRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.1;
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
            color="#00FFFF"
            transparent
            opacity={0.2}
            wireframe
        />
      </mesh>
    </group>
  );
};

export default GhostPlayer;
