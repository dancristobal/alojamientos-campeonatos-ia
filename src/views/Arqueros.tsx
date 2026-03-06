import React, { useState } from 'react';
import { useArqueros } from '../hooks/useArqueros';
import { Input } from '../components/Input';
import Button from '../components/Button';
import {
    Users,
    Plus,
    Trash2,
    Edit3,
    Mail,
    Loader2,
    AlertCircle
} from 'lucide-react';

const Arqueros: React.FC = () => {
    const { arqueros, isLoading, error, createArquero, updateArquero, deleteArquero } = useArqueros();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ nombre: '', email: '', numero_licencia: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ nombre: '', email: '', numero_licencia: '' });
        setFormError(null);
        setShowForm(true);
    };

    const handleOpenEdit = (arquero: { id: string; nombre: string; email?: string; numero_licencia?: string }) => {
        setEditingId(arquero.id);
        setFormData({ nombre: arquero.nombre, email: arquero.email || '', numero_licencia: arquero.numero_licencia || '' });
        setFormError(null);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre.trim()) { setFormError('El nombre es obligatorio.'); return; }
        try {
            setIsSaving(true);
            setFormError(null);
            if (editingId) {
                await updateArquero(editingId, { nombre: formData.nombre, email: formData.email || undefined, numero_licencia: formData.numero_licencia || undefined });
            } else {
                await createArquero({ nombre: formData.nombre, email: formData.email || undefined, numero_licencia: formData.numero_licencia || undefined });
            }
            setShowForm(false);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Eliminar a ${nombre}? Se eliminarán también sus registros de pago asociados.`)) return;
        await deleteArquero(id);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="p-8 glass bg-rose-50/50 border-rose-200 text-rose-800 rounded-3xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
            <div><p className="font-bold">Error al cargar los arqueros</p><p className="text-sm opacity-80">{error}</p></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        Grupo de Arqueros
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gestiona los miembros del equipo — {arqueros.length} {arqueros.length === 1 ? 'arquero' : 'arqueros'}
                    </p>
                </div>
                <Button onClick={handleOpenCreate} leftIcon={Plus}>
                    Añadir Arquero
                </Button>
            </header>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass p-6 rounded-3xl space-y-4 border border-primary/20">
                    <h3 className="font-bold text-primary">{editingId ? 'Editar Arquero' : 'Nuevo Arquero'}</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <Input
                            label="Nombre *"
                            placeholder="Ana García"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            error={formError || undefined}
                            autoFocus
                        />
                        <Input
                            label="Email (Opcional)"
                            type="email"
                            placeholder="ana@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Nº Licencia Federativa (Opcional)"
                            placeholder="12345-A"
                            value={formData.numero_licencia}
                            onChange={e => setFormData({ ...formData, numero_licencia: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        <Button type="submit" isLoading={isSaving}>{editingId ? 'Guardar cambios' : 'Añadir'}</Button>
                    </div>
                </form>
            )}

            {/* List */}
            {arqueros.length === 0 ? (
                <div className="text-center p-16 glass rounded-3xl space-y-4">
                    <Users className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-slate-500 font-medium">No hay arqueros en el grupo todavía.</p>
                    <Button onClick={handleOpenCreate} leftIcon={Plus} variant="outline">Añadir el primero</Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {arqueros.map(a => (
                        <div key={a.id} className="glass p-5 rounded-2xl flex items-center justify-between gap-4 hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary shrink-0">
                                    {a.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold truncate">{a.nombre}</p>
                                    {a.numero_licencia && (
                                        <p className="text-xs text-slate-400 font-mono truncate"># {a.numero_licencia}</p>
                                    )}
                                    {a.email && (
                                        <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                                            <Mail className="w-3 h-3 shrink-0" />
                                            {a.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button
                                    onClick={() => handleOpenEdit(a)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-primary transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(a.id, a.nombre)}
                                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Arqueros;
