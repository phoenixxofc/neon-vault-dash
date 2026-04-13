import { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';

interface RigProps {
  color: string;
  durability?: number;
}

const MK3KineticRig = forwardRef<THREE.Group, RigProps>(({ color, durability = 100 }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  useImperativeHandle(ref, () => groupRef.current!);

  const isBroken = durability <= 0;

  return (
    <group ref={groupRef}>
      {/* Chassis */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[0.4, 0.2, 0.5]} />
        <meshStandardMaterial color="#111" metalness={1} roughness={0.1} transparent={isBroken} opacity={isBroken ? 0.5 : 1} wireframe={isBroken} />
      </mesh>

      {/* Thrusters */}
      <mesh position={[0.2, 0, -0.4]}>
        <cylinderGeometry args={[0.1, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.2, 0, -0.4]}>
        <cylinderGeometry args={[0.1, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Power Cell / Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isBroken ? 0.5 : 5} />
      </mesh>

      {/* Plating */}
      <mesh position={[0, 0.1, -0.1]}>
        <boxGeometry args={[0.3, 0.05, 0.4]} />
        <meshStandardMaterial color="#222" metalness={0.8} />
      </mesh>
    </group>
  );
});

export default MK3KineticRig;
