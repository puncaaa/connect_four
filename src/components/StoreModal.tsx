"use client";

import { ShoppingCart, X, Zap, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export default function StoreModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { userProfile, setUserProfile, setAuthModalOpen } = useGameStore();

  const handlePurchase = (cost: number, itemId: string) => {
    if (!userProfile) {
      onClose();
      setAuthModalOpen(true);
      return;
    }
    
    if (userProfile.credits >= cost) {
      setUserProfile({
        ...userProfile,
        credits: userProfile.credits - cost,
        unlockedSkins: [...(userProfile.unlockedSkins || []), itemId]
      });
    }
  };

  const hasItem = (itemId: string) => userProfile?.unlockedSkins?.includes(itemId);
  const credits = userProfile?.credits || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl bg-dark-bg border border-neon-purple/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(157,0,255,0.2)] relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 sticky top-0 bg-dark-bg/90 backdrop-blur pb-2 gap-4">
              <h2 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-neon-purple" />
                Marketplace
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
                  <Sparkles className="w-3 h-3" /> Upgrade to Pro
                </button>
                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span className="font-mono text-sm font-bold">{credits.toLocaleString()} CR</span>
                </div>
                <button 
                  onClick={onClose}
                  className="text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item 1 */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group relative overflow-hidden flex flex-col">
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap size={100} className="text-neon-cyan" />
                </div>
                <h3 className="font-bold text-lg text-white mb-1">Plasma Tokens</h3>
                <p className="text-xs text-white/50 mb-4 line-clamp-2">Replace your standard tokens with highly unstable plasma cores.</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-mono text-neon-cyan font-bold">500 CR</span>
                  <button 
                    disabled={hasItem('plasma')}
                    onClick={() => handlePurchase(500, 'plasma')}
                    className="px-4 py-1.5 rounded-lg bg-neon-cyan/20 text-neon-cyan font-bold text-xs uppercase tracking-wider hover:bg-neon-cyan/30 disabled:opacity-50 disabled:bg-white/5 disabled:text-white/50 disabled:cursor-not-allowed"
                  >
                    {hasItem('plasma') ? 'Equipped' : 'Acquire'}
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-xl border border-neon-purple/30 bg-neon-purple/10 hover:border-neon-purple hover:bg-neon-purple/20 transition-all group relative overflow-hidden flex flex-col">
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-neon-purple text-[10px] font-bold uppercase rounded text-black">Featured</div>
                <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={100} className="text-neon-purple" />
                </div>
                <h3 className="font-bold text-lg text-white mb-1">Quantum Board</h3>
                <p className="text-xs text-white/50 mb-4 line-clamp-2">A transparent glass board that distorts space-time behind it.</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-mono text-neon-purple font-bold">1,200 CR</span>
                  <button 
                    disabled={hasItem('quantum_board')}
                    onClick={() => handlePurchase(1200, 'quantum_board')}
                    className="px-4 py-1.5 rounded-lg bg-neon-purple text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(157,0,255,0.5)] disabled:opacity-50 disabled:bg-white/5 disabled:text-white/50 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {hasItem('quantum_board') ? 'Equipped' : 'Equip'}
                  </button>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-neon-pink/50 hover:bg-neon-pink/5 transition-all group relative overflow-hidden md:col-span-2 flex flex-col">
                <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity translate-x-1/4 -translate-y-1/4">
                  <Shield size={160} className="text-neon-pink" />
                </div>
                <h3 className="font-bold text-lg text-white mb-1">AI Coach VIP License</h3>
                <p className="text-sm text-white/50 mb-4 w-full md:w-2/3">Unlock predictive analysis during your matches. The AI will highlight optimal drop columns based on 10,000 simulated futures.</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-mono text-neon-pink font-bold">2,500 CR</span>
                  <button 
                    disabled={hasItem('ai_vip') || credits < 2500}
                    onClick={() => handlePurchase(2500, 'ai_vip')}
                    className="px-6 py-2 rounded-lg bg-neon-pink/20 text-neon-pink font-bold text-sm uppercase tracking-wider hover:bg-neon-pink/30 border border-neon-pink/50 disabled:opacity-50 disabled:bg-white/5 disabled:border-white/10 disabled:text-white/50 disabled:cursor-not-allowed"
                  >
                    {hasItem('ai_vip') ? 'Active' : credits < 2500 ? 'Insufficient Funds' : 'Acquire VIP'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
