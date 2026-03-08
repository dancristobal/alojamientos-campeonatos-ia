import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Campeonato, EstadoCampeonato } from '../types';

export function useCampeonatos() {
    const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCampeonatos = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('campeonatos')
                .select('*')
                .order('fecha', { ascending: true });

            if (error) throw error;
            setCampeonatos(data || []);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createCampeonato = async (nuevo: Omit<Campeonato, 'id' | 'created_at'>) => {
        try {
            const { data, error } = await supabase
                .from('campeonatos')
                .insert([nuevo])
                .select()
                .single();

            if (error) throw error;
            setCampeonatos(prev => [data, ...prev]);
            return data;
        } catch (err) {
            setError((err as Error).message);
            throw err;
        }
    };

    const updateCampeonato = async (id: string, updates: Partial<Omit<Campeonato, 'id' | 'created_at'>>) => {
        try {
            const { error } = await supabase
                .from('campeonatos')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            setCampeonatos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } catch (err) {
            setError((err as Error).message);
            throw err;
        }
    };

    const checkPagosPendientes = async (campeonatoId: string) => {
        const { data: resData } = await supabase.from('reservas').select('id').eq('campeonato_id', campeonatoId);
        if (resData && resData.length > 0) {
            const resIds = resData.map(r => r.id);
            const { data: pagos } = await supabase
                .from('pagos_reserva')
                .select('id')
                .in('reserva_id', resIds)
                .eq('ha_pagado', false);
            if (pagos && pagos.length > 0) {
                throw new Error('Hay arqueros pendientes de pago en las reservas de este campeonato.');
            }
        }
    };

    const updateCampeonatoStatus = async (id: string, estado: EstadoCampeonato) => {
        try {
            if (estado === 'cerrado') {
                await checkPagosPendientes(id);
            }
            const { error } = await supabase
                .from('campeonatos')
                .update({ estado })
                .eq('id', id);

            if (error) throw error;
            setCampeonatos(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
        } catch (err) {
            setError((err as Error).message);
            throw err;
        }
    };

    const deleteCampeonato = async (id: string) => {
        try {
            await checkPagosPendientes(id);
            // 1. Get all reservations to delete their rooms
            const { data: resData } = await supabase
                .from('reservas')
                .select('id')
                .eq('campeonato_id', id);

            if (resData && resData.length > 0) {
                const resIds = resData.map(r => r.id);
                // 2. Delete rooms for those reservations
                await supabase
                    .from('habitaciones_reserva')
                    .delete()
                    .in('reserva_id', resIds);

                // 3. Delete reservations
                await supabase
                    .from('reservas')
                    .delete()
                    .eq('campeonato_id', id);
            }

            // 4. Delete the championship
            const { error } = await supabase
                .from('campeonatos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCampeonatos(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            setError((err as Error).message);
            throw err;
        }
    };

    useEffect(() => {
        fetchCampeonatos();
    }, [fetchCampeonatos]);

    return {
        campeonatos,
        isLoading,
        error,
        refresh: fetchCampeonatos,
        createCampeonato,
        updateCampeonato,
        updateCampeonatoStatus,
        deleteCampeonato
    };
}
