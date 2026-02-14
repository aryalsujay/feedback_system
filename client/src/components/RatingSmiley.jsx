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
            {/* Mobile-optimized: tighter spacing for all 5 smileys to fit on small screens, spacious on desktop */}
            <div className="flex justify-center gap-0.5 sm:gap-1 md:gap-6 py-2 md:py-4 w-full px-1 md:px-4">
                {renderOptions.map((opt, index) => (
                    <motion.div
                        key={opt.val}
                        className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0 w-[18%] max-w-[70px] md:w-auto md:min-w-[90px] md:max-w-[120px]"
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <motion.button
                            type="button"
                            onClick={() => onChange(opt.val)}
                            className="flex flex-col items-center gap-1 focus:outline-none w-full"
                            whileHover={{ scale: 1.15, y: -4 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <motion.div
                                className={`
                                    p-1 sm:p-1.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 relative
                                    ${value === opt.val
                                        ? `bg-gradient-to-br ${opt.bgGradient} shadow-lg md:shadow-2xl ring-1 sm:ring-2 md:ring-4 ring-offset-1 md:ring-offset-3 scale-105 md:scale-110 border-2`
                                        : `bg-gradient-to-br from-white/80 to-${opt.className.split('-')[1]}-100/30 hover:${opt.bgGradient} hover:opacity-80 shadow-sm md:shadow-md`
                                    }
                                `}
                                style={value === opt.val ? {
                                    boxShadow: `0 0 15px ${opt.color}50, 0 2px 8px ${opt.color}30`,
                                    borderColor: opt.color,
                                    ringColor: opt.color
                                } : {}}
                                animate={value === opt.val ? {
                                    rotate: [0, -6, 6, -6, 6, 0],
                                    scale: [1.05, 1.1, 1.05]
                                } : {}}
                                transition={{ duration: 0.6, repeat: value === opt.val ? Infinity : 0, repeatDelay: 2 }}
                            >
                                {/* Responsive emoji size - smaller on mobile */}
                                <div className={`text-2xl sm:text-3xl md:text-6xl transition-all duration-300 ${value === opt.val ? 'drop-shadow-lg' : 'opacity-70'}`}>
                                    {opt.emoji}
                                </div>

                                {/* Sparkle effect when selected */}
                                {value === opt.val && (
                                    <motion.div
                                        className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 text-xs sm:text-sm md:text-2xl"
                                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ✨
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.button>
                        {/* Responsive label with word wrap - increased mobile font size for better readability */}
                        <motion.span
                            className={`text-[10px] sm:text-xs md:text-base text-center font-bold leading-tight min-h-[28px] sm:min-h-[32px] md:h-10 flex items-start justify-center transition-all duration-300 ${value === opt.val ? 'scale-105 md:scale-110 text-shadow' : 'text-gray-500'}`}
                            style={{
                                color: value === opt.val ? opt.color : undefined,
                                textShadow: value === opt.val ? `0 2px 4px ${opt.color}40` : 'none',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto',
                                width: '100%'
                            }}
                            animate={value === opt.val ? { y: [0, -2, 0] } : {}}
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
