import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Trail, Float } from '@react-three/drei';
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

  const {
    damagePlayer,
    trailColor,
    calculateSync,
    useGamepad,
    setUseGamepad,
    setSiphonDashing,
    setPlayerPosition,
    externalForce,
    resetExternalForce,
    isOnWarningTile
  } = useGameStore((state) => ({
    damagePlayer: state.damagePlayer,
    trailColor: state.equippedParts.trail,
    calculateSync: state.calculateSync,
    useGamepad: state.useGamepad,
    setUseGamepad: state.setUseGamepad,
    setSiphonDashing: state.setSiphonDashing,
    setPlayerPosition: state.setPlayerPosition,
    externalForce: state.externalForce,
    resetExternalForce: state.resetExternalForce,
    isOnWarningTile: state.isOnWarningTile
  }));

  useImperativeHandle(ref, () => meshRef.current!);

  const FRICTION = 0.95;
  const { thrusters, durability } = useGameStore(state => ({
      thrusters: state.equippedParts.thrusters,
      durability: state.equippedParts.durability
  }));

  const BASE_DASH_FORCE = 0.8 + (thrusters === 'MK3_ULTRA' ? 0.2 : 0);
  const MAX_DASH_FORCE = 2.5 + (thrusters === 'MK3_ULTRA' ? 0.5 : 0);
  const CHARGE_TIME = 1000;

  const handleDash = (type: 'STANDARD' | 'SIPHON') => {
    if (!meshRef.current) return;

    const gamepad = navigator.getGamepads()[0];

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

    if (useGamepad && gamepad) {
        const lx = gamepad.axes[0];
        const lz = gamepad.axes[1];
        if (Math.abs(lx) > 0.1 || Math.abs(lz) > 0.1) {
            direction = new THREE.Vector3(lx, 0, lz).normalize();
        } else {
            // Default to forward if no stick input
            direction = new THREE.Vector3(0, 0, -1).applyQuaternion(meshRef.current.quaternion);
        }

        // Snap Mode: round landing to hex center
        const predictedTarget = meshRef.current.position.clone().add(direction.clone().multiplyScalar(force * 5)); // Estimate landing
        const targetHex = worldToHex(predictedTarget.x, predictedTarget.z);
        const hexPos = hexToWorld(targetHex.q, targetHex.r);
        direction = new THREE.Vector3().subVectors(hexPos, meshRef.current.position).normalize();
    }

    velocity.current.add(direction.multiplyScalar(force));
    chargeStartTime.current = null;
    isCharging.current = false;

    if (type === 'SIPHON') {
      setSiphonDashing(true);
      setTimeout(() => setSiphonDashing(false), 500); // Siphon window
    }

    // Warning Dash Detection
    calculateSync(isOnWarningTile);
  };

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Gamepad Logic
    const gamepad = navigator.getGamepads()[0];
    if (gamepad) {
        const lx = gamepad.axes[0];
        const lz = gamepad.axes[1];
        if (Math.abs(lx) > 0.1 || Math.abs(lz) > 0.1) {
            const dir = new THREE.Vector3(lx, 0, lz).normalize();
            const lookAtPos = new THREE.Vector3().addVectors(meshRef.current.position, dir);
            meshRef.current.lookAt(lookAtPos);

            // Micro-adjustments with WASD/Stick
            velocity.current.add(dir.multiplyScalar(0.01));
        }

        // RT (index 7) for Dash
        if (gamepad.buttons[7].pressed && !isCharging.current) {
            isCharging.current = true;
            chargeStartTime.current = Date.now();
        } else if (!gamepad.buttons[7].pressed && isCharging.current) {
            handleDash('STANDARD');
        }

        // LT (index 6) for Siphon Dash
        if (gamepad.buttons[6].pressed) {
            handleDash('SIPHON');
        }

        // A Button (index 0) for Brake
        if (gamepad.buttons[0].pressed) {
            velocity.current.multiplyScalar(0.5);
        }
    }

    if (externalForce) {
        velocity.current.add(new THREE.Vector3(...externalForce).multiplyScalar(delta));
        resetExternalForce();
    }

    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta * 60));
    setPlayerPosition([meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z]);
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
      <Trail
        width={1.5}
        length={8}
        color={new THREE.Color(trailColor)}
        attenuation={(t) => t * t}
      >
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <MK3KineticRig ref={rigRef} color={trailColor} durability={durability} />
        </Float>
      </Trail>
    </group>
  );
});

export default Player;
