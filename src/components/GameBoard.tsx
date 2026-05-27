"use client";

import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

export default function GameBoard() {
  const { board, dropToken, winningLine, winner, status, resetGame, isFlipping, completeGravityFlip, userProfile } = useGameStore();

  const isWinningCell = (r: number, c: number) => {
    return winningLine?.some(([winR, winC]) => winR === r && winC === c) ?? false;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Status Banner */}
      <div className="mb-8 h-12 flex items-center justify-center">
        {status === 'won' && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "text-2xl font-bold px-6 py-2 rounded-full glass-panel",
              winner === 1 ? "text-neon-pink glow-text-pink" : "text-neon-cyan glow-text-cyan"
            )}
          >
            Player {winner} Wins!
          </motion.div>
        )}
        {status === 'draw' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white px-6 py-2 rounded-full glass-panel"
          >
            Draw!
          </motion.div>
        )}
      </div>

      {/* Board */}
      <motion.div 
        animate={{ rotate: isFlipping ? 180 : 0 }}
        transition={{ duration: isFlipping ? 0.8 : 0, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (isFlipping) completeGravityFlip();
        }}
        className={cn(
          "p-4 rounded-xl border relative shadow-[0_0_40px_rgba(157,0,255,0.2)] glass-panel backdrop-blur-xl transition-all duration-1000",
          userProfile?.unlockedSkins?.includes('quantum_board') 
            ? "bg-transparent border-neon-purple shadow-[0_0_80px_rgba(157,0,255,0.4)] backdrop-blur-[50px]" 
            : "bg-board border-board-border"
        )}
      >
        <div className={cn(
          "grid grid-cols-7 gap-2 sm:gap-3 p-2 rounded-lg transition-all duration-1000",
          userProfile?.unlockedSkins?.includes('quantum_board') ? "bg-white/5 border border-white/10" : "bg-[#050508]/50"
        )}>
          {board.map((row, r) => (
            row.map((cell, c) => {
              const isWin = isWinningCell(r, c);
              const hasPlasma = userProfile?.unlockedSkins?.includes('plasma');
              
              return (
                <div 
                  key={`${r}-${c}`} 
                  className={cn(
                    "w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full relative flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-1000",
                    userProfile?.unlockedSkins?.includes('quantum_board') ? "bg-white/5 shadow-inner" : "bg-dark-bg inner-shadow"
                  )}
                  onClick={() => dropToken(c)}
                >
                  <AnimatePresence>
                    {cell && (
                      <motion.div
                        initial={{ y: -300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                        className={cn(
                          "absolute w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full",
                          hasPlasma 
                            ? (cell === 1 
                                ? "bg-gradient-to-tr from-neon-pink to-white shadow-[inset_0_0_20px_#fff] animate-pulse glow-pink" 
                                : "bg-gradient-to-tr from-neon-cyan to-white shadow-[inset_0_0_20px_#fff] animate-pulse glow-cyan")
                            : (cell === 1 ? "bg-neon-pink shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5)]" : "bg-neon-cyan shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5)]"),
                          isWin ? (cell === 1 ? "glow-pink z-10" : "glow-cyan z-10") : ""
                        )}
                      >
                        {!hasPlasma && (
                          <div className="absolute top-[10%] left-[20%] w-[60%] h-[30%] bg-white/30 rounded-full blur-[1px]"></div>
                        )}
                        {hasPlasma && (
                           <div className="absolute inset-0 bg-white/40 blur-md rounded-full mix-blend-overlay"></div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ))}
        </div>
      </motion.div>

      {/* Reset Button */}
      {(status === 'won' || status === 'draw') && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={resetGame}
          className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
        >
          <Play className="w-5 h-5" />
          Play Again
        </motion.button>
      )}
    </div>
  );
}
