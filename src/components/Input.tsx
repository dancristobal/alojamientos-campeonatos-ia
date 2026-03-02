import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        {label}
                    </label>
                )}
                <input
                    className={cn(
                        "flex h-12 w-full rounded-xl border bg-white dark:bg-slate-900 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                        error ? "border-rose-500" : "border-slate-200 dark:border-slate-800",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="text-xs font-medium text-rose-500 ml-1 italic">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
