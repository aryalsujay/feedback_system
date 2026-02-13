import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { LogIn, Sparkles, Lock, User } from 'lucide-react';
import { API_BASE_URL } from '../config';

const DepartmentLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/department-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store session in localStorage
                localStorage.setItem('departmentSession', JSON.stringify(data.session));

                // Redirect based on user type
                if (data.session.type === 'admin') {
                    // Admin sees all department cards
                    navigate('/admin/home');
                } else {
                    // Department user sees only their feedback form
                    navigate(`/feedback/${data.session.departmentId}`);
                }
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = () => {
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-pagoda-sand via-pagoda-goldLight/20 to-pagoda-lotus/10">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-pagoda-saffron/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pagoda-lotus/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12 z-10"
            >
                <motion.div
                    className="mb-6 flex justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Sparkles className="text-pagoda-gold" size={32} />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-pagoda-maroon via-pagoda-gold to-pagoda-saffron bg-clip-text text-transparent mb-4">
                    Global Vipassana Pagoda
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-pagoda-saffron via-pagoda-gold to-pagoda-maroon mx-auto mb-6 rounded-full"></div>
                <p className="text-pagoda-stone-600 text-lg font-light italic">
                    "May all beings be happy"
                </p>
                <p className="text-pagoda-gold mt-2 text-sm uppercase tracking-widest font-semibold">
                    Department Login
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="z-10 w-full max-w-md"
            >
                <GlassCard className="p-8 bg-white/90 backdrop-blur-md border-2 border-pagoda-gold/30">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-gradient-to-br from-pagoda-goldLight to-pagoda-gold/30">
                            <LogIn className="text-pagoda-maroon" size={32} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-pagoda-stone-700 mb-2">
                                <User className="inline mr-2" size={16} />
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-pagoda-stone-200 rounded-lg focus:outline-none focus:border-pagoda-saffron transition-colors"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-pagoda-stone-700 mb-2">
                                <Lock className="inline mr-2" size={16} />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-pagoda-stone-200 rounded-lg focus:outline-none focus:border-pagoda-saffron transition-colors"
                                placeholder="Enter your password"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-pagoda-saffron to-pagoda-gold text-white hover:from-pagoda-gold hover:to-pagoda-saffron transition-all duration-300 py-3 text-lg font-semibold"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    {/* Analytics Admin Login - Hidden from public, access via direct URL */}
                    {/* Uncomment below if you want to show the link */}
                    {/* <div className="mt-6 pt-6 border-t border-pagoda-stone-200">
                        <button
                            onClick={handleAdminLogin}
                            className="w-full text-pagoda-stone-600 hover:text-pagoda-maroon transition-colors text-sm"
                        >
                            Admin Login →
                        </button>
                    </div> */}
                </GlassCard>
            </motion.div>

            <footer className="mt-auto py-8 text-pagoda-stone-400 text-xs text-center z-10">
                © Global Vipassana Pagoda. All rights reserved.
            </footer>
        </div>
    );
};

export default DepartmentLogin;
