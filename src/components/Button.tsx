import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ElementType;
    rightIcon?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        leftIcon: LeftIcon,
        rightIcon: RightIcon,
        children,
        disabled,
        ...props
    }, ref) => {
        const variants = {
            primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95",
            secondary: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
            outline: "border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
            ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
            danger: "bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/20 hover:bg-rose-600"
        };

        const sizes = {
            sm: "h-9 px-3 text-xs rounded-lg",
            md: "h-12 px-6 py-3 text-sm rounded-xl font-bold",
            lg: "h-14 px-8 text-base rounded-2xl font-bold",
            icon: "h-10 w-10 flex items-center justify-center rounded-xl"
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        {LeftIcon && <LeftIcon className="w-4 h-4" />}
                        {children}
                        {RightIcon && <RightIcon className="w-4 h-4" />}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
