
import React, { useState, useEffect } from 'react';
import { useConfig, type AppConfig } from '../hooks/useConfig';
import { Settings, User, Bell, Save, RefreshCw } from 'lucide-react';
import { Input } from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';

const SettingsView: React.FC = () => {
    const { config, updateConfig, isLoading } = useConfig();
    const [localConfig, setLocalConfig] = useState<AppConfig | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (config) {
            setLocalConfig(config);
        }
    }, [config]);

    const handleSave = async () => {
        if (!localConfig) return;
        setIsSaving(true);
        setMessage(null);
        const success = await updateConfig(localConfig);
        setIsSaving(false);
        if (success) {
            setMessage({ type: 'success', text: 'Configuración guardada correctamente. Refresca para ver los cambios.' });
            setTimeout(() => setMessage(null), 5000);
        } else {
            setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
        }
    };

    if (isLoading || !localConfig) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 glass rounded-3xl">
                <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Cargando Configuración...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <Settings className="w-10 h-10 text-primary" />
                        Configuración
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">Personaliza el comportamiento y la identidad de tu panel.</p>
                </div>
                <Button
                    leftIcon={Save}
                    onClick={handleSave}
                    isLoading={isSaving}
                >
                    Guardar Cambios
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl border ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400'
                        : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-400'
                    }`}>
                    <p className="font-bold flex items-center gap-2">
                        {message.type === 'success' ? <Save className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        {message.text}
                    </p>
                </div>
            )}

            <div className="grid gap-8 md:grid-cols-2">
                {/* Usuario Section */}
                <section className="glass p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b dark:border-slate-800">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold">Identidad</h3>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Nombre de Usuario"
                            value={localConfig.usuario.nombre}
                            onChange={(e) => setLocalConfig({
                                ...localConfig,
                                usuario: { ...localConfig.usuario, nombre: e.target.value }
                            })}
                        />
                        <Input
                            label="Rol / Cargo"
                            value={localConfig.usuario.rol}
                            onChange={(e) => setLocalConfig({
                                ...localConfig,
                                usuario: { ...localConfig.usuario, rol: e.target.value }
                            })}
                        />
                    </div>
                </section>

                {/* Umbrales Section */}
                <section className="glass p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b dark:border-slate-800">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold">Alertas de Cancelación</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold ml-1">Umbral "Próxima" (Días)</label>
                                <Badge variant="warning">{localConfig.umbrales.proxima} d</Badge>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                value={localConfig.umbrales.proxima}
                                onChange={(e) => setLocalConfig({
                                    ...localConfig,
                                    umbrales: { ...localConfig.umbrales, proxima: parseInt(e.target.value) }
                                })}
                            />
                            <p className="text-[10px] text-slate-500 mt-2 italic">Aparecerán en la lista de "Próximas Cancelaciones".</p>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold ml-1">Umbral "Crítica" (Días)</label>
                                <Badge variant="error">{localConfig.umbrales.critica} d</Badge>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                value={localConfig.umbrales.critica}
                                onChange={(e) => setLocalConfig({
                                    ...localConfig,
                                    umbrales: { ...localConfig.umbrales, critica: parseInt(e.target.value) }
                                })}
                            />
                            <p className="text-[10px] text-slate-500 mt-2 italic">Se marcarán con prioridad alta y color rojo.</p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white flex items-center gap-6 border border-slate-800">
                <div className="flex-1">
                    <h4 className="font-bold flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-primary" />
                        Persistencia en la Nube
                    </h4>
                    <p className="text-slate-400 text-sm mt-1">Estos ajustes se guardan en Supabase y son compartidos entre todos tus dispositivos.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
