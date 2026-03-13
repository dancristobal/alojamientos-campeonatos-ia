import React, { useMemo } from 'react';
import { useCampeonatos } from '../hooks/useCampeonatos';
import { supabase } from '../lib/supabase';
import {
    Trophy,
    Hotel,
    Calendar,
    AlertCircle,
    ChevronRight,
    History,
    Info,
    Wallet
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { format, isAfter, isBefore, addDays, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { useConfig } from '../hooks/useConfig';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Badge from '../components/Badge';
import Button from '../components/Button';
import type { Reserva, ReservaConMetricas } from '../types';
import { DashboardCardSkeleton, Skeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { config, isLoading: loadingCfg } = useConfig();
    const { campeonatos, isLoading: loadingCam } = useCampeonatos();
    const [allReservas, setAllReservas] = React.useState<Reserva[]>([]);
    const [loadingRes, setLoadingRes] = React.useState(true);
    const [pendientePagos, setPendientePagos] = React.useState(0);

    // Inject config into window for shared components if needed - DEPRECATED
    // Now components use the useConfig hook directly for consistency

    React.useEffect(() => {
        const fetchAll = async () => {
            setLoadingRes(true);
            const { data } = await supabase.from('reservas').select('*, campeonato:campeonatos(*)');
            
            const nowStr = new Date().toISOString().split('T')[0];
            const reservations = (data || []) as (Reserva & { id: string, fecha_salida: string, estado: string })[];
            const idsToUpdate: string[] = [];

            reservations.forEach(r => {
                if (r.estado === 'activa' && r.fecha_salida < nowStr) {
                    r.estado = 'finalizada';
                    idsToUpdate.push(r.id);
                }
            });

            if (idsToUpdate.length > 0) {
                supabase.from('reservas').update({ estado: 'finalizada' }).in('id', idsToUpdate).then(({ error }) => {
                    if (error) console.error('Dashboard auto-finalize error:', error);
                });
            }

            setAllReservas(reservations);

            // Fetch pending payments only for active reservations
            const { data: pagos } = await supabase
                .from('pagos_reserva')
                .select('importe, ha_pagado, reserva:reservas!inner(estado)')
                .eq('ha_pagado', false)
                .eq('reserva.estado', 'activa');
            const total = (pagos || []).reduce((sum, p) => sum + Number(p.importe), 0);
            setPendientePagos(total);

            setLoadingRes(false);
        };
        fetchAll();
    }, []);


    const activeCampeonatos = useMemo(() => campeonatos.filter(c => c.estado === 'abierto'), [campeonatos]);

    const metrics = useMemo(() => {
        const now = new Date();
        const today = startOfDay(now);
        const nowStr = now.toISOString().split('T')[0];

        // Filter out reservations that should be 'finalizada' based on checkout date
        const realActiveReservas = allReservas.filter(r =>
            r.estado === 'activa' && r.fecha_salida >= nowStr
        );

        const activeReembolsables = realActiveReservas.filter(r => r.es_reembolsable && r.fecha_cancelacion);

        const proximasCancelaciones: ReservaConMetricas[] = activeReembolsables
            .map(r => ({
                ...r,
                daysRemaining: differenceInDays(startOfDay(parseISO(r.fecha_cancelacion!)), today)
            }))
            .filter(r => r.daysRemaining >= 0 && r.daysRemaining <= config.umbrales.proxima)
            .sort((a, b) => a.daysRemaining - b.daysRemaining);

        return {
            totalActivas: realActiveReservas.length,
            proximasCancelaciones,
            criticas: proximasCancelaciones.filter(r => r.daysRemaining <= config.umbrales.critica),
            proximasEntradas: realActiveReservas.filter(r =>
                isAfter(parseISO(r.fecha_entrada), now) &&
                isBefore(parseISO(r.fecha_entrada), addDays(now, 7))
            ).sort((a, b) => parseISO(a.fecha_entrada).getTime() - parseISO(b.fecha_entrada).getTime()),
        };
    }, [allReservas, config]);

    if (loadingCam || loadingRes || loadingCfg) {
        return (
            <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-6 w-96 rounded-lg" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <DashboardCardSkeleton />
                    <DashboardCardSkeleton />
                    <DashboardCardSkeleton />
                    <DashboardCardSkeleton />
                </div>
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-48 rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-[2rem]" />
                            <Skeleton className="h-24 w-full rounded-[2rem]" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-48 rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-[2rem]" />
                            <Skeleton className="h-24 w-full rounded-[2rem]" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                        Panel de <span className="text-primary italic">Resumen</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg lg:text-xl max-w-2xl">
                        Vista global de la logística de alojamiento para tus próximos campeonatos.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Sistema Operativo</span>
                </div>
            </div>

            {/* Hero Metrics */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Campeonatos Activos', value: activeCampeonatos.length, icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', isAmount: false },
                    { label: 'Reservas Activas', value: metrics.totalActivas, icon: Hotel, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', isAmount: false },
                    { label: 'Alertas Críticas', value: metrics.criticas.length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', isAmount: false },
                    { label: 'Pendiente de Cobro', value: pendientePagos, icon: Wallet, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', isAmount: true },
                ].map((m, i) => (
                    <div key={i} className="glass p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <m.icon className={cn("w-12 h-12 absolute -right-2 -bottom-2 opacity-5 scale-150 group-hover:scale-[2] transition-transform duration-700", m.color)} />
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", m.bg)}>
                            <m.icon className={cn("w-6 h-6", m.color)} />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
                        <p className="text-4xl font-black mt-1 tracking-tighter">
                            {m.isAmount ? `${m.value.toFixed(2)}€` : m.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Critical Alerts / Upcoming Cancellations */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <History className="w-6 h-6 text-amber-500" />
                            Límites de Cancelación
                        </h2>
                        <Badge variant="warning">{metrics.proximasCancelaciones.length} próximas</Badge>
                    </div>


                    <div className="space-y-4">
                        {metrics.proximasCancelaciones.length === 0 ? (
                            <EmptyState 
                                variant="compact"
                                icon={History} 
                                title="Sin sustos" 
                                description="No hay límites de cancelación próximos en los parámetros configurados."
                            />
                        ) : (
                            metrics.proximasCancelaciones.map(r => {
                                const daysRemaining = r.daysRemaining;
                                const isCritical = daysRemaining <= config.umbrales.critica;

                                return (
                                    <div
                                        key={r.id}
                                        className={cn(
                                            "glass p-4 sm:p-6 rounded-3xl flex items-center gap-3 sm:gap-6 border-l-4 transition-all group",
                                            isCritical
                                                ? "border-rose-500 bg-rose-50/5 hover:bg-rose-50/10"
                                                : "border-amber-400 hover:bg-amber-50/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                                            isCritical ? "bg-rose-100 dark:bg-rose-900/20" : "bg-white dark:bg-slate-800"
                                        )}>
                                            <Hotel className={cn("w-5 h-5 sm:w-6 sm:h-6", isCritical ? "text-rose-600" : "text-slate-400")} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn(
                                                "font-bold truncate transition-colors",
                                                r.estado === 'cancelada' || isCritical ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
                                            )}>
                                                {r.alojamiento_nombre}
                                            </h4>
                                            <p className="text-sm text-slate-500 truncate">{r.campeonato?.nombre}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={cn(
                                                "text-[10px] sm:text-xs font-black uppercase",
                                                isCritical ? "text-rose-600" : "text-amber-600"
                                            )}>
                                                {daysRemaining <= 0 ? "¡HOY!" : daysRemaining === 1 ? "Mañana" : <>{daysRemaining}<span className="hidden sm:inline"> días</span><span className="inline sm:hidden"> d</span></>}
                                            </p>
                                            <p className="text-sm font-bold">{format(parseISO(r.fecha_cancelacion!), "d MMM")}</p>
                                        </div>
                                        <Link
                                            to={`/campeonatos/${r.campeonato_id}?reservaId=${r.id}`}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 sm:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl shrink-0 transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-slate-400 sm:text-slate-600" />
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </section>

                {/* Upcoming Check-ins */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-emerald-500" />
                            Próximas Entradas
                        </h2>
                        <Badge variant="success">{metrics.proximasEntradas.length} previstas</Badge>
                    </div>

                    <div className="space-y-4">
                        {metrics.proximasEntradas.length === 0 ? (
                            <EmptyState 
                                variant="compact"
                                icon={Calendar} 
                                title="Sin viajes previstos" 
                                description="No hay entradas en hoteles para los próximos 7 días."
                                actionLabel="Gestionar campeonatos"
                                onAction={() => navigate('/campeonatos')}
                            />
                        ) : (
                            metrics.proximasEntradas.map(r => (
                                <div key={r.id} className="glass p-4 sm:p-6 rounded-3xl flex items-center gap-3 sm:gap-6 border-l-4 border-emerald-400 group hover:bg-emerald-50/10 transition-colors">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm shrink-0">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn(
                                            "font-bold truncate text-sm sm:text-base transition-colors",
                                            r.estado === 'cancelada' ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
                                        )}>
                                            {r.alojamiento_nombre}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-slate-500 truncate">{r.campeonato?.nombre}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase">
                                            ¡{differenceInDays(parseISO(r.fecha_entrada), new Date())}
                                            <span className="hidden sm:inline"> días</span>
                                            <span className="inline sm:hidden"> d</span>!
                                        </p>
                                        <p className="text-sm font-bold">{format(parseISO(r.fecha_entrada), "d MMM")}</p>
                                    </div>
                                    <Link
                                        to={`/campeonatos/${r.campeonato_id}`}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 sm:bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl shrink-0 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-slate-400 sm:text-slate-600" />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Quick Access Info */}
            <div className="p-8 rounded-[3rem] bg-slate-900 text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl border border-slate-800">
                <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shrink-0">
                    <Info className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold">Consejo de Gestión</h3>
                    <p className="text-slate-400 mt-1">Recuerda que si cierras un campeonato, todas sus reservas quedarán bloqueadas para evitar modificaciones accidentales tras finalizar el evento.</p>
                </div>
                <Button variant="primary" className="shadow-none border border-white/10" onClick={() => navigate('/campeonatos')}>
                    Gestionar Campeonatos
                </Button>
            </div>
        </div>
    );
};

export default Dashboard;
