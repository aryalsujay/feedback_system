import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import useQuestions from '../hooks/useQuestions';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Building2, Utensils, ShoppingBag, Home as HomeIcon, School, Loader2, Sparkles, LogOut } from 'lucide-react';

const iconMap = {
    global_pagoda: Building2,
    food_court: Utensils,
    souvenir_shop: ShoppingBag,
    dhamma_alaya: HomeIcon,
    dpvc: School
};

const Home = () => {
    const navigate = useNavigate();
    const { questions, loading, error } = useQuestions();
    const [adminSession, setAdminSession] = useState(null);

    useEffect(() => {
        const session = localStorage.getItem('departmentSession');
        if (session) {
            const parsedSession = JSON.parse(session);
            if (parsedSession.type === 'admin') {
                setAdminSession(parsedSession);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('departmentSession');
        navigate('/feedback-admin/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pagoda-gold" size={48} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-pagoda-error">Unable to load services. Please try again later.</div>;

    const departments = Object.entries(questions);

    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col items-center relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-pagoda-saffron/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pagoda-lotus/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            {/* Logout Button for Admin */}
            {adminSession && (
                <div className="absolute top-6 right-6 z-20">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="border-2 border-pagoda-saffron text-pagoda-maroon hover:bg-gradient-to-r hover:from-pagoda-saffron hover:to-pagoda-gold hover:text-white transition-all duration-300 flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 mt-8 z-10 max-w-2xl relative"
            >
                <motion.div
                    className="mb-6 flex justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Sparkles className="text-pagoda-gold" size={32} />
                </motion.div>
                <motion.h1
                    className="text-4xl md:text-5xl font-serif bg-gradient-to-r from-pagoda-maroon via-pagoda-gold to-pagoda-saffron bg-clip-text text-transparent mb-4 tracking-tight"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Global Vipassana Pagoda
                </motion.h1>
                <motion.div
                    className="h-1 w-24 bg-gradient-to-r from-pagoda-saffron via-pagoda-gold to-pagoda-maroon mx-auto mb-6 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: 96 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                ></motion.div>
                <motion.p
                    className="text-pagoda-stone-600 text-lg font-light italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    "May all beings be happy"
                </motion.p>
                <motion.p
                    className="text-pagoda-gold mt-2 text-sm uppercase tracking-widest font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    Feedback Portal
                </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full z-10 p-2">
                {departments.map(([id, data], index) => {
                    const Icon = iconMap[id] || Building2;
                    return (
                        <motion.div
                            key={id}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <GlassCard
                                hoverEffect={false}
                                delay={index * 0.15}
                                onClick={() => navigate(`/feedback/${id}`)}
                                className="flex flex-col items-center text-center gap-6 py-10 border-2 border-pagoda-stone-200 hover:border-pagoda-saffron/50 transition-all duration-300 group cursor-pointer bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-pagoda-gold/20"
                            >
                                <motion.div
                                    className="p-5 rounded-full bg-gradient-to-br from-pagoda-goldLight to-pagoda-gold/30 text-pagoda-maroon group-hover:from-pagoda-saffron group-hover:to-pagoda-gold group-hover:text-white transition-all duration-300 shadow-md group-hover:shadow-lg"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Icon size={36} strokeWidth={1.8} />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-serif text-pagoda-stone-900 group-hover:text-pagoda-maroon transition-colors">{data.name}</h2>
                                    <p className="text-sm text-pagoda-stone-500 group-hover:text-pagoda-saffron font-medium uppercase tracking-wider transition-colors">Provide Feedback</p>
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            <footer className="mt-auto py-8 text-pagoda-stone-400 text-xs text-center">
                © Global Vipassana Pagoda. All rights reserved.
            </footer>
        </div>
    );
};

export default Home;
