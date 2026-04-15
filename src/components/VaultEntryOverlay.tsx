import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';

const VaultEntryOverlay: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [assetProgress, setAssetProgress] = useState(100); // Default to 100 if no assets trigger manager
  const [logs, setLogs] = useState<string[]>([]);
  const setGameState = useGameStore((state) => state.setGameState);

  const logSequence = [
    "> CONNECTING TO NEON_VAULT...",
    "> BYPASSING ARCHITECT_FIREWALL...",
    "> CALIBRATING MK3_KINETIC_RIG...",
    "> SYNCING NEURAL_LINK..."
  ];

  useEffect(() => {
    // THREE.js Asset Loading Manager
    THREE.DefaultLoadingManager.onStart = () => {
        setAssetProgress(0);
    };

    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const p = Math.round((itemsLoaded / itemsTotal) * 100);
        setAssetProgress(p);
        console.log(`[SYSTEM] Loading: ${url} (${itemsLoaded}/${itemsTotal})`);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
        console.log("[SYSTEM] Assets fully loaded");
        setAssetProgress(100);
    };

    THREE.DefaultLoadingManager.onError = (url) => {
        console.error(`[SYSTEM] Error loading asset: ${url}`);
    };

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    let logIdx = 0;
    const logTimer = setInterval(() => {
      if (logIdx < logSequence.length) {
        setLogs((prev) => [...prev, logSequence[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logTimer);
      }
    }, 400);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  useEffect(() => {
      const combinedProgress = Math.min(progress, assetProgress ?? 100);
      if (combinedProgress >= 100) {
          const timeout = setTimeout(() => {
              console.log("[SYSTEM] Entering Vault Arena...");
              setGameState('PLAYING');
          }, 800);
          return () => clearTimeout(timeout);
      }
  }, [progress, assetProgress, setGameState]);

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[100] font-mono overflow-hidden">
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,4px_100%] opacity-50" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-10">
        <div className="w-full flex justify-between items-start mb-20">
            <div className="text-neon-cyan opacity-80 text-sm space-y-1">
                {logs.map((log, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i}
                    >
                        {log}
                    </motion.div>
                ))}
            </div>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center mb-10">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-0 border border-neon-cyan/20 rounded-full"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-4 border border-neon-magenta/10 rounded-full border-dashed"
            />
            <div className="text-6xl font-bold text-neon-cyan tracking-tighter">
                {Math.min(progress, assetProgress ?? 100)}<span className="text-xl opacity-50">%</span>
            </div>
        </div>

        <div className="w-full space-y-8 flex flex-col items-center">
            <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-neon-cyan shadow-[0_0_15px_#00FFFF]"
                    animate={{ width: `${Math.min(progress, assetProgress ?? 100)}%` }}
                />
            </div>

            <div className="h-12 flex items-center justify-center">
                <div className="text-[10px] tracking-[0.5em] text-neon-cyan animate-pulse">
                    {progress < 100 ? "SYNCING_DATA_STREAMS..." : "BREACH_INITIALIZED"}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VaultEntryOverlay;
