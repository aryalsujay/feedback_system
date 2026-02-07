import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className = '', hoverEffect = false, onClick, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            whileHover={hoverEffect ? {
                translateY: -4,
                boxShadow: "0 20px 25px -5px rgba(197, 160, 89, 0.15), 0 10px 10px -5px rgba(197, 160, 89, 0.1)"
            } : {}}
            onClick={onClick}
            className={twMerge(
                "bg-white/90 backdrop-blur-sm border border-pagoda-stone-100 shadow-sm rounded-xl p-8 relative overflow-hidden",
                hoverEffect && "cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-pagoda-gold/30",
                className
            )}
        >
            {/* Subtle gradient overlay */}
            {hoverEffect && (
                <div className="absolute inset-0 bg-gradient-to-br from-pagoda-gold/0 to-pagoda-gold/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            )}
            {children}
        </motion.div>
    );
};

export default GlassCard;
