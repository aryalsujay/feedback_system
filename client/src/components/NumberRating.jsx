import React from 'react';

const NumberRating = ({ value, onChange, labels = {} }) => {
    // Default Labels Fallback if map is not fully populated
    const defaultLabels = {
        1: '', 2: '', 3: '', 4: '', 5: ''
    };
    const currentLabels = { ...defaultLabels, ...labels };

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex justify-between md:justify-center md:gap-4 w-full px-1">
                {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex flex-col items-center gap-2 flex-1">
                        <button
                            type="button"
                            onClick={() => onChange(num)}
                            className={`
                                h-10 w-10 md:h-12 md:w-12 rounded-lg border flex items-center justify-center text-lg font-medium transition-all duration-200 shadow-sm
                                ${value === num
                                    ? 'bg-pagoda-gold text-white border-pagoda-gold shadow-md scale-105'
                                    : 'bg-white text-pagoda-stone-600 border-pagoda-stone-200 hover:border-pagoda-gold/50 hover:bg-pagoda-gold/5'
                                }
                            `}
                        >
                            {num}
                        </button>
                        {/* Always display label */}
                        <span className={`text-[10px] md:text-xs text-center font-medium leading-tight h-8 flex items-start justify-center ${value === num ? 'text-pagoda-gold' : 'text-pagoda-stone-400'}`}>
                            {currentLabels[num]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NumberRating;
