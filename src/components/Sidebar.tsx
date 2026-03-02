import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Trophy,
    Calendar,
    Settings,
    X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useConfig } from '../hooks/useConfig';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { config } = useConfig();
    const navItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { title: 'Campeonatos', icon: Trophy, href: '/campeonatos' },
        { title: 'Calendario', icon: Calendar, href: '/calendario' },
        { title: 'Configuración', icon: Settings, href: '/settings' },
    ];

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                )}
                onClick={onClose}
            />

            {/* Sidebar container */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 w-64 glass z-50 transition-transform duration-300 transform lg:translate-x-0 bg-white dark:bg-slate-900",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 flex items-center justify-between border-b dark:border-slate-800">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            ArcheryRes
                        </h1>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-semibold",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/25 translate-x-1"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5",
                                    "group-hover:scale-110 transition-transform"
                                )} />
                                <span className="font-medium">{item.title}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t dark:border-slate-800">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(config.usuario.nombre)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">{config.usuario.nombre}</p>
                                <p className="text-[10px] text-slate-500 truncate">{config.usuario.rol}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
