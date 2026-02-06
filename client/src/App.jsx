import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import FeedbackForm from './pages/FeedbackForm';
import Button from './components/ui/Button';
import GlassCard from './components/GlassCard';

// Admin Imports
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/SettingsEnhanced';

const SuccessPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
    <GlassCard className="max-w-md w-full flex flex-col items-center py-12 px-8">
      <div className="mb-6 text-6xl">
        🙏
      </div>
      <h1 className="text-3xl font-serif text-pagoda-gold mb-4">Thank You</h1>
      <p className="text-pagoda-stone-500 mb-8 leading-relaxed">
        Your valuable feedback has been received.<br />
        Thank you for helping us improve.
      </p>
      <a href="/" className="inline-block mt-2">
        <Button variant="outline">Return to Home</Button>
      </a>
    </GlassCard>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/feedback/:departmentId" element={<FeedbackForm />} />
            <Route path="/success" element={<SuccessPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/analytics" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
