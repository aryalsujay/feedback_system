import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value, onChange }) => {
    return (
        <div className="flex justify-center gap-3 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="transition-transform duration-300 hover:scale-110 focus:outline-none"
                >
                    <Star
                        size={32}
                        className={`transition-colors duration-300 ${star <= value
                                ? 'text-pagoda-gold fill-pagoda-gold'
                                : 'text-pagoda-stone-300 fill-transparent'
                            }`}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
