import React, { useState, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isWithinInterval,
    parseISO,
    startOfDay,
    endOfDay,
    differenceInDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Trophy,
    Hotel
} from 'lucide-react';
import { useCampeonatos } from '../hooks/useCampeonatos';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

import type { Reserva } from '../types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Calendario: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { campeonatos, isLoading: loadingCam } = useCampeonatos();
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loadingRes, setLoadingRes] = useState(true);

    useEffect(() => {
        const fetchReservas = async () => {
            setLoadingRes(true);
            const { data } = await supabase.from('reservas').select('*');
            setReservas(data || []);
            setLoadingRes(false);
        };
        fetchReservas();
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const getEventsForDay = (day: Date) => {
        const dayCam = campeonatos.filter(c => isSameDay(parseISO(c.fecha), day));
        const dayRes = reservas.filter(r => {
            if (r.estado !== 'activa') return false;
            const start = startOfDay(parseISO(r.fecha_entrada));
            const end = endOfDay(parseISO(r.fecha_salida));
            return isWithinInterval(day, { start, end });
        });
        return { dayCam, dayRes };
    };

    if (loadingCam || loadingRes) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 glass rounded-3xl">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Cargando Calendario...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        {format(currentDate, 'MMMM yyyy', { locale: es }).toUpperCase()}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">Visualiza la ocupación y eventos programados.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border dark:border-slate-800">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-bold uppercase tracking-tighter"
                        onClick={() => setCurrentDate(new Date())}
                    >
                        Hoy
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="glass rounded-[2.5rem] overflow-hidden border dark:border-slate-800 shadow-2xl">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800">
                    {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
                        <div key={d} className="py-4 text-center text-xs font-black text-slate-400 tracking-widest">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                        const { dayCam, dayRes } = getEventsForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "min-h-[140px] p-2 border-r border-b dark:border-slate-800 last:border-r-0 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20",
                                    !isCurrentMonth && "bg-slate-50/30 dark:bg-slate-900/10 opacity-40"
                                )}
                            >
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className={cn(
                                        "text-sm font-black w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                                        isToday ? "bg-primary text-white" : "text-slate-500"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    {dayCam.map(c => (
                                        <Link
                                            key={c.id}
                                            to={`/campeonatos/${c.id}`}
                                            className="px-2 py-1 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-900/30 line-clamp-1 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-slate-900 transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 group"
                                            title={`Ver campeonato: ${c.nombre}`}
                                        >
                                            <Trophy className="w-3 h-3 shrink-0 group-hover:scale-110 transition-transform" />
                                            {c.nombre}
                                        </Link>
                                    ))}

                                    {dayRes.map(r => {
                                        const isCritical = r.estado === 'activa' &&
                                            r.es_reembolsable &&
                                            r.fecha_cancelacion &&
                                            differenceInDays(parseISO(r.fecha_cancelacion), new Date()) <= (window as any).__config_umbrales_critica;

                                        return (
                                            <Link
                                                key={r.id}
                                                to={`/campeonatos/${r.campeonato_id}?reservaId=${r.id}`}
                                                className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 border line-clamp-1 transition-all hover:text-white dark:hover:text-slate-900 hover:shadow-lg active:scale-95 group",
                                                    isCritical
                                                        ? "bg-rose-500/10 text-rose-600 border-rose-200 dark:bg-rose-400/10 dark:text-rose-400 dark:border-rose-900/30 hover:bg-rose-500 hover:shadow-rose-500/20"
                                                        : "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-900/30 hover:bg-emerald-500 hover:shadow-emerald-500/20"
                                                )}
                                                title={`${isCritical ? '⚠️ CRÍTICO: ' : ''}Ver reserva en ${r.alojamiento_nombre}`}
                                            >
                                                <Hotel className={cn("w-3 h-3 shrink-0 group-hover:scale-110 transition-transform", isCritical && "animate-pulse")} />
                                                <span className={cn(isCritical && "text-rose-700 dark:text-rose-300 font-black")}>
                                                    {r.alojamiento_nombre}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-8 justify-center pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-300 dark:border-blue-800" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Campeonatos</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-300 dark:border-emerald-800" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reservas Activas</span>
                </div>
            </div>
        </div>
    );
};

export default Calendario;
