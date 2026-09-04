import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ContentProvider } from '@/contexts/ContentContext.jsx';
import { injectDevToolsWarning } from '@/utils/security.js';

// Portfolio
import PortfolioApp from '@/PortfolioApp.jsx';

// Admin
import AdminLogin     from '@/admin/AdminLogin.jsx';
import AdminDashboard from '@/admin/AdminDashboard.jsx';
import ProtectedRoute from '@/admin/components/ProtectedRoute.jsx';
import AdminHero      from '@/admin/sections/AdminHero.jsx';
import AdminAbout     from '@/admin/sections/AdminAbout.jsx';
import AdminExpertise from '@/admin/sections/AdminExpertise.jsx';
import AdminSkills    from '@/admin/sections/AdminSkills.jsx';
import AdminProjects  from '@/admin/sections/AdminProjects.jsx';
import AdminFooter    from '@/admin/sections/AdminFooter.jsx';

// Admin route path — the password is the real secret, not this URL
const adminPath = 'adwaith-ctrl-0x1';

function AdminWelcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Select a section to edit</h2>
        <p className="text-sm text-white/40 font-mono mt-1">Use the sidebar to navigate between portfolio sections.</p>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    injectDevToolsWarning();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <Routes>
            {/* ── Portfolio (main site) ── */}
            <Route path="/" element={<PortfolioApp />} />

            {/* ── Admin: Login ── */}
            <Route path={`/${adminPath}`} element={<AdminLogin />} />

            {/* ── Admin: Protected Dashboard ── */}
            <Route
              path={`/${adminPath}/dashboard`}
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminWelcome />} />
              <Route path="hero"      element={<AdminHero />} />
              <Route path="about"     element={<AdminAbout />} />
              <Route path="expertise" element={<AdminExpertise />} />
              <Route path="skills"    element={<AdminSkills />} />
              <Route path="projects"  element={<AdminProjects />} />
              <Route path="footer"    element={<AdminFooter />} />
            </Route>

            {/* ── Catch-all → portfolio ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;