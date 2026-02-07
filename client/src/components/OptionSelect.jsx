import React from 'react';
import { motion } from 'framer-motion';

const OptionSelect = ({ value, onChange, options = [] }) => {
    return (
        <div className="flex flex-wrap justify-center gap-3">
            {options.map((option, index) => (
                <motion.button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`
                        px-6 py-4 rounded-2xl border-3 text-base md:text-lg font-bold transition-all duration-300 min-w-[140px] flex-1 md:flex-none focus:outline-none
                        ${value === option
                            ? 'bg-gradient-to-br from-pagoda-saffron via-pagoda-gold to-pagoda-goldDark text-white border-pagoda-goldDark shadow-2xl shadow-pagoda-gold/50 ring-4 ring-pagoda-saffron/30'
                            : 'bg-gradient-to-br from-white to-pagoda-goldLight/20 text-pagoda-brown border-pagoda-gold/40 hover:border-pagoda-saffron/60 hover:from-pagoda-goldLight/30 hover:to-pagoda-saffron-light/20 shadow-md hover:shadow-lg'
                        }
                    `}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: value === option ? 1.08 : 1,
                        y: value === option ? [0, -4, 0] : 0
                    }}
                    transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        y: { repeat: value === option ? Infinity : 0, duration: 1.5 }
                    }}
                    whileHover={{ scale: 1.12, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {option}
                </motion.button>
            ))}
        </div>
    );
};

export default OptionSelect;
