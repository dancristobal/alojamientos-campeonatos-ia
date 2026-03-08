import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2, Check } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    isSuccess?: boolean;
    leftIcon?: React.ElementType;
    rightIcon?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading = false,
        isSuccess = false,
        leftIcon: LeftIcon,
        rightIcon: RightIcon,
        children,
        disabled,
        ...props
    }, ref) => {
        const variants = {
            primary: "bg-primary text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 active:translate-y-0",
            secondary: "bg-slate-200/50 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 backdrop-blur-sm shadow-sm",
            outline: "border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500",
            ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
            danger: "bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:-translate-y-0.5 active:scale-95"
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
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
                    isSuccess ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[0.98]" : variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isSuccess ? (
                    <div className="flex items-center gap-2 animate-in zoom-in slide-in-from-bottom-2 duration-300">
                        <Check className="w-5 h-5" />
                        <span className="hidden sm:inline">¡Guardado!</span>
                    </div>
                ) : isLoading ? (
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
