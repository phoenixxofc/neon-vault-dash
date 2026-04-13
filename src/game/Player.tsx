import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { worldToHex, hexToWorld } from '../utils/hexGrid';
import MK3KineticRig from '../components/Locker';

const Player = forwardRef<THREE.Group>((_, ref) => {
  const meshRef = useRef<THREE.Group>(null);
  const rigRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const chargeStartTime = useRef<number | null>(null);
  const isCharging = useRef(false);

  const { mouse, raycaster, camera } = useThree();

  const { damagePlayer, trailColor, calculateSync, useGamepad, setUseGamepad } = useGameStore((state) => ({
    damagePlayer: state.damagePlayer,
    trailColor: state.equippedParts.trail,
    calculateSync: state.calculateSync,
    useGamepad: state.useGamepad,
    setUseGamepad: state.setUseGamepad
  }));

  useImperativeHandle(ref, () => meshRef.current!);

  const FRICTION = 0.95;
  const BASE_DASH_FORCE = 0.8;
  const MAX_DASH_FORCE = 2.5;
  const CHARGE_TIME = 1000;

  const handleDash = (type: 'STANDARD' | 'SIPHON') => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const targetPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPoint);

    let direction = new THREE.Vector3().subVectors(targetPoint, meshRef.current.position);
    direction.y = 0;
    direction.normalize();

    let force = BASE_DASH_FORCE;
    if (type === 'STANDARD' && chargeStartTime.current) {
        const elapsed = Date.now() - chargeStartTime.current;
        force = BASE_DASH_FORCE + Math.min(1, elapsed / CHARGE_TIME) * (MAX_DASH_FORCE - BASE_DASH_FORCE);
    }

    if (useGamepad) {
        const targetHex = worldToHex(targetPoint.x, targetPoint.z);
        const hexPos = hexToWorld(targetHex.q, targetHex.r);
        direction = new THREE.Vector3().subVectors(hexPos, meshRef.current.position).normalize();
    }

    velocity.current.add(direction.multiplyScalar(force));
    chargeStartTime.current = null;
    isCharging.current = false;
    calculateSync();
  };

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta * 60));
    velocity.current.multiplyScalar(FRICTION);

    if (!useGamepad) {
        raycaster.setFromCamera(mouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const targetPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, targetPoint);
        const lookAtPos = new THREE.Vector3(targetPoint.x, meshRef.current.position.y, targetPoint.z);
        meshRef.current.lookAt(lookAtPos);
    }

    const speed = velocity.current.length();
    const stretch = 1 + speed * 1.5;
    const squash = 1 / Math.sqrt(stretch);
    if (rigRef.current) {
        rigRef.current.scale.set(squash, squash, stretch);
    }

    if (meshRef.current.position.y < -0.5) {
      damagePlayer(100);
    }
  });

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isCharging.current = true;
        chargeStartTime.current = Date.now();
      }
      if (e.button === 2) handleDash('SIPHON');
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) handleDash('STANDARD');
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [useGamepad]);

  // Gamepad Detection
  useEffect(() => {
      const checkGamepad = () => {
          const gamepads = navigator.getGamepads();
          if (gamepads[0]) setUseGamepad(true);
      };
      const interval = setInterval(checkGamepad, 1000);
      return () => clearInterval(interval);
  }, [setUseGamepad]);

  return (
    <group ref={meshRef} position={[0, 0.5, 0]}>
      <MK3KineticRig ref={rigRef} color={trailColor} />
    </group>
  );
});

export default Player;
