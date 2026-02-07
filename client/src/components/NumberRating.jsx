import React from 'react';
import { motion } from 'framer-motion';

const NumberRating = ({ value, onChange, labels = {} }) => {
    // Default Labels Fallback if map is not fully populated
    const defaultLabels = {
        1: '', 2: '', 3: '', 4: '', 5: ''
    };
    const currentLabels = { ...defaultLabels, ...labels };

    const getColors = (num) => {
        const colors = {
            1: 'bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-300 hover:from-red-100 hover:to-red-200 hover:border-red-400',
            2: 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-300 hover:from-orange-100 hover:to-orange-200 hover:border-orange-400',
            3: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-300 hover:from-yellow-100 hover:to-yellow-200 hover:border-yellow-400',
            4: 'bg-gradient-to-br from-lime-50 to-lime-100 text-lime-700 border-lime-300 hover:from-lime-100 hover:to-lime-200 hover:border-lime-400',
            5: 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-300 hover:from-green-100 hover:to-green-200 hover:border-green-400'
        };

        const activeColors = {
            1: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-700 shadow-2xl shadow-red-500/50',
            2: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-700 shadow-2xl shadow-orange-500/50',
            3: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-yellow-700 shadow-2xl shadow-yellow-500/50',
            4: 'bg-gradient-to-br from-lime-500 to-lime-600 text-white border-lime-700 shadow-2xl shadow-lime-500/50',
            5: 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-700 shadow-2xl shadow-green-500/50'
        };

        return value === num ? activeColors[num] : colors[num];
    };

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex justify-between md:justify-center md:gap-4 w-full px-1">
                {[1, 2, 3, 4, 5].map((num, index) => (
                    <motion.div
                        key={num}
                        className="flex flex-col items-center gap-2 flex-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                    >
                        <motion.button
                            type="button"
                            onClick={() => onChange(num)}
                            className={`
                                h-12 w-12 md:h-16 md:w-16 rounded-2xl border-3 flex items-center justify-center text-2xl md:text-3xl font-black transition-all duration-300 focus:outline-none
                                ${getColors(num)}
                                ${value === num ? 'ring-4 ring-offset-3' : 'opacity-90 hover:opacity-100 shadow-md'}
                            `}
                            style={value === num ? {
                                transform: 'scale(1.15)',
                            } : {}}
                            whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
                            whileTap={{ scale: 0.9 }}
                            animate={value === num ? {
                                scale: [1.15, 1.2, 1.15],
                                rotate: [0, 5, -5, 0]
                            } : { scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                                scale: { repeat: value === num ? Infinity : 0, duration: 1.5 }
                            }}
                        >
                            {num}
                        </motion.button>
                        <motion.span
                            className={`text-[10px] md:text-xs text-center font-medium leading-tight h-8 flex items-start justify-center transition-colors duration-300 ${value === num ? 'text-gray-800 font-bold' : 'text-gray-400'}`}
                            animate={value === num ? { y: [0, -2, 0] } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            {currentLabels[num]}
                        </motion.span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default NumberRating;
