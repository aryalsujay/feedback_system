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
    // Using 'fill' prop to fill the icon with color
    const renderOptions = [
        { val: 1, icon: Frown, color: '#ef4444', className: 'text-red-500' }, // Red-500
        { val: 2, icon: Frown, color: '#f97316', className: 'text-orange-500' }, // Orange-500
        { val: 3, icon: Meh, color: '#eab308', className: 'text-yellow-500' }, // Yellow-500
        { val: 4, icon: Smile, color: '#84cc16', className: 'text-lime-500' }, // Lime-500
        { val: 5, icon: Smile, color: '#16a34a', className: 'text-green-600' }, // Green-600
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
                                ${value === opt.val ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-110'}
                            `}
                        >
                            <div className={`
                                p-2 md:p-3 rounded-full transition-all duration-300
                                ${value === opt.val
                                    ? 'bg-white shadow-lg ring-2 ring-offset-2 ring-transparent scale-110'
                                    : 'bg-transparent text-gray-300' // dimmed state when not selected
                                }
                            `}
                                style={value === opt.val ? { boxShadow: `0 0 15px ${opt.color}40` } : {}}
                            >
                                <opt.icon
                                    size={40}
                                    strokeWidth={1.5}
                                    color={value === opt.val ? opt.color : (value ? '#d1d5db' : opt.color)} // Grey out unselected if one is selected, else show color
                                    fill={value === opt.val ? `${opt.color}20` : `${opt.color}10`} // Light fill
                                    className={`transition-colors duration-300 ${value === undefined ? '' : ''}`}
                                />
                            </div>
                        </button>
                        {/* Always display label */}
                        <span className={`text-[10px] md:text-sm text-center font-medium leading-tight h-8 flex items-start justify-center transition-colors duration-300 ${value === opt.val ? 'font-bold' : 'text-gray-400'}`}
                            style={{ color: value === opt.val ? opt.color : undefined }}>
                            {currentLabels[opt.val]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingSmiley;
