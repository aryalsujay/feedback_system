import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';
import { motion } from 'framer-motion';

const RatingSmiley = ({ value, onChange, labels = {} }) => {
    // 5-point scale
    // Default labels if none provided
    const defaultLabels = {
        1: 'Very Dissatisfied',
        2: 'Dissatisfied',
        3: 'Neutral',
        4: 'Satisfied',
        5: 'Very Satisfied'
    };

    const currentLabels = { ...defaultLabels, ...labels };

    // Revised options with available icons (Frown, Meh, Smile)
    // Enhanced with Dhamma colors
    const renderOptions = [
        { val: 1, icon: Frown, color: '#DC143C', emoji: '😞', className: 'text-red-600', bgGradient: 'from-red-500 to-red-600' }, // Red
        { val: 2, icon: Frown, color: '#FF6347', emoji: '😕', className: 'text-orange-600', bgGradient: 'from-orange-500 to-orange-600' }, // Orange
        { val: 3, icon: Meh, color: '#FFC107', emoji: '😐', className: 'text-yellow-600', bgGradient: 'from-yellow-500 to-yellow-600' }, // Yellow
        { val: 4, icon: Smile, color: '#9ACD32', emoji: '😊', className: 'text-lime-600', bgGradient: 'from-lime-500 to-lime-600' }, // Light Green
        { val: 5, icon: Smile, color: '#22C55E', emoji: '😄', className: 'text-green-600', bgGradient: 'from-green-500 to-green-600' }, // Green
    ];

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex justify-between md:justify-center md:gap-4 gap-1 py-4 w-full">
                {renderOptions.map((opt, index) => (
                    <motion.div
                        key={opt.val}
                        className="flex flex-col items-center gap-2 flex-1"
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <motion.button
                            type="button"
                            onClick={() => onChange(opt.val)}
                            className="flex flex-col items-center gap-3 focus:outline-none"
                            whileHover={{ scale: 1.2, y: -6 }}
                            whileTap={{ scale: 0.85 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <motion.div
                                className={`
                                    p-3 md:p-4 rounded-2xl transition-all duration-300 relative
                                    ${value === opt.val
                                        ? `bg-gradient-to-br ${opt.bgGradient} shadow-2xl ring-4 ring-offset-3 scale-110 border-2`
                                        : `bg-gradient-to-br from-white/80 to-${opt.className.split('-')[1]}-100/30 hover:${opt.bgGradient} hover:opacity-80 shadow-md`
                                    }
                                `}
                                style={value === opt.val ? {
                                    boxShadow: `0 0 30px ${opt.color}70, 0 6px 20px ${opt.color}50`,
                                    borderColor: opt.color,
                                    ringColor: opt.color
                                } : {}}
                                animate={value === opt.val ? {
                                    rotate: [0, -8, 8, -8, 8, 0],
                                    scale: [1.1, 1.15, 1.1]
                                } : {}}
                                transition={{ duration: 0.6, repeat: value === opt.val ? Infinity : 0, repeatDelay: 2 }}
                            >
                                {/* Large emoji */}
                                <div className={`text-5xl md:text-6xl transition-all duration-300 ${value === opt.val ? 'drop-shadow-lg' : 'opacity-70'}`}>
                                    {opt.emoji}
                                </div>

                                {/* Sparkle effect when selected */}
                                {value === opt.val && (
                                    <motion.div
                                        className="absolute -top-1 -right-1 text-2xl"
                                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ✨
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.button>
                        <motion.span
                            className={`text-xs md:text-base text-center font-bold leading-tight h-10 flex items-start justify-center transition-all duration-300 ${value === opt.val ? 'scale-110 text-shadow' : 'text-gray-500'}`}
                            style={{
                                color: value === opt.val ? opt.color : undefined,
                                textShadow: value === opt.val ? `0 2px 4px ${opt.color}40` : 'none'
                            }}
                            animate={value === opt.val ? { y: [0, -3, 0] } : {}}
                            transition={{ duration: 0.4, repeat: value === opt.val ? Infinity : 0, repeatDelay: 1 }}
                        >
                            {currentLabels[opt.val]}
                        </motion.span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RatingSmiley;
