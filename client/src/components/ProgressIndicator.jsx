import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const ProgressIndicator = ({ current, total }) => {
    const percentage = (current / total) * 100;

    return (
        <div className="sticky top-0 z-[9999] bg-white/95 backdrop-blur-lg shadow-lg border-b-2 border-pagoda-gold/30">
            <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{
                                scale: current === total ? [1, 1.2, 1] : 1,
                                rotate: 0
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                scale: { repeat: current === total ? Infinity : 0, duration: 1.5 }
                            }}
                        >
                            <CheckCircle2
                                className={`${current === total ? 'text-green-600' : 'text-pagoda-gold'} drop-shadow-sm`}
                                size={24}
                            />
                        </motion.div>
                        <span className="text-sm font-semibold text-pagoda-stone-700">
                            {current === total ? (
                                <motion.span
                                    className="text-green-600 flex items-center gap-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    All questions answered 🙏
                                </motion.span>
                            ) : (
                                <>Progress: <span className="text-pagoda-gold font-bold">{current}</span> of {total}</>
                            )}
                        </span>
                    </div>
                    <motion.span
                        className="text-xs text-pagoda-stone-700 font-bold bg-pagoda-goldLight/40 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-pagoda-gold/20"
                        key={percentage}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {Math.round(percentage)}%
                    </motion.span>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="h-2.5 bg-pagoda-stone-200/60 rounded-full overflow-hidden shadow-inner relative">
                    <motion.div
                        className="h-full bg-gradient-to-r from-pagoda-saffron via-pagoda-gold to-pagoda-goldDark rounded-full shadow-md relative"
                        style={{
                            backgroundSize: '200% 100%'
                        }}
                        initial={{ width: 0 }}
                        animate={{
                            width: `${percentage}%`,
                            backgroundPosition: ['0% 0%', '100% 0%']
                        }}
                        transition={{
                            width: { duration: 0.6, ease: "easeOut" },
                            backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" }
                        }}
                    >
                        {/* Animated shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProgressIndicator;
