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
        default: "bg-slate-200/80 text-slate-900 dark:bg-slate-800 dark:text-slate-200",
        success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20",
        warning: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20",
        error: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20",
        outline: "border-2 border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
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
