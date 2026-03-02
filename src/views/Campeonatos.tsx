import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampeonatos } from '../hooks/useCampeonatos';
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
    Loader2,
    Lock,
    Unlock,
    AlertCircle,
    Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Campeonatos: React.FC = () => {
    const navigate = useNavigate();
    const { campeonatos, isLoading, error, updateCampeonatoStatus, createCampeonato, updateCampeonato } = useCampeonatos();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

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
            if (editingId) {
                await updateCampeonato(editingId, formData);
            } else {
                await createCampeonato({ ...formData, estado: 'abierto' });
            }
            handleCloseModal();
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (campeonato: any) => {
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

    if (error) {
        return (
            <div className="p-8 glass bg-rose-50/50 border-rose-200 text-rose-800 rounded-3xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                    <p className="font-bold">Error al sincronizar datos</p>
                    <p className="text-sm opacity-80">{error}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                        Reintentar
                    </Button>
                </div>
            </div>
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

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 glass rounded-3xl">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-semibold animate-pulse">Conectando con Supabase...</p>
                </div>
            ) : campeonatos.length === 0 ? (
                <div className="glass p-16 text-center rounded-[2.5rem] border-dashed border-2 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <Trophy className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold">Sin actividad todavía</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-lg leading-relaxed">
                        Es el momento de añadir tu primer campeonato para empezar a organizar las reservas de hotel.
                    </p>
                    <Button variant="outline" onClick={() => setIsModalOpen(true)} className="mt-8">
                        Crear ahora
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {campeonatos.map((c) => (
                        <div
                            key={c.id}
                            className="group glass relative overflow-hidden rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border border-transparent hover:border-primary/20 backdrop-blur-xl"
                        >
                            {/* Animated Accent */}
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-700 group-hover:scale-110" />

                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 relative z-10">
                                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-3 transition-transform duration-500">
                                    <Trophy className="w-10 h-10 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <h3 className="text-2xl font-bold tracking-tight">{c.nombre}</h3>
                                        <Badge variant={c.estado === 'abierto' ? 'success' : 'outline'} className="text-sm px-4">
                                            {c.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                                        </Badge>
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
                                        onClick={() => updateCampeonatoStatus(c.id, c.estado === 'abierto' ? 'cerrado' : 'abierto')}
                                        title={c.estado === 'abierto' ? 'Cerrar campeonato' : 'Abrir campeonato'}
                                    >
                                        {c.estado === 'abierto' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
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
                        <Button type="submit" isLoading={isCreating}>
                            Crear Campeonato
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Campeonatos;
