import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampeonatos } from '../hooks/useCampeonatos';
import { useReservas } from '../hooks/useReservas';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Input } from '../components/Input';
import {
    ArrowLeft,
    Plus,
    Hotel,
    Calendar,
    ExternalLink,
    Trash2,
    Edit3,
    Users,
    AlertTriangle,
    Info,
    MapPin
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TipoHabitacion, HabitacionReserva } from '../types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CampeonatoDetalle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { campeonatos, isLoading: loadingCam } = useCampeonatos();
    const { reservas, isLoading: loadingRes, saveReserva, calculatePrice } = useReservas(id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const campeonato = campeonatos.find(c => c.id === id);

    // Form State for Reserva
    const [formData, setFormData] = useState({
        alojamiento_nombre: '',
        fecha_entrada: '',
        fecha_salida: '',
        fecha_cancelacion: '',
        es_reembolsable: true,
        enlace_web: '',
    });

    const [habitaciones, setHabitaciones] = useState<Omit<HabitacionReserva, 'id' | 'reserva_id'>[]>([
        { tipo: 'doble', numero_habitaciones: 1, precio_por_habitacion: 0 }
    ]);

    const totalPlazas = reservas.reduce((acc, r) => {
        const plazasReserva = r.habitaciones?.reduce((sum, h) => {
            return sum + (h.numero_habitaciones * (h.tipo === 'doble' ? 2 : 1));
        }, 0) || 0;
        return acc + (r.estado === 'activa' ? plazasReserva : 0);
    }, 0);

    const handleAddRoom = () => {
        setHabitaciones([...habitaciones, { tipo: 'doble', numero_habitaciones: 1, precio_por_habitacion: 0 }]);
    };

    const handleRemoveRoom = (index: number) => {
        setHabitaciones(habitaciones.filter((_, i) => i !== index));
    };

    const handleUpdateRoom = (index: number, field: keyof HabitacionReserva, value: any) => {
        const next = [...habitaciones];
        (next[index] as any)[field] = value;
        setHabitaciones(next);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            setIsSaving(true);
            const precioCalculado = calculatePrice(formData as any, habitaciones);
            await saveReserva({
                ...formData,
                campeonato_id: id,
                estado: 'activa',
                precio_total_calculado: precioCalculado,
                precio_total_final: formData.es_reembolsable ? precioCalculado : precioCalculado // Logic placeholder
            }, habitaciones);
            setIsModalOpen(false);
            // Reset
            setFormData({ alojamiento_nombre: '', fecha_entrada: '', fecha_salida: '', fecha_cancelacion: '', es_reembolsable: true, enlace_web: '' });
            setHabitaciones([{ tipo: 'doble', numero_habitaciones: 1, precio_por_habitacion: 0 }]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingCam || !campeonato) {
        return (loadingCam ? <div className="p-20 text-center">Cargando detalles...</div> : <div>Cargando...</div>);
    }

    const isPeopleWarning = totalPlazas < campeonato.numero_personas;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Top Navigation */}
            <div className="flex items-center gap-4">
                <Link
                    to="/campeonatos"
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all border dark:border-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{campeonato.nombre}</h1>
                        <Badge variant={campeonato.estado === 'abierto' ? 'success' : 'outline'}>
                            {campeonato.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4" /> {campeonato.localidad} • {format(new Date(campeonato.fecha), "PPP", { locale: es })}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="glass p-6 rounded-[2rem] flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Personas</p>
                        <p className="text-2xl font-black">{campeonato.numero_personas}</p>
                    </div>
                </div>

                <div className={cn(
                    "glass p-6 rounded-[2rem] flex items-center gap-5 border-2 transition-colors",
                    isPeopleWarning ? "border-amber-400/50 bg-amber-50/10" : "border-emerald-400/50 bg-emerald-50/10"
                )}>
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center",
                        isPeopleWarning ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                        {isPeopleWarning ? <AlertTriangle className="w-7 h-7" /> : <Users className="w-7 h-7" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Plazas Reservadas</p>
                        <p className="text-2xl font-black">{totalPlazas}</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-[2rem] flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <Hotel className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Presupuesto Estimado</p>
                        <p className="text-2xl font-black">
                            {reservas.reduce((acc, r) => acc + (r.estado === 'activa' ? Number(r.precio_total_final) : 0), 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reservations List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Hotel className="w-6 h-6 text-primary" />
                        Alojamientos
                    </h2>
                    <Button
                        disabled={campeonato.estado === 'cerrado'}
                        leftIcon={Plus}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Añadir Reserva
                    </Button>
                </div>

                {loadingRes ? (
                    <div className="p-10 text-center">Cargando reservas...</div>
                ) : reservas.length === 0 ? (
                    <div className="glass p-12 text-center rounded-[2.5rem]">
                        <p className="text-muted-foreground text-lg italic">Todavía no has registrado ningún hotel para este campeonato.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reservas.map(r => (
                            <div key={r.id} className="glass rounded-[2rem] p-8 hover:shadow-xl transition-all border-l-4 border-l-primary group">
                                <div className="flex flex-col xl:flex-row gap-8">
                                    {/* Hotel Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-xl font-bold">{r.alojamiento_nombre || "Hotel sin nombre"}</h4>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                                                        {r.estado.toUpperCase()}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(r.fecha_entrada), "d MMM")} - {format(new Date(r.fecha_salida), "d MMM yyyy", { locale: es })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-primary">
                                                    {Number(r.precio_total_final).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {differenceInDays(parseISO(r.fecha_salida), parseISO(r.fecha_entrada))} noches
                                                </p>
                                            </div>
                                        </div>

                                        {/* Room details */}
                                        <div className="flex flex-wrap gap-4">
                                            {r.habitaciones?.map((h, i) => (
                                                <div key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium flex items-center gap-2">
                                                    <span className="text-primary font-bold">{h.numero_habitaciones}x</span>
                                                    {h.tipo === 'doble' ? 'Doble' : 'Individual'}
                                                    <span className="text-slate-400">({h.precio_por_habitacion}€/n)</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Meta info */}
                                        <div className="flex items-center gap-6 pt-4 border-t dark:border-slate-800">
                                            {r.es_reembolsable && r.fecha_cancelacion && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Info className="w-4 h-4 text-amber-500" />
                                                    <span className="font-medium">Cancelación:</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-lg",
                                                        differenceInDays(parseISO(r.fecha_cancelacion), new Date()) <= 3 ? "bg-rose-100 text-rose-700" : "bg-slate-100 dark:bg-slate-800"
                                                    )}>
                                                        {format(new Date(r.fecha_cancelacion), "PPP", { locale: es })}
                                                    </span>
                                                </div>
                                            )}
                                            {r.enlace_web && (
                                                <a
                                                    href={r.enlace_web}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary text-sm font-bold flex items-center gap-1.5 hover:underline"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Web Reserva
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex xl:flex-col justify-end gap-3 border-t xl:border-t-0 xl:border-l dark:border-slate-800 pt-6 xl:pt-0 xl:pl-8">
                                        <Button variant="ghost" size="icon" disabled={campeonato.estado === 'cerrado'}>
                                            <Edit3 className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:bg-rose-50 dark:hover:bg-rose-950/30" disabled={campeonato.estado === 'cerrado'}>
                                            <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Detalles del Alojamiento"
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Información General</h4>
                        <Input
                            label="Nombre del Hotel / Apartamento"
                            placeholder="Ej: Hotel Hilton"
                            required
                            value={formData.alojamiento_nombre}
                            onChange={e => setFormData({ ...formData, alojamiento_nombre: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Fecha Entrada"
                                type="date"
                                required
                                value={formData.fecha_entrada}
                                onChange={e => setFormData({ ...formData, fecha_entrada: e.target.value })}
                            />
                            <Input
                                label="Fecha Salida"
                                type="date"
                                required
                                value={formData.fecha_salida}
                                onChange={e => setFormData({ ...formData, fecha_salida: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 pt-8 px-2">
                                <input
                                    type="checkbox"
                                    id="reembolsable"
                                    className="w-5 h-5 rounded-lg text-primary focus:ring-primary"
                                    checked={formData.es_reembolsable}
                                    onChange={e => setFormData({ ...formData, es_reembolsable: e.target.checked })}
                                />
                                <label htmlFor="reembolsable" className="text-sm font-semibold select-none">¿Es Reembolsable?</label>
                            </div>
                            {formData.es_reembolsable && (
                                <Input
                                    label="Límite Cancelación (Opcional)"
                                    type="date"
                                    value={formData.fecha_cancelacion}
                                    onChange={e => setFormData({ ...formData, fecha_cancelacion: e.target.value })}
                                />
                            )}
                        </div>
                        <Input
                            label="Enlace a la Reserva"
                            placeholder="https://booking.com/..."
                            value={formData.enlace_web}
                            onChange={e => setFormData({ ...formData, enlace_web: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Habitaciones</h4>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddRoom} leftIcon={Plus}>
                                Añadir Tipo
                            </Button>
                        </div>

                        {habitaciones.map((room, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black uppercase text-slate-400">Tipo #{idx + 1}</span>
                                    {habitaciones.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveRoom(idx)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold ml-1">Tipo</label>
                                        <select
                                            className="w-full h-12 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                            value={room.tipo}
                                            onChange={e => handleUpdateRoom(idx, 'tipo', e.target.value as TipoHabitacion)}
                                        >
                                            <option value="doble">Doble</option>
                                            <option value="individual">Individual</option>
                                        </select>
                                    </div>
                                    <Input
                                        label="Cant."
                                        type="number"
                                        min="1"
                                        className="h-12"
                                        value={room.numero_habitaciones}
                                        onChange={e => handleUpdateRoom(idx, 'numero_habitaciones', parseInt(e.target.value) || 0)}
                                    />
                                    <Input
                                        label="Precio/N"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="h-12"
                                        value={room.precio_por_habitacion}
                                        onChange={e => handleUpdateRoom(idx, 'precio_por_habitacion', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-600 dark:text-slate-400">Total Noches:</span>
                            <span className="font-black text-xl">
                                {formData.fecha_entrada && formData.fecha_salida
                                    ? Math.max(0, differenceInDays(parseISO(formData.fecha_salida), parseISO(formData.fecha_entrada)))
                                    : 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-600 dark:text-slate-400">Precio Estimado:</span>
                            <span className="font-black text-2xl text-primary">
                                {calculatePrice(formData as any, habitaciones).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                            Descartar
                        </Button>
                        <Button type="submit" isLoading={isSaving} leftIcon={Hotel}>
                            Guardar Reserva
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};



export default CampeonatoDetalle;
