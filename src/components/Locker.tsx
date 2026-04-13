import { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';

interface RigProps {
  color: string;
}

const MK3KineticRig = forwardRef<THREE.Group, RigProps>(({ color }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  useImperativeHandle(ref, () => groupRef.current!);

  return (
    <group ref={groupRef}>
      {/* Chassis */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[0.4, 0.2, 0.5]} />
        <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
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
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
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
