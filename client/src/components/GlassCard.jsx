import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className = '', hoverEffect = false, onClick, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            whileHover={hoverEffect ? { translateY: -2 } : {}}
            onClick={onClick}
            className={twMerge(
                "bg-white border border-pagoda-stone-100 shadow-sm rounded-lg p-8",
                hoverEffect && "cursor-pointer hover:shadow-md transition-all duration-300",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
