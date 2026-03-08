import React, { useState } from 'react';
import { usePagos } from '../hooks/usePagos';
import { useArqueros } from '../hooks/useArqueros';
import { CheckCircle, XCircle, Users, Euro, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { Skeleton } from './Skeleton';
import EmptyState from './EmptyState';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface RepartoGastosProps {
    reservaId: string;
    precioTotal: number;
    isReadOnly?: boolean;
}

const RepartoGastos: React.FC<RepartoGastosProps> = ({ reservaId, precioTotal, isReadOnly }) => {
    const { arqueros } = useArqueros();
    const { pagos, isLoading, initializePagos, marcarPagado, updateImporte, totalPendiente, totalCobrado } = usePagos(reservaId);

    const [isExpanded, setIsExpanded] = useState(false);

    const handleInit = async () => {
        if (arqueros.length === 0) { toast.warning('Primero añade arqueros en la sección Arqueros.'); return; }
        try {
            const importePorPersona = arqueros.length > 0 ? precioTotal / arqueros.length : 0;
            await initializePagos(arqueros.map(a => a.id), parseFloat(importePorPersona.toFixed(2)));
            toast.success('Reparto de gastos inicializado con éxito');
        } catch (err) {
            toast.error('Error al inicializar el reparto');
            console.error(err);
        }
    };

    const hasPagos = pagos.length > 0;
    const totalPagos = pagos.reduce((s, p) => s + Number(p.importe), 0);

    return (
        <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 dark:bg-primary/5 overflow-hidden">
            {/* Header / toggle */}
            <button
                onClick={() => setIsExpanded(v => !v)}
                className="w-full flex items-center justify-between p-4 hover:bg-primary/10 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-bold text-primary text-sm">Reparto de Gastos</span>
                    {hasPagos && (
                        <span className={cn(
                            "text-xs font-black px-2 py-0.5 rounded-full",
                            totalPendiente > 0 ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        )}>
                            {totalPendiente > 0 ? `${totalPendiente.toFixed(2)}€ pendiente` : '✓ Todo cobrado'}
                        </span>
                    )}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />}
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    {isLoading ? (
                        <div className="py-4 space-y-3">
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    ) : !hasPagos ? (
                        <div className="py-2">
                            <EmptyState 
                                variant="compact"
                                icon={Euro}
                                title="Sin reparto"
                                description="Aún no has distribuido el coste entre los arqueros."
                                actionLabel={!isReadOnly ? `Crear reparto para ${arqueros.length} arqueros` : undefined}
                                onAction={!isReadOnly ? handleInit : undefined}
                            />
                        </div>
                    ) : (
                        <>
                            {/* Summary row */}
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest border-b dark:border-slate-700 pb-2 mb-1">
                                <span>Arquero</span>
                                <div className="flex gap-6">
                                    <span>Importe</span>
                                    <span>Estado</span>
                                </div>
                            </div>

                            {pagos.map(pago => (
                                <div key={pago.id} className={cn(
                                    "flex items-center justify-between gap-3 p-2.5 rounded-xl transition-colors",
                                    pago.ha_pagado ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-white dark:bg-slate-900/50"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
                                            {pago.arquero?.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold">{pago.arquero?.nombre}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={pago.importe}
                                                disabled={isReadOnly}
                                                onChange={e => updateImporte(pago.id, parseFloat(e.target.value) || 0)}
                                                className={cn(
                                                    "w-20 text-right p-1 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-1 focus:ring-primary outline-none",
                                                    isReadOnly && "opacity-60 cursor-not-allowed"
                                                )}
                                            />
                                            <Euro className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <button
                                            onClick={() => marcarPagado(pago.id, !pago.ha_pagado)}
                                            disabled={isReadOnly}
                                            className={cn(
                                                "p-1.5 rounded-xl transition-all",
                                                pago.ha_pagado
                                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                                    : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-500",
                                                isReadOnly && "opacity-50 cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-500"
                                            )}
                                            title={isReadOnly ? "No editable" : (pago.ha_pagado ? "Marcar como pendiente" : "Marcar como pagado")}
                                        >
                                            {pago.ha_pagado ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Totals footer */}
                            <div className="flex justify-between text-xs pt-2 border-t dark:border-slate-700 font-bold">
                                <span className="text-slate-500">Total reparto: {totalPagos.toFixed(2)}€</span>
                                <div className="flex gap-4">
                                    <span className="text-emerald-600">✓ {totalCobrado.toFixed(2)}€</span>
                                    {totalPendiente > 0 && <span className="text-rose-500">⏳ {totalPendiente.toFixed(2)}€</span>}
                                </div>
                            </div>

                            {!isReadOnly && (
                                <div className="flex justify-end">
                                    <button onClick={handleInit} className="text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" /> Reiniciar reparto
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default RepartoGastos;
