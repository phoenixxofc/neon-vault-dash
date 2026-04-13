import React from 'react';
import { useGameStore } from '../store/useGameStore';

const HUD: React.FC = () => {
  const { playerIntegrity, currentLevel, collectedShards, syncValue } = useGameStore();

  return (
    <div className="fixed inset-0 pointer-events-none p-8 font-mono flex flex-col justify-between z-10">
      <div className="flex justify-between items-start">
        <div className="bg-black/50 border border-neon-cyan p-4">
          <div className="text-xs text-neon-cyan mb-1">INTEGRITY_INDEX</div>
          <div className="w-48 h-4 bg-void-purple relative">
             <div
               className="h-full bg-neon-cyan transition-all duration-300"
               style={{ width: `${playerIntegrity}%` }}
             />
             <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white mix-blend-difference">
               {playerIntegrity}%
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <div className="bg-black/50 border border-neon-magenta p-4 text-right">
                <div className="text-xs text-neon-magenta mb-1">SYNC_VALUE</div>
                <div className="text-2xl text-white">{syncValue.toLocaleString()}</div>
            </div>

            <div className="bg-black/50 border border-neon-yellow p-2 text-right">
                <div className="text-[10px] text-neon-yellow mb-1">NEXT_FORGE_LEVEL</div>
                <div className="w-32 h-1 bg-white/10 ml-auto">
                    <div
                        className="h-full bg-neon-yellow shadow-[0_0_10px_#FFFF00]"
                        style={{ width: `${((currentLevel % 5) / 5) * 100}%` }}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="flex justify-between items-end">
         <div className="bg-black/50 border border-neon-teal p-4">
            <div className="text-xs text-neon-teal mb-1">DATA_SHARDS</div>
            <div className="text-xl text-white">{collectedShards}</div>
         </div>
         <div className="bg-black/50 border border-neon-yellow p-4 text-right">
            <div className="text-xs text-neon-yellow mb-1">VAULT_DEPTH</div>
            <div className="text-xl text-white">LVL_{currentLevel}</div>
         </div>
      </div>
    </div>
  );
};

export default HUD;
