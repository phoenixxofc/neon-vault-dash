import { Suspense, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Bloom, EffectComposer, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { useGameStore } from './store/useGameStore';
import * as THREE from 'three';
import Arena from './game/Arena';
import Player from './game/Player';
import GhostPlayer from './game/GhostPlayer';
import EntityManager from './game/EntityManager';
import CollisionManager from './game/CollisionManager';
import HUD from './components/HUD';
import VaultEntryOverlay from './components/VaultEntryOverlay';
import ForgeMenu from './components/ForgeMenu';
import { Web3Provider } from './components/Web3Provider';
import ErrorBoundary from './components/ErrorBoundary';

const GameLoadingFallback = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-neon-cyan font-mono">
        <div className="animate-pulse">INITIALIZING_WORLD_DATA...</div>
    </div>
);

function App() {
  const { gameState, setGameState, playerIntegrity, syncValue, tickIntegrityDecay } = useGameStore();

  useEffect(() => {
    console.log(`[SYSTEM] Game State Transition: ${gameState}`);
    // Expose for debugging
    (window as any).gameState = gameState;
  }, [gameState]);

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
      <ErrorBoundary>
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

        <div className="w-full h-full relative" style={{ minHeight: '100vh', width: '100vw' }}>
          <Canvas
            shadows
            camera={{ position: [0, 15, 15], fov: 45 }}
            onCreated={({ gl }) => {
              gl.setClearColor('#050505');
              console.log("[SYSTEM] WebGL Context Initialized");
            }}
            onError={(e) => console.error("[SYSTEM] Canvas Error:", e)}
          >
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 10, 50]} />

            <Suspense fallback={<GameLoadingFallback />}>
              <Arena />
              {gameState === 'PLAYING' ? (
                <>
                  <Player ref={playerRef as React.RefObject<THREE.Group>} />
                  <GhostPlayer />
                  <EntityManager />
                  <CollisionManager playerRef={playerRef as React.RefObject<THREE.Group>} />
                </>
              ) : <></>}

              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              <LogicController tickIntegrityDecay={tickIntegrityDecay} />
            </Suspense>

            <ErrorBoundary>
              <EffectComposer multisampling={0} disableNormalPass>
                <Bloom luminanceThreshold={0.5} intensity={bloomIntensity} />
                {playerIntegrity < 30 ? (
                    <ChromaticAberration offset={new THREE.Vector2(0.005, 0.005)} />
                ) : <></>}
                {playerIntegrity < 15 ? (
                    <Glitch delay={new THREE.Vector2(1, 4)} duration={new THREE.Vector2(0.1, 0.3)} strength={new THREE.Vector2(0.1, 0.5)} />
                ) : <></>}
              </EffectComposer>
            </ErrorBoundary>
          </Canvas>
        </div>
      </div>
      </ErrorBoundary>
    </Web3Provider>
  );
}

function LogicController({ tickIntegrityDecay }: { tickIntegrityDecay: (d: number) => void }) {
    const setIsOnWarningTile = useGameStore(state => state.setIsOnWarningTile);
    useFrame((_, delta) => {
        // Reset warning tile state each frame, HexTiles will set it to true if player is on one.
        setIsOnWarningTile(false);
        tickIntegrityDecay(delta);
    });
    return null;
}

export default App;
