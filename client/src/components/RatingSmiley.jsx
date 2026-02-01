import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

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
    const renderOptions = [
        { val: 1, icon: Frown, className: 'text-red-500' },
        { val: 2, icon: Frown, className: 'text-orange-400 opacity-80' },
        { val: 3, icon: Meh, className: 'text-yellow-400' },
        { val: 4, icon: Smile, className: 'text-lime-500 opacity-80' },
        { val: 5, icon: Smile, className: 'text-green-600' },
    ];

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex justify-between md:justify-center md:gap-4 gap-1 py-4 w-full">
                {renderOptions.map((opt) => (
                    <div key={opt.val} className="flex flex-col items-center gap-2 flex-1">
                        <button
                            type="button"
                            onClick={() => onChange(opt.val)}
                            className={`
                                flex flex-col items-center gap-2 transition-all duration-300 group
                                ${value === opt.val ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-80 hover:scale-105'}
                            `}
                        >
                            <div className={`
                                p-2 md:p-3 rounded-full border transition-colors duration-300
                                ${value === opt.val
                                    ? `bg-white border-pagoda-gold shadow-md ${opt.className}`
                                    : 'bg-transparent border-transparent text-pagoda-stone-300'
                                }
                            `}>
                                <opt.icon
                                    size={36}
                                    strokeWidth={1.5}
                                />
                            </div>
                        </button>
                        {/* Always display label */}
                        <span className={`text-[10px] md:text-sm text-center font-medium leading-tight h-8 flex items-start justify-center ${value === opt.val ? 'text-pagoda-gold' : 'text-pagoda-stone-400'}`}>
                            {currentLabels[opt.val]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingSmiley;
