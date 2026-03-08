import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    variant?: 'default' | 'compact';
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    variant = 'default'
}) => {
    if (variant === 'compact') {
        return (
            <div className="glass p-8 text-center rounded-[2rem] border-dashed border-2 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                    <Icon className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm max-w-xs mx-auto leading-relaxed">
                    {description}
                </p>
                {actionLabel && onAction && (
                    <Button variant="ghost" size="sm" onClick={onAction} className="mt-4 text-primary font-bold">
                        {actionLabel}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="glass p-16 text-center rounded-[2.5rem] border-dashed border-2 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors duration-500" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">{title}</h3>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-lg leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <div className="mt-10">
                    <Button onClick={onAction} className="shadow-lg shadow-primary/20">
                        {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EmptyState;
