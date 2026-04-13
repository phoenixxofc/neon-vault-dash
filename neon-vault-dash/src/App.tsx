import { Suspense, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Bloom, EffectComposer, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { useGameStore } from './store/useGameStore';
import * as THREE from 'three';
import Arena from './game/Arena';
import Player from './game/Player';
import CollisionManager from './game/CollisionManager';
import HUD from './components/HUD';
import VaultEntryOverlay from './components/VaultEntryOverlay';
import ForgeMenu from './components/ForgeMenu';
import { Web3Provider } from './components/Web3Provider';

function App() {
  const { gameState, setGameState, playerIntegrity, syncValue } = useGameStore();

  const startRun = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request denied", e);
    }
    setGameState('LOADING');
  }, [setGameState]);

  const playerRef = useRef<THREE.Group>(null);
  const bloomIntensity = 1.5 + (syncValue / 10000);

  return (
    <Web3Provider>
      <div className="w-screen h-screen bg-void-black text-neon-cyan font-mono overflow-hidden">
        {gameState === 'MENU' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black">
            <div className="relative z-10 text-center">
              <h1 className="text-8xl font-bold mb-4 tracking-tighter italic text-neon-cyan animate-pulse">
                NEON_VAULT_DASH
              </h1>
              <p className="text-xl mb-12 text-neon-cyan/60 tracking-widest">YEAR_2084 // OVERCLOCKED_VOID</p>
              <button
                onClick={startRun}
                className="px-12 py-4 border-2 border-neon-cyan text-2xl hover:bg-neon-cyan hover:text-black transition-all duration-300 shadow-[0_0_20px_#00FFFF]"
              >
                START_RUN
              </button>
            </div>
          </div>
        )}

        {gameState === 'LOADING' ? <VaultEntryOverlay /> : <></>}
        {gameState === 'FORGE' ? <ForgeMenu /> : <></>}
        {(gameState === 'PLAYING' || gameState === 'FORGE') ? <HUD /> : <></>}

        <div className="w-full h-full">
          <Canvas shadows camera={{ position: [0, 15, 15], fov: 45 }}>
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 10, 50]} />

            <Suspense fallback={null}>
              <Arena />
              {gameState === 'PLAYING' ? (
                <>
                  <Player ref={playerRef as React.RefObject<THREE.Group>} />
                  <CollisionManager playerRef={playerRef as React.RefObject<THREE.Group>} />
                </>
              ) : <></>}

              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Suspense>

            <EffectComposer>
              <Bloom luminanceThreshold={0.5} intensity={bloomIntensity} />
              {playerIntegrity < 30 ? (
                  <ChromaticAberration offset={new THREE.Vector2(0.005, 0.005)} />
              ) : <></>}
              {playerIntegrity < 15 ? (
                  <Glitch delay={new THREE.Vector2(1, 4)} duration={new THREE.Vector2(0.1, 0.3)} strength={new THREE.Vector2(0.1, 0.5)} />
              ) : <></>}
            </EffectComposer>
          </Canvas>
        </div>
      </div>
    </Web3Provider>
  );
}

export default App;
