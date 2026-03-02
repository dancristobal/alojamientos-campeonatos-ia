import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className
}) => {
    const variants = {
        default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        error: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
        outline: "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400",
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center transition-colors",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export default Badge;
