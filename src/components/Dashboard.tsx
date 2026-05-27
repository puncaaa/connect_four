"use client";

import { Trophy, History, Shield, Zap, Settings, Orbit, LogIn, UserCircle, LogOut, Globe, X, ShoppingCart } from 'lucide-react';
import { useGameStore, GameMode } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import StoreModal from './StoreModal';

export default function Dashboard() {
  const { 
    currentPlayer, status, gameMode, setGameMode, 
    isAntigravityEnabled, setAntigravityEnabled, turnsUntilFlip, 
    userProfile, setAuthModalOpen, setUserProfile,
    findMatch, leaveMatch, isSearchingMatch, opponentProfile, roomId, multiplayerRole
  } = useGameStore();

  const [isStoreOpen, setStoreOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomCode = urlParams.get('room');
      // Only join if we aren't already in a room and have a code
      if (roomCode && !useGameStore.getState().roomId) {
        useGameStore.getState().joinMatch(roomCode);
      }
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserProfile(null);
  };

  return (
    <div className="w-full max-w-sm md:max-w-md lg:max-w-xs xl:max-w-sm shrink-0 flex flex-col gap-6">
      
      {/* Profile Panel */}
      <div className="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
        {gameMode === 'online' && (
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Globe size={100} className="text-neon-cyan animate-pulse" />
           </div>
        )}
        
        {userProfile ? (
          <>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white leading-tight">{userProfile.username}</div>
                <div className="text-xs text-white/50">{userProfile.location} • {userProfile.rank}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-white transition-colors relative z-10" title="Log Out">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="relative z-10">
              <div className="font-bold text-white/70">Guest Operative</div>
              <div className="text-xs text-white/40">Connect for ranked matches</div>
            </div>
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-colors text-sm font-bold relative z-10"
            >
              <LogIn className="w-4 h-4" /> Connect
            </button>
          </>
        )}
      </div>

      {/* Settings Panel */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-white/70">
          <Settings className="w-5 h-5" /> Mode Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase text-white/50 mb-2 block">Opponent</label>
            <div className="flex gap-2">
              <select 
                className="flex-1 bg-dark-bg border border-white/10 rounded-lg p-2 text-white outline-none focus:border-neon-cyan disabled:opacity-50"
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value as GameMode)}
                disabled={(status === 'playing' && useGameStore.getState().turnsCount > 0) || isSearchingMatch || roomId !== null}
              >
                <option value="local">Local 2-Player</option>
                <option value="ai-easy">AI - Easy</option>
                <option value="ai-medium">AI - Medium</option>
                <option value="ai-hard">AI - Hard</option>
                <option value="online">Online Ranked</option>
                <option value="duel">Duel by Link</option>
              </select>
              
              {(gameMode === 'online' || gameMode === 'duel') && !roomId && (
                <button
                  onClick={findMatch}
                  disabled={isSearchingMatch}
                  className="px-4 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/50 rounded-lg text-sm font-bold transition-colors flex items-center justify-center whitespace-nowrap min-w-[80px]"
                >
                  {isSearchingMatch ? '...' : gameMode === 'duel' ? 'Create' : 'Find'}
                </button>
              )}
              {roomId && (
                <button
                  onClick={leaveMatch}
                  className="px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-colors flex items-center justify-center"
                  title="Leave Match"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {isSearchingMatch && gameMode === 'online' && (
              <div className="mt-2 text-xs text-neon-cyan animate-pulse">Scanning global network for operatives...</div>
            )}
            
            {roomId && gameMode === 'duel' && !opponentProfile && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                <div className="text-[10px] text-white/40 uppercase mb-2">Send this link to a friend</div>
                <div className="bg-black/50 border border-neon-purple/30 text-neon-purple p-2 rounded text-xs font-mono select-all overflow-hidden whitespace-nowrap text-ellipsis">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomId}` : `/?room=${roomId}`}
                </div>
                <div className="mt-2 text-[10px] text-neon-cyan animate-pulse">Waiting for opponent to connect...</div>
              </div>
            )}
            
            {roomId && opponentProfile && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-white/40 uppercase mb-1">Opponent Found</div>
                  <div className="font-bold text-white text-sm">{opponentProfile.username}</div>
                  <div className="text-xs text-white/50">{opponentProfile.rank} • {opponentProfile.location}</div>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full shadow-[inset_0_-4px_10px_rgba(0,0,0,0.5)]",
                  multiplayerRole === 1 ? "bg-neon-cyan" : "bg-neon-pink" // Opposite of our color
                )}></div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70 flex items-center gap-2">
              <Orbit className="w-4 h-4 text-neon-purple" />
              Antigravity Mode
            </span>
            <button
              onClick={() => setAntigravityEnabled(!isAntigravityEnabled)}
              disabled={(status === 'playing' && useGameStore.getState().turnsCount > 0) || isSearchingMatch || roomId !== null}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative disabled:opacity-50",
                isAntigravityEnabled ? "bg-neon-purple" : "bg-white/10"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
                isAntigravityEnabled ? "translate-x-7" : "translate-x-1"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Current Turn Panel */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={120} className={currentPlayer === 1 ? 'text-neon-pink' : 'text-neon-cyan'} />
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white/70">Current Turn</h2>
          {isAntigravityEnabled && (
            <div className="text-xs font-mono bg-neon-purple/20 text-neon-purple px-2 py-1 rounded-full border border-neon-purple/30">
              Flip in {turnsUntilFlip}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full",
            currentPlayer === 1 ? "bg-neon-pink glow-pink" : "bg-neon-cyan glow-cyan"
          )}></div>
          <div>
            <div className={cn(
              "text-2xl font-black uppercase",
              currentPlayer === 1 ? "text-neon-pink glow-text-pink" : "text-neon-cyan glow-text-cyan"
            )}>
              {gameMode.startsWith('ai-') && currentPlayer === 2 ? 'AI CPU' : `Player ${currentPlayer}`}
            </div>
            <div className="text-sm text-white/50">{status === 'playing' ? 'Thinking...' : 'Game Over'}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 uppercase tracking-wider text-white/70">Stats {userProfile ? '' : '(Mock)'}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Rank</span>
            </div>
            <span className="font-bold text-white">{userProfile ? userProfile.rank : 'Bronze I'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Win/Loss</span>
            </div>
            <span className="font-bold text-white">{userProfile ? `${userProfile.wins} - ${userProfile.losses}` : '0 - 0'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/70">
              <History className="w-5 h-5 text-blue-400" />
              <span>Streak</span>
            </div>
            <span className="font-bold text-white">{userProfile ? userProfile.streak : 0} W</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStoreOpen(true)}
        className="w-full py-4 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(0,243,255,0.1)]"
      >
        <ShoppingCart className="w-5 h-5" /> Cosmic Marketplace
      </button>

      <StoreModal isOpen={isStoreOpen} onClose={() => setStoreOpen(false)} />
    </div>
  );
}
