import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { translations } from './translations';
import Home from './pages/Home';
import DepartmentLogin from './pages/DepartmentLogin';
import FeedbackForm from './pages/FeedbackForm';
import Button from './components/ui/Button';
import GlassCard from './components/GlassCard';
import { motion } from 'framer-motion';
import { CheckCircle2, Home as HomeIcon, Sparkles } from 'lucide-react';

// Admin Imports
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/SettingsEnhanced';
import ChangePassword from './pages/admin/ChangePassword';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState('en');
  const t = translations[language];

  // Load language from localStorage
  React.useEffect(() => {
    const savedLang = localStorage.getItem('feedbackLanguage') || 'en';
    setLanguage(savedLang);
  }, []);

  // Auto-redirect after 3 seconds
  React.useEffect(() => {
    const departmentSession = localStorage.getItem('departmentSession');
    const returnPath = localStorage.getItem('feedbackReturnPath');

    const timer = setTimeout(() => {
      if (departmentSession) {
        const session = JSON.parse(departmentSession);
        if (session.type === 'admin') {
          navigate('/admin/home');
        }
      } else if (returnPath) {
        // Public user - return to their department page
        navigate(returnPath);
      } else {
        // Fallback to GVP form (safest default)
        navigate('/pr');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleReturnHome = () => {
    const departmentSession = localStorage.getItem('departmentSession');
    const returnPath = localStorage.getItem('feedbackReturnPath');

    if (departmentSession) {
      const session = JSON.parse(departmentSession);
      if (session.type === 'admin') {
        navigate('/admin/home');
      }
    } else if (returnPath) {
      // Public user - return to their department page
      navigate(returnPath);
    } else {
      // Fallback to GVP form (safest default)
      navigate('/pr');
    }
  };

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 relative overflow-hidden bg-gradient-to-br from-pagoda-sand via-pagoda-goldLight/20 to-pagoda-lotus/10">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pagoda-saffron/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pagoda-lotus/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-pagoda-gold/40 rounded-full"
          style={{ left: `${particle.x}%`, top: '100%' }}
          animate={{
            y: [0, -1000],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
      >
        <GlassCard className="max-w-md w-full flex flex-col items-center py-12 px-8 bg-white/80 backdrop-blur-md border-2 border-pagoda-gold/30 shadow-2xl shadow-pagoda-gold/20 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pagoda-gold/10 to-transparent animate-[shimmer_3s_infinite]"></div>

          <motion.div
            className="mb-6 relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <CheckCircle2 className="text-pagoda-saffron drop-shadow-lg" size={80} strokeWidth={1.5} />
            </motion.div>

            {/* Sparkles around the check */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="text-pagoda-gold" size={24} />
            </motion.div>
          </motion.div>

          <motion.div
            className="text-6xl mb-6"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🙏
          </motion.div>

          <motion.h1
            className="text-4xl font-serif bg-gradient-to-r from-pagoda-maroon via-pagoda-gold to-pagoda-saffron bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {t.thankYou}
          </motion.h1>

          <motion.div
            className="h-1 w-20 bg-gradient-to-r from-pagoda-saffron via-pagoda-gold to-pagoda-maroon rounded-full mb-6"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          ></motion.div>

          <motion.p
            className="text-pagoda-stone-700 mb-8 leading-relaxed text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {t.feedbackReceived}<br />
            <span className="text-pagoda-gold font-medium">{t.thankYouMessage}</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="z-50 relative"
          >
            <Button
              onClick={handleReturnHome}
              variant="outline"
              className="border-2 border-pagoda-saffron text-pagoda-maroon hover:bg-gradient-to-r hover:from-pagoda-saffron hover:to-pagoda-gold hover:text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 px-8 py-3 mt-2 cursor-pointer"
            >
              <HomeIcon size={18} />
              {t.submitAnother}
            </Button>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes - Direct Department Access (No Login Required) */}
            <Route path="/pr" element={<FeedbackForm />} />
            <Route path="/fc" element={<FeedbackForm />} />
            <Route path="/dpvc" element={<FeedbackForm />} />
            <Route path="/dlaya" element={<FeedbackForm />} />
            <Route path="/ss" element={<FeedbackForm />} />
            <Route path="/feedback/:departmentId" element={<FeedbackForm />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* Feedback Admin Login & Routes (admin/admin977) */}
            <Route path="/feedback-admin/login" element={<DepartmentLogin />} />
            <Route path="/admin/home" element={<Home />} />

            {/* Analytics Admin Routes (admin/admin123) - Hidden from public */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/analytics" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            {/* Homepage - Redirect to GVP form by default */}
            <Route path="/" element={<Navigate to="/pr" replace />} />
            <Route path="*" element={<Navigate to="/pr" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
