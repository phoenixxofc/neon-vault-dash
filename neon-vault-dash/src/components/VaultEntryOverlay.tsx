import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { motion } from 'framer-motion';

const VaultEntryOverlay: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const setGameState = useGameStore((state) => state.setGameState);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const logSequence = [
    "> CONNECTING TO NEON_VAULT...",
    "> BYPASSING ARCHITECT_FIREWALL...",
    "> CALIBRATING MK3_KINETIC_RIG...",
    "> SYNCING NEURAL_LINK..."
  ];

  useEffect(() => {
    if (!isConnected) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setGameState('PLAYING'), 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    let logIdx = 0;
    const logTimer = setInterval(() => {
      if (logIdx < logSequence.length) {
        setLogs((prev) => [...prev, logSequence[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logTimer);
      }
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, [isConnected, setGameState]);

  return (
    <div className="fixed inset-0 bg-void-black flex flex-col items-center justify-center crt z-50">
      {!isConnected ? (
        <div className="text-center">
            <h2 className="text-2xl mb-8 animate-pulse font-mono tracking-widest text-neon-cyan">
                {">"} WAITING FOR PILOT AUTHENTICATION...
            </h2>
            <button
                onClick={() => connect({ connector: injected() })}
                className="px-8 py-3 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 transition-all"
            >
                CONNECT_WALLET
            </button>
        </div>
      ) : (
        <>
            <div className="absolute left-10 top-1/2 -translate-y-1/2 font-mono text-neon-cyan opacity-80 max-w-md">
                <div className="text-xs mb-4 text-neon-magenta">{">"} SIGNATURE_VERIFIED: {address}</div>
                {logs.map((log, i) => (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className="mb-2"
                >
                    {log}
                </motion.div>
                ))}
            </div>

            <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-full h-full border-2 border-neon-cyan border-dashed rounded-full shadow-[0_0_15px_#00FFFF]"
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-mono text-neon-cyan">
                    {progress}%
                </div>
                </div>

                <div className="w-64 h-2 bg-void-purple rounded-full overflow-hidden border border-neon-cyan/20">
                <motion.div
                    className="h-full bg-neon-cyan shadow-[0_0_10px_#00FFFF]"
                    animate={{ width: `${progress}%` }}
                />
                </div>
                <div className="mt-4 font-mono text-neon-cyan animate-pulse tracking-widest">
                SYSTEM_STABILITY: OPTIMAL
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default VaultEntryOverlay;
