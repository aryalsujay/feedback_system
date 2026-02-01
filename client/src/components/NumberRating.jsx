import React from 'react';

const NumberRating = ({ value, onChange, labels = {} }) => {
    // Default Labels Fallback if map is not fully populated
    const defaultLabels = {
        1: '', 2: '', 3: '', 4: '', 5: ''
    };
    const currentLabels = { ...defaultLabels, ...labels };

    const getColors = (num) => {
        const colors = {
            1: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300',
            2: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
            3: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300',
            4: 'bg-lime-50 text-lime-600 border-lime-200 hover:bg-lime-100 hover:border-lime-300',
            5: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300'
        };

        const activeColors = {
            1: 'bg-red-500 text-white border-red-600 shadow-red-200',
            2: 'bg-orange-500 text-white border-orange-600 shadow-orange-200',
            3: 'bg-yellow-400 text-black border-yellow-500 shadow-yellow-200',
            4: 'bg-lime-500 text-white border-lime-600 shadow-lime-200',
            5: 'bg-green-600 text-white border-green-700 shadow-green-200'
        };

        return value === num ? activeColors[num] : colors[num];
    };

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex justify-between md:justify-center md:gap-4 w-full px-1">
                {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex flex-col items-center gap-2 flex-1">
                        <button
                            type="button"
                            onClick={() => onChange(num)}
                            className={`
                                h-10 w-10 md:h-12 md:w-12 rounded-lg border flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-sm
                                ${getColors(num)}
                                ${value === num ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-transparent' : 'opacity-90 hover:opacity-100 hover:scale-105'}
                            `}
                        >
                            {num}
                        </button>
                        {/* Always display label */}
                        <span className={`text-[10px] md:text-xs text-center font-medium leading-tight h-8 flex items-start justify-center transition-colors duration-300 ${value === num ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                            {currentLabels[num]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NumberRating;
