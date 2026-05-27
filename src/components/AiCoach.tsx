"use client";

import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function AiCoach() {
  const { status, winner, turnsCount, gameMode, multiplayerRole } = useGameStore();
  const [analysis, setAnalysis] = useState('');
  
  useEffect(() => {
    if (status === 'won' || status === 'draw') {
      // Generate a dynamic message based on game state
      let message = '';
      
      if (status === 'draw') {
        message = "A complete stalemate. Your defense protocols were impenetrable, but your offensive vectors lacked variance.";
      } else {
        const isPlayerWin = 
          gameMode === 'local' ? true : 
          gameMode === 'online' ? winner === multiplayerRole : 
          winner === 1;

        if (isPlayerWin) {
          if (turnsCount < 10) {
            message = "Incredible velocity! You dismantled their defense in record time. Tactical assessment: S-Tier.";
          } else if (turnsCount > 25) {
            message = "A grueling war of attrition. Your endurance and spatial manipulation ultimately secured the sector.";
          } else {
            message = "Solid execution. You identified the optimal alignment vector and neutralized the target efficiently.";
          }
        } else {
          message = "Defeat detected. You failed to anticipate their vertical stacking. Recommend calibrating your predictive matrices.";
        }
      }
      
      // Typewriter effect simulation
      setAnalysis('');
      let i = 0;
      const interval = setInterval(() => {
        setAnalysis(message.substring(0, i));
        i++;
        if (i > message.length) clearInterval(interval);
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [status, winner, turnsCount, gameMode, multiplayerRole]);

  if (status === 'playing' || status === 'idle') return null;

  const isWin = status === 'won' && (gameMode === 'local' || (gameMode === 'online' ? winner === multiplayerRole : winner === 1));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 w-full max-w-lg p-1 rounded-2xl bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple p-[1px]"
      >
        <div className="bg-dark-bg/95 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Bot size={80} className={isWin ? "text-neon-cyan" : "text-neon-pink"} />
          </div>
          
          <h3 className="flex items-center gap-2 text-sm uppercase tracking-widest text-white/50 mb-3 font-bold">
            <Bot className="w-4 h-4" /> AI Tactical Analysis
          </h3>
          
          <div className="flex gap-4">
            <div className={cn(
              "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center inner-shadow border",
              isWin ? "bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan" : 
              status === 'draw' ? "bg-white/10 border-white/20 text-white" : 
              "bg-neon-pink/20 border-neon-pink/50 text-neon-pink"
            )}>
              {isWin ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-white/90 text-sm leading-relaxed font-mono">
                {analysis}
                <span className="animate-pulse">_</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
