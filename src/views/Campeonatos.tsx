import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useConfig } from '../hooks/useConfig';
import { useCampeonatos } from '../hooks/useCampeonatos';
import type { Campeonato, EstadoCampeonato, Reserva } from '../types';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { Input } from '../components/Input';
import Button from '../components/Button';
import {
    Trophy,
    MapPin,
    Calendar as CalendarIcon,
    Users,
    ChevronRight,
    Plus,
    Lock,
    Unlock,
    AlertCircle,
    Trash2,
    Edit3,
    Filter,
    Search
} from 'lucide-react';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import { ChampionshipSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Campeonatos: React.FC = () => {
    const navigate = useNavigate();
    const { config, isLoading: loadingCfg } = useConfig();
    const { campeonatos, isLoading, error, updateCampeonatoStatus, createCampeonato, updateCampeonato, deleteCampeonato } = useCampeonatos();
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loadingRes, setLoadingRes] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSavingSuccess, setIsSavingSuccess] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'todos' | 'abierto' | 'cerrado'>('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, nombre: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                setLoadingRes(true);
                const { data } = await supabase
                    .from('reservas')
                    .select('id, campeonato_id, fecha_cancelacion, es_reembolsable, estado')
                    .eq('estado', 'activa');
                setReservas((data || []) as Reserva[]);
            } catch (err) {
                console.error('Error fetching reservations:', err);
            } finally {
                setLoadingRes(false);
            }
        };
        fetchReservas();
    }, []);

    const filteredCampeonatos = useMemo(() => {
        let filtered = campeonatos;
        
        if (statusFilter !== 'todos') {
            filtered = filtered.filter(c => c.estado === statusFilter);
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(c => 
                c.nombre.toLowerCase().includes(lowerSearch) || 
                c.localidad.toLowerCase().includes(lowerSearch)
            );
        }

        return filtered;
    }, [campeonatos, statusFilter, searchTerm]);

    const campeonatosConAlertas = useMemo(() => {
        const now = new Date();
        const nextCritico = addDays(now, config.umbrales.critica);

        const alertasMap: Record<string, boolean> = {};

        reservas.forEach(r => {
            if (
                r.es_reembolsable &&
                r.fecha_cancelacion &&
                isAfter(parseISO(r.fecha_cancelacion), now) &&
                isBefore(parseISO(r.fecha_cancelacion), nextCritico)
            ) {
                alertasMap[r.campeonato_id] = true;
            }
        });

        return alertasMap;
    }, [reservas, config]);

    // Form State
    const [formData, setFormData] = useState({
        nombre: '',
        fecha: '',
        fecha_fin: '', // Nuevo campo
        localidad: '',
        numero_personas: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsCreating(true);

            // Clean data: replace empty strings with null for the database
            const dataToSave = {
                ...formData,
                fecha_fin: formData.fecha_fin || null
            };

            if (editingId) {
                await updateCampeonato(editingId, dataToSave);
            } else {
                await createCampeonato({ ...dataToSave, estado: 'abierto' as EstadoCampeonato });
            }
            setIsSavingSuccess(true);
            setTimeout(() => {
                setIsSavingSuccess(false);
                handleCloseModal();
            }, 1200);
            
            toast.success(editingId ? 'Campeonato actualizado' : 'Campeonato creado con éxito');
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar el campeonato');
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (campeonato: Campeonato) => {
        setEditingId(campeonato.id);
        setFormData({
            nombre: campeonato.nombre,
            fecha: campeonato.fecha,
            fecha_fin: campeonato.fecha_fin || '',
            localidad: campeonato.localidad,
            numero_personas: campeonato.numero_personas
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ nombre: '', fecha: '', fecha_fin: '', localidad: '', numero_personas: 1 });
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;

        try {
            setIsDeleting(true);
            await deleteCampeonato(confirmDelete.id);
            toast.success('Campeonato eliminado correctamente');
            setConfirmDelete(null);
        } catch (err) {
            toast.error((err as Error).message || 'Error al tratar de eliminar el campeonato');
        } finally {
            setIsDeleting(false);
        }
    };

    if (error) {
        return (
            <ErrorState 
                title="Error al sincronizar datos"
                message={error}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Campeonatos
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Sigue y gestiona la logística de tus torneos de tiro con arco.
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    leftIcon={Plus}
                    className="w-full sm:w-auto"
                >
                    Nuevo Campeonato
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 glass p-4 rounded-[1.5rem] border dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre o localidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 mb-0"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="w-full md:w-48 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium outline-none transition-all focus:ring-2 focus:ring-primary/20"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'abierto' | 'cerrado')}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="abierto">Abiertos</option>
                        <option value="cerrado">Cerrados</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {(isLoading || loadingRes || loadingCfg) ? (
                <div className="grid gap-6">
                    <ChampionshipSkeleton />
                    <ChampionshipSkeleton />
                    <ChampionshipSkeleton />
                </div>
            ) : filteredCampeonatos.length === 0 ? (
                <EmptyState
                    icon={Trophy}
                    title={statusFilter === 'todos' && !searchTerm ? "Sin campeonatos" : "Sin resultados"}
                    description={statusFilter === 'todos' && !searchTerm
                        ? "Es el momento de añadir tu primer campeonato para empezar a organizar las reservas de hotel."
                        : "No hay campeonatos que coincidan con los criterios de búsqueda o filtrado."}
                    actionLabel={statusFilter === 'todos' && !searchTerm ? "Crear primer campeonato" : "Limpiar filtros"}
                    onAction={() => {
                        if (statusFilter === 'todos' && !searchTerm) {
                            setIsModalOpen(true);
                        } else {
                            setStatusFilter('todos');
                            setSearchTerm('');
                        }
                    }}
                />
            ) : (
                <div className="grid gap-6">
                    {filteredCampeonatos.map((c) => (
                        <div
                            key={c.id}
                            className={cn(
                                "group glass relative overflow-hidden rounded-[2rem] p-8 hover:shadow-2xl transition-all duration-300 border border-transparent backdrop-blur-xl",
                                c.estado === 'cerrado' 
                                    ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-700" 
                                    : "hover:shadow-primary/5 hover:border-primary/20"
                            )}
                        >
                            {/* Animated Accent */}
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-700 group-hover:scale-110" />

                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 relative z-10">
                                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-3 transition-transform duration-500">
                                    <Trophy className="w-10 h-10 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <h3 className={cn(
                                            "text-2xl font-bold tracking-tight",
                                            c.estado === 'cerrado' && "text-rose-600 dark:text-rose-400"
                                        )}>
                                            {c.nombre}
                                        </h3>
                                        <div className="flex gap-2">
                                            <Badge variant={c.estado === 'abierto' ? 'success' : 'error'} className="text-sm px-4">
                                                {c.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                                            </Badge>
                                            {campeonatosConAlertas[c.id] && (
                                                <Badge variant="error" className="text-sm px-4 animate-pulse flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
                                                    <AlertCircle className="w-4 h-4" />
                                                    ¡Cancelación Crítica!
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-base text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-2 group/icon">
                                            <MapPin className="w-5 h-5 text-primary/60 group-hover/icon:text-primary transition-colors" />
                                            {c.localidad}
                                        </div>
                                        <div className="flex items-center gap-2 group/icon">
                                            <CalendarIcon className="w-5 h-5 text-primary/60 group-hover/icon:text-primary transition-colors" />
                                            {format(new Date(c.fecha), "d MMM", { locale: es })}
                                            {c.fecha_fin && c.fecha_fin !== c.fecha && (
                                                <> - {format(new Date(c.fecha_fin), "d MMM yyyy", { locale: es })}</>
                                            )}
                                            {!c.fecha_fin && format(new Date(c.fecha), " yyyy", { locale: es })}
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                            <Users className="w-5 h-5 text-blue-500" />
                                            {c.numero_personas} <span className="font-medium text-slate-500 ml-1">arqueros</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 dark:border-slate-800">
                                    {c.estado === 'abierto' && (
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => handleEdit(c)}
                                            title="Editar información"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={async () => { try { await updateCampeonatoStatus(c.id, c.estado === 'abierto' ? 'cerrado' : 'abierto'); toast.success(`Estado cambiado a ${c.estado === 'abierto' ? 'Cerrado' : 'Abierto'}`); } catch (err) { toast.error((err as Error).message); } }}
                                        title={c.estado === 'abierto' ? 'Cerrar campeonato' : 'Abrir campeonato'}
                                    >
                                        {c.estado === 'abierto' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => setConfirmDelete({ id: c.id, nombre: c.nombre })}
                                        title="Eliminar campeonato"
                                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="primary"
                                        rightIcon={ChevronRight}
                                        className="flex-1 lg:flex-none"
                                        onClick={() => navigate(`/campeonatos/${c.id}`)}
                                    >
                                        Ver Reservas
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Editar Campeonato" : "Nuevo Campeonato"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Nombre del Campeonato"
                        placeholder="Ej: Campeonato de España 2026"
                        required
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Localidad"
                            placeholder="Ej: Madrid"
                            required
                            value={formData.localidad}
                            onChange={e => setFormData({ ...formData, localidad: e.target.value })}
                        />
                        <Input
                            label="Arqueros"
                            type="number"
                            min="1"
                            required
                            value={formData.numero_personas}
                            onChange={e => setFormData({ ...formData, numero_personas: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Fecha Inicio"
                            type="date"
                            required
                            value={formData.fecha}
                            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                        />
                        <Input
                            label="Fecha Fin (Opcional)"
                            type="date"
                            value={formData.fecha_fin}
                            onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            isLoading={isCreating} 
                            isSuccess={isSavingSuccess}
                        >
                            {editingId ? 'Actualizar' : 'Lanzar'} Campeonato
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Eliminar Campeonato"
                description={`¿Estás seguro de que deseas eliminar el campeonato "${confirmDelete?.nombre}" y TODAS sus reservas asociadas? Esta acción es irreversible.`}
                confirmText="Eliminar permanentemente"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Campeonatos;
