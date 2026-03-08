import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div 
            className={cn(
                "animate-pulse rounded-md bg-slate-200 dark:bg-slate-800",
                className
            )} 
        />
    );
};

export const ChampionshipSkeleton: React.FC = () => {
    return (
        <div className="glass rounded-[2rem] p-8 border border-transparent">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <Skeleton className="w-20 h-20 rounded-[1.5rem] shrink-0" />
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-1/3 rounded-lg" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex gap-8">
                        <Skeleton className="h-5 w-24 rounded-lg" />
                        <Skeleton className="h-5 w-32 rounded-lg" />
                        <Skeleton className="h-5 w-20 rounded-lg" />
                    </div>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
            </div>
        </div>
    );
};

export const ReservationSkeleton: React.FC = () => {
    return (
        <div className="glass rounded-[2rem] p-8 border-l-4 border-l-slate-200 dark:border-l-slate-800">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-48 rounded-lg" />
                            <Skeleton className="h-4 w-32 rounded-lg" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-40 rounded-xl" />
                    </div>
                    <div className="flex gap-6 pt-4 border-t dark:border-slate-800">
                        <Skeleton className="h-5 w-40 rounded-lg" />
                        <Skeleton className="h-5 w-24 rounded-lg" />
                    </div>
                </div>
                <div className="flex lg:flex-col gap-3 pt-6 lg:pt-0 lg:pl-8 border-t lg:border-t-0 lg:border-l dark:border-slate-800">
                    <div className="flex gap-2">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="w-10 h-10 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DashboardCardSkeleton: React.FC = () => {
    return (
        <div className="glass p-6 rounded-[2rem] flex items-center gap-5">
            <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
        </div>
    );
};
