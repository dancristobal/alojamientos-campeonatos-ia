import React, { useState, useMemo } from 'react';
import { useReservas } from '../hooks/useReservas';
import { useConfig } from '../hooks/useConfig';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import Badge from '../components/Badge';
import { Input } from '../components/Input';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Search,
    Filter,
    ArrowRight,
    MapPin,
    AlertCircle,
    Loader2,
    Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EstadoReserva, Reserva } from '../types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const STATUS_COLORS: Record<EstadoReserva, { badge: 'success' | 'warning' | 'error' | 'default', label: string }> = {
    activa: { badge: 'success', label: 'Activa' },
    cancelada: { badge: 'error', label: 'Cancelada' },
    vencida: { badge: 'warning', label: 'Vencida' },
    finalizada: { badge: 'default', label: 'Finalizada' }
};

const Reservas: React.FC = () => {
    const { config } = useConfig();
    const { reservas, isLoading, error } = useReservas('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EstadoReserva | 'todas'>('todas');

    const filteredReservas = useMemo(() => {
        let filtered = reservas as (Reserva & { campeonatos: { nombre: string, estado: string } })[];

        if (statusFilter !== 'todas') {
            filtered = filtered.filter(r => r.estado === statusFilter);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(
                r => r.alojamiento_nombre?.toLowerCase().includes(lowerSearch) ||
                    r.campeonatos?.nombre?.toLowerCase().includes(lowerSearch)
            );
        }

        return filtered;
    }, [reservas, searchTerm, statusFilter]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 glass bg-rose-50/50 border-rose-200 text-rose-800 rounded-3xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                    <p className="font-bold">Error al cargar las reservas</p>
                    <p className="text-sm opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        Todas las Reservas
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gestiona el histórico completo de alojamientos
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por alojamiento o campeonato..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 mb-0"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="w-full md:w-48 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium outline-none focus:ring-2 focus:ring-primary/50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as EstadoReserva | 'todas')}
                    >
                        <option value="todas">Todos los estados</option>
                        <option value="activa">Activas</option>
                        <option value="cancelada">Canceladas</option>
                        <option value="vencida">Vencidas</option>
                        <option value="finalizada">Finalizadas</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {filteredReservas.length === 0 ? (
                <div className="text-center p-12 glass rounded-3xl">
                    <p className="text-slate-500">No se han encontrado reservas con estos filtros.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReservas.map(r => (
                        <div key={r.id} className="glass p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className={cn(
                                        "font-bold text-lg transition-colors",
                                        r.estado === 'cancelada' ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
                                    )}>
                                        {r.alojamiento_nombre || 'Sin alojamiento asignado'}
                                    </h3>
                                    <Badge variant={STATUS_COLORS[r.estado]?.badge || 'default'}>
                                        {STATUS_COLORS[r.estado]?.label || r.estado}
                                    </Badge>
                                    {(() => {
                                        if (!r.fecha_cancelacion || r.estado !== 'activa' || !r.es_reembolsable) return null;
                                        const daysRemaining = differenceInDays(parseISO(r.fecha_cancelacion), new Date());

                                        // Ignore if cancellation date has already passed
                                        if (daysRemaining < 0) return null;

                                        if (daysRemaining <= config.umbrales.critica) {
                                            return (
                                                <Badge variant="error" className="animate-pulse shadow-rose-500/20 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Límite Crítico
                                                </Badge>
                                            );
                                        }
                                        if (daysRemaining <= config.umbrales.proxima) {
                                            return (
                                                <Badge variant="warning" className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Cancelación Próxima
                                                </Badge>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                                    <div className={cn(
                                        "flex items-center gap-1.5 font-medium",
                                        r.campeonatos?.estado === 'cerrado' ? "text-rose-600 dark:text-rose-400" : "text-primary"
                                    )}>
                                        <MapPin className="w-4 h-4" />
                                        {r.campeonatos?.nombre}
                                        {r.campeonatos?.estado === 'cerrado' && (
                                            <Badge variant="error" className="text-[10px] py-0 px-1.5 ml-1">Cerrado</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {format(parseISO(r.fecha_entrada), "d MMM yyyy", { locale: es })}
                                        <ArrowRight className="w-3 h-3 mx-1" />
                                        {format(parseISO(r.fecha_salida), "d MMM yyyy", { locale: es })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 md:border-l dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                        {Number(r.precio_total_final).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                </div>

                                <Link
                                    to={`/campeonatos/${r.campeonato_id}`}
                                    className="p-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-colors"
                                    title="Ir al campeonato"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reservas;
