import React from 'react';

const OptionSelect = ({ value, onChange, options = [] }) => {
    return (
        <div className="flex flex-wrap justify-center gap-3">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`
                        px-4 py-3 rounded-lg border text-sm md:text-base font-medium transition-all duration-200 min-w-[120px] flex-1 md:flex-none
                        ${value === option
                            ? 'bg-pagoda-gold text-white border-pagoda-gold shadow-md'
                            : 'bg-white text-pagoda-stone-600 border-pagoda-stone-200 hover:border-pagoda-gold/50 hover:bg-pagoda-gold/5'
                        }
                    `}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};

export default OptionSelect;
