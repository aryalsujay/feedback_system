import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    variant = 'primary',
    className,
    ...props
}) => {
    const baseStyles = "px-6 py-2 rounded-lg font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95";

    const variants = {
        primary: "bg-gradient-to-r from-pagoda-gold to-pagoda-saffron text-white hover:from-pagoda-saffron hover:to-pagoda-gold shadow-md hover:shadow-xl hover:shadow-pagoda-gold/40 hover:-translate-y-0.5",
        secondary: "bg-pagoda-stone-100 text-pagoda-stone-700 hover:bg-pagoda-stone-200 border-2 border-pagoda-stone-300 hover:border-pagoda-gold/30 shadow-sm hover:shadow-md",
        outline: "border-2 border-pagoda-gold text-pagoda-maroon hover:bg-gradient-to-r hover:from-pagoda-gold hover:to-pagoda-saffron hover:text-white shadow-sm hover:shadow-md hover:shadow-pagoda-gold/20",
        ghost: "text-pagoda-stone-700 hover:bg-pagoda-stone-100 hover:text-pagoda-maroon",
        danger: "bg-gradient-to-r from-pagoda-error to-red-700 text-white hover:from-red-700 hover:to-pagoda-error shadow-md hover:shadow-lg"
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
