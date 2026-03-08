import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PagoReserva } from '../types';

export function usePagos(reservaId?: string) {
    const [pagos, setPagos] = useState<PagoReserva[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPagos = useCallback(async () => {
        if (!reservaId) { setIsLoading(false); return; }
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('pagos_reserva')
                .select('*, arquero:arqueros(*)')
                .eq('reserva_id', reservaId)
                .order('arquero(nombre)', { ascending: true });
            if (error) throw error;
            setPagos(data || []);
        } catch (err) {
            console.error(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [reservaId]);

    useEffect(() => { fetchPagos(); }, [fetchPagos]);

    // Initialize pagos for all arqueros of a reservation (upsert approach)
    const initializePagos = async (arqueroIds: string[], importePorPersona: number) => {
        if (!reservaId) return;
        const rows = arqueroIds.map(arquero_id => ({
            reserva_id: reservaId,
            arquero_id,
            importe: importePorPersona,
            ha_pagado: false,
        }));
        const { error } = await supabase
            .from('pagos_reserva')
            .upsert(rows, { onConflict: 'reserva_id,arquero_id', ignoreDuplicates: true });
        if (error) throw error;
        await fetchPagos();
    };

    const marcarPagado = async (pagoId: string, haPagado: boolean) => {
        const { error } = await supabase
            .from('pagos_reserva')
            .update({ ha_pagado: haPagado, fecha_pago: haPagado ? new Date().toISOString().slice(0, 10) : null })
            .eq('id', pagoId);
        if (error) throw error;
        setPagos(prev => prev.map(p => p.id === pagoId ? { ...p, ha_pagado: haPagado, fecha_pago: haPagado ? new Date().toISOString().slice(0, 10) : null } : p));
    };

    const updateImporte = async (pagoId: string, importe: number) => {
        const { error } = await supabase
            .from('pagos_reserva')
            .update({ importe })
            .eq('id', pagoId);
        if (error) throw error;
        setPagos(prev => prev.map(p => p.id === pagoId ? { ...p, importe } : p));
    };

    const deletePago = async (pagoId: string) => {
        const { error } = await supabase.from('pagos_reserva').delete().eq('id', pagoId);
        if (error) throw error;
        setPagos(prev => prev.filter(p => p.id !== pagoId));
    };

    const totalPendiente = pagos.filter(p => !p.ha_pagado).reduce((sum, p) => sum + Number(p.importe), 0);
    const totalCobrado = pagos.filter(p => p.ha_pagado).reduce((sum, p) => sum + Number(p.importe), 0);

    return { pagos, isLoading, initializePagos, marcarPagado, updateImporte, deletePago, totalPendiente, totalCobrado, refetch: fetchPagos };
}
