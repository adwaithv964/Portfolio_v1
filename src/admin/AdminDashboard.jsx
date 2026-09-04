import { useState } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';

const navItems = [
  { label: 'Hero',      path: 'hero',      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'About',     path: 'about',     icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Expertise', path: 'expertise', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { label: 'Skills',    path: 'skills',    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { label: 'Projects',  path: 'projects',  icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { label: 'Footer',    path: 'footer',    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const adminPath = import.meta.env.VITE_ADMIN_PATH || 'adwaith-ctrl-0x1';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    if (!logoutConfirm) { setLogoutConfirm(true); return; }
    await logout();
    navigate(`/${adminPath}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex overflow-hidden select-none">

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative shrink-0 bg-[#0f0f0f] border-r border-white/8 flex flex-col z-30 overflow-hidden"
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.5)]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-black text-white tracking-tight leading-none">ADWAITH</p>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">Control Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="ml-auto text-white/30 hover:text-white transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
            </svg>
          </button>
        </div>

        {/* Section label */}
        {sidebarOpen && (
          <p className="px-4 pt-5 pb-2 text-[9px] font-mono text-white/25 uppercase tracking-widest">
            Sections
          </p>
        )}

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1 px-2 mt-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={`/${adminPath}/dashboard/${item.path}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 group
                ${isActive
                  ? 'bg-red-600/20 border border-red-600/40 text-red-400'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                }`
              }
              title={!sidebarOpen ? item.label : ''}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
              </svg>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Portfolio link + Logout */}
        <div className="px-2 pb-4 border-t border-white/8 pt-3 flex flex-col gap-1.5 mt-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Portfolio"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {sidebarOpen && <span>View Site</span>}
          </a>
          <button
            onClick={handleLogout}
            onBlur={() => setLogoutConfirm(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              logoutConfirm
                ? 'bg-red-600/30 border border-red-600/50 text-red-400'
                : 'text-white/30 hover:text-red-400 hover:bg-red-600/10 border border-transparent'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>{logoutConfirm ? 'Confirm?' : 'Logout'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/8 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Portfolio Admin</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/25 uppercase tracking-widest">
            <span>Session: 15min idle</span>
            <span className="text-red-600/60">|</span>
            <span>bcrypt · HttpOnly</span>
          </div>
        </header>

        {/* Page content via nested routes */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
