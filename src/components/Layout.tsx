import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell } from 'lucide-react';

const Layout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between p-4 lg:px-8 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                            Gestión de Reservas
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all group">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white dark:border-slate-900" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
