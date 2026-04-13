import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GhostPlayer: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);

  // Mock "fetched" coordinate array from "backend"
  const ghostPath = useMemo(() => {
    const path = [];
    for (let i = 0; i < 100; i++) {
        path.push(new THREE.Vector3(
            Math.sin(i * 0.2) * 5,
            0.5,
            Math.cos(i * 0.1) * 5
        ));
    }
    return path;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const index = Math.floor((t * 10) % ghostPath.length);
    const pos = ghostPath[index];
    meshRef.current.position.lerp(pos, 0.1);

    // Pulse opacity
    if (meshRef.current.children[0]) {
        const mat = (meshRef.current.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.opacity = 0.1 + Math.sin(t * 2) * 0.05;
    }
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
