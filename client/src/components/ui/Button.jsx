import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    variant = 'primary',
    className,
    ...props
}) => {
    const baseStyles = "px-6 py-2 rounded-md font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-pagoda-gold text-white hover:bg-[#B08D4C] shadow-sm hover:shadow-md",
        secondary: "bg-pagoda-stone-100 text-pagoda-stone-700 hover:bg-pagoda-stone-200 border border-pagoda-stone-300",
        outline: "border-2 border-pagoda-gold text-pagoda-gold hover:bg-pagoda-gold hover:text-white",
        ghost: "text-pagoda-stone-700 hover:bg-pagoda-stone-50",
        danger: "bg-pagoda-error text-white hover:bg-[#7F1D1D] shadow-sm"
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
