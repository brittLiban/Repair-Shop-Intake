import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import TweaksPanel from './components/shared/TweaksPanel';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import IntakeWizard from './pages/IntakeWizard';
import StaffDashboard from './pages/StaffDashboard';
import StaffTicket from './pages/StaffTicket';

const ACCENT_HOVER = {
  '#2C882B': '#006225',
  '#6CB443': '#2C882B',
  '#006225': '#004a1c',
  '#418FDE': '#2A6FB7',
};

const DEFAULTS = { theme: 'light', accent: '#2C882B', density: 'comfortable' };

function useTweaks() {
  const [tweaks, setTweaksState] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('grc-tweaks') || '{}') };
    } catch {
      return DEFAULTS;
    }
  });

  const setTweak = (key, value) => {
    setTweaksState((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('grc-tweaks', JSON.stringify(next));
      return next;
    });
  };

  return [tweaks, setTweak];
}

function RequireStaff({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/staff/login" replace />;
  if (user.role !== 'staff') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [tweaks, setTweak] = useTweaks();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', tweaks.theme);
    root.setAttribute('data-density', tweaks.density);
    root.style.setProperty('--accent', tweaks.accent);
    root.style.setProperty('--accent-hover', ACCENT_HOVER[tweaks.accent] || tweaks.accent);
  }, [tweaks.theme, tweaks.accent, tweaks.density]);

  return (
    <div className="app">
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/intake" element={<IntakeWizard />} />
          <Route path="/staff/login" element={<AuthPage />} />

          {/* Staff only */}
          <Route path="/staff" element={<RequireStaff><StaffDashboard /></RequireStaff>} />
          <Route path="/staff/tickets/:id" element={<RequireStaff><StaffTicket /></RequireStaff>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}
