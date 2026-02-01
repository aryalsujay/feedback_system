import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import FeedbackForm from './pages/FeedbackForm';
import Button from './components/ui/Button';
import GlassCard from './components/GlassCard';

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
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feedback/:departmentId" element={<FeedbackForm />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
