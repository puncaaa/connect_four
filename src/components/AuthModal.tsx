"use client";

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUserProfile } = useGameStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('Almaty');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
      // Mock Auth if Supabase isn't connected
      setTimeout(() => {
        setUserProfile({
          id: 'mock-123',
          email,
          username: isLogin ? email.split('@')[0] : username,
          location: isLogin ? 'Almaty' : city,
          rank: 'Diamond III',
          wins: 42,
          losses: 18,
          streak: 4,
          credits: 1450,
          unlockedSkins: []
        });
        setAuthModalOpen(false);
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Profile fetch happens via a listener in _app/layout/page typically, 
        // but we'll just mock the fetch for now
        setUserProfile({
          id: 'real-123',
          email,
          username: email.split('@')[0],
          location: 'Almaty',
          rank: 'Bronze I',
          wins: 0,
          losses: 0,
          streak: 0,
          credits: 0,
          unlockedSkins: []
        });
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        // Normally we'd insert into a "profiles" table here:
        // await supabase.from('profiles').insert([{ id: data.user?.id, username, location: city }])
        
        setUserProfile({
          id: data.user?.id || 'new-123',
          email,
          username,
          location: city,
          rank: 'Bronze I',
          wins: 0,
          losses: 0,
          streak: 0
        });
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full max-w-md bg-panel border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-neon-purple"></div>
            
            <button 
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
              {isLogin ? 'Access Terminal' : 'Create Operative'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
            
            {!supabase && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-200/70 text-xs">
                Running in Mock Mode. Please connect Supabase for real auth.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs uppercase text-white/50 mb-1">Callsign (Username)</label>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan transition-colors"
                      placeholder="e.g. CyberNinja"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-white/50 mb-1">Sector (City/University)</label>
                    <select 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan transition-colors"
                    >
                      <option value="Almaty">Almaty</option>
                      <option value="Astana">Astana</option>
                      <option value="KBTU">KBTU</option>
                      <option value="NU">NU</option>
                      <option value="Global">Global</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Secure Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan transition-colors"
                  placeholder="agent@matrix.com"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Passcode</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all relative overflow-hidden group"
              >
                {loading ? 'Processing...' : (isLogin ? 'Authenticate' : 'Register')}
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/0 via-neon-cyan/20 to-neon-cyan/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-white/50 hover:text-neon-cyan transition-colors"
              >
                {isLogin ? 'Need clearance? Create an operative.' : 'Already registered? Authenticate.'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
