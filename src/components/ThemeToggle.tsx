import React, { useState } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes: { id: 'light' | 'dark' | 'system', label: string, icon: React.ElementType }[] = [
        { id: 'light', label: 'Luz', icon: Sun },
        { id: 'dark', label: 'Oscuro', icon: Moon },
        { id: 'system', label: 'Sistema', icon: Monitor }
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[2];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs group"
                aria-label="Seleccionar tema"
            >
                <currentTheme.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline-block">{currentTheme.label}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-40 glass rounded-2xl z-50 border border-slate-200 dark:border-slate-800 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold transition-all",
                                    theme === t.id 
                                        ? "bg-primary text-white" 
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                )}
                            >
                                <t.icon className="w-4 h-4 shrink-0" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
