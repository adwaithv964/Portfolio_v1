import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function AdminLogin() {
  const { login, isLoading, error, isAuthenticated, setError } = useAuth();
  const navigate = useNavigate();
  // Admin path — hardcoded since it's not a secret (the secret is the password)
  const DASHBOARD_PATH = '/adwaith-ctrl-0x1/dashboard';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  // Already authenticated? Go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(DASHBOARD_PATH, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    const success = await login(password);
    if (!success) {
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden select-none">

      {/* Cinematic background glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-900/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.03]">
        <span className="text-[22vw] font-black text-red-600 tracking-tighter uppercase whitespace-nowrap">ADMIN</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Netflix-style card */}
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="bg-[#141414]/95 backdrop-blur-2xl border border-red-600/30 rounded-2xl p-8 md:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/30 text-xs font-mono uppercase tracking-widest text-red-500 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              <span>Admin Access Portal</span>
            </div>
            <div className="text-3xl font-black text-red-600 tracking-tighter flex items-center justify-center gap-2 mb-1 drop-shadow-[0_2px_15px_rgba(229,9,20,0.9)]">
              ADWAITH<span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            </div>
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Portfolio Control Panel</p>
          </div>


          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-red-600/10 border border-red-600/30 rounded-xl text-sm text-red-400 font-mono"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/15 focus:border-red-600/60 rounded-xl px-4 pr-12 py-3.5 text-white placeholder-white/25 text-sm font-mono focus:outline-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!password || isLoading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-900/40 disabled:text-white/30 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Authenticate
                </>
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <span>bcrypt · HttpOnly Cookie</span>
            <span>Session: 15min idle</span>
          </div>
        </motion.div>

        {/* Back to portfolio link */}
        <div className="text-center mt-6">
          <a href="/" className="text-[11px] font-mono text-white/25 hover:text-red-500 transition-colors uppercase tracking-widest">
            ← Back to Portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
