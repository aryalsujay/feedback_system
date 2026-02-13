import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ value, onChange }) => {
    const [hoveredStar, setHoveredStar] = React.useState(null);
    const displayValue = hoveredStar !== null ? hoveredStar : value;

    const getStarColor = (star) => {
        const colors = {
            1: { text: 'text-red-600', fill: 'fill-red-600', shadow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] md:drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' },
            2: { text: 'text-orange-500', fill: 'fill-orange-500', shadow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] md:drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]' },
            3: { text: 'text-yellow-500', fill: 'fill-yellow-500', shadow: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.6)] md:drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]' },
            4: { text: 'text-lime-500', fill: 'fill-lime-500', shadow: 'drop-shadow-[0_0_8px_rgba(132,204,22,0.6)] md:drop-shadow-[0_0_15px_rgba(132,204,22,0.8)]' },
            5: { text: 'text-green-600', fill: 'fill-green-600', shadow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] md:drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]' }
        };
        return colors[star] || colors[5];
    };

    return (
        <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 py-3 md:py-4 w-full">
            {[1, 2, 3, 4, 5].map((star) => {
                const starColor = getStarColor(star);
                return (
                    <motion.button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        onTouchStart={() => setHoveredStar(star)}
                        onTouchEnd={() => setHoveredStar(null)}
                        className="focus:outline-none flex-shrink-0"
                        whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: star * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <Star
                                className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 transition-all duration-300 ${
                                    star <= displayValue
                                        ? `${starColor.text} ${starColor.fill} ${starColor.shadow}`
                                        : 'text-pagoda-stone-400 fill-transparent hover:text-pagoda-saffron'
                                }`}
                                strokeWidth={2}
                            />
                        </motion.div>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default StarRating;
