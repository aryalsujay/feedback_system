import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import useQuestions from '../hooks/useQuestions';
import { motion } from 'framer-motion';
import { Building2, Utensils, ShoppingBag, Home as HomeIcon, School, Loader2 } from 'lucide-react';

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

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pagoda-gold" size={48} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-pagoda-error">Unable to load services. Please try again later.</div>;

    const departments = Object.entries(questions);

    return (
        <div className="min-h-screen p-6 md:p-12 flex flex-col items-center relative">

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 mt-8 z-10 max-w-2xl"
            >
                <div className="mb-4 flex justifying-center">
                    {/* Placeholder for Logo if needed, or just text */}
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-pagoda-stone-900 mb-4 tracking-tight">
                    Global Vipassana Pagoda
                </h1>
                <div className="h-1 w-24 bg-pagoda-gold mx-auto mb-6 rounded-full opacity-60"></div>
                <p className="text-pagoda-stone-500 text-lg font-light italic">
                    "May all beings be happy"
                </p>
                <p className="text-pagoda-stone-500 mt-2 text-sm uppercase tracking-widest">
                    Feedback Portal
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full z-10 p-2">
                {departments.map(([id, data], index) => {
                    const Icon = iconMap[id] || Building2;
                    return (
                        <GlassCard
                            key={id}
                            hoverEffect={true}
                            delay={index * 0.1}
                            onClick={() => navigate(`/feedback/${id}`)}
                            className="flex flex-col items-center text-center gap-6 py-10 border border-pagoda-stone-100 hover:border-pagoda-gold/30 transition-colors group"
                        >
                            <div className="p-4 rounded-full bg-pagoda-stone-50 text-pagoda-gold group-hover:bg-pagoda-gold group-hover:text-white transition-all duration-300 shadow-sm">
                                <Icon size={32} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-serif text-pagoda-stone-800">{data.name}</h2>
                                <p className="text-sm text-pagoda-stone-400 font-medium uppercase tracking-wider">Provide Feedback</p>
                            </div>
                        </GlassCard>
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
