import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Reserva, HabitacionReserva, EstadoReserva } from '../types';
import { differenceInDays, parseISO } from 'date-fns';

export function useReservas(campeonatoId?: string) {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservas = useCallback(async () => {
        if (!campeonatoId) return;
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('reservas')
                .select(`
          *,
          habitaciones:habitaciones_reserva(*)
        `)
                .eq('campeonato_id', campeonatoId)
                .order('fecha_entrada', { ascending: true });

            if (error) throw error;
            setReservas(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [campeonatoId]);

    const calculatePrice = (reserva: Partial<Reserva>, habitaciones: Partial<HabitacionReserva>[]) => {
        if (!reserva.fecha_entrada || !reserva.fecha_salida) return 0;

        const nights = Math.max(0, differenceInDays(parseISO(reserva.fecha_salida), parseISO(reserva.fecha_entrada)));
        const calculated = habitaciones.reduce((acc, h) => {
            return acc + ((h.precio_por_habitacion || 0) * (h.numero_habitaciones || 0) * nights);
        }, 0);

        return calculated;
    };

    const saveReserva = async (
        reservaData: Omit<Reserva, 'id' | 'created_at' | 'updated_at' | 'habitaciones'>,
        habitaciones: Omit<HabitacionReserva, 'id' | 'reserva_id'>[]
    ) => {
        try {
            const precioCalculado = calculatePrice(reservaData, habitaciones);
            const precioFinal = reservaData.precio_total_manual !== undefined && reservaData.precio_total_manual !== null
                ? reservaData.precio_total_manual
                : precioCalculado;

            // 1. Insert/Update Reserva
            const { data: resData, error: resError } = await supabase
                .from('reservas')
                .upsert([{
                    ...reservaData,
                    precio_total_calculado: precioCalculado,
                    precio_total_final: precioFinal,
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (resError) throw resError;

            // 2. Clear old habitaciones if updating (simplified for MVP: delete all and re-insert)
            const { error: delError } = await supabase
                .from('habitaciones_reserva')
                .delete()
                .eq('reserva_id', resData.id);

            if (delError) throw delError;

            // 3. Insert new habitaciones
            const roomsToInsert = habitaciones.map(h => ({ ...h, reserva_id: resData.id }));
            const { error: roomError } = await supabase
                .from('habitaciones_reserva')
                .insert(roomsToInsert);

            if (roomError) throw roomError;

            fetchReservas();
            return resData;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateReservaStatus = async (id: string, estado: EstadoReserva) => {
        try {
            const { error } = await supabase
                .from('reservas')
                .update({ estado, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setReservas(prev => prev.map(r => r.id === id ? { ...r, estado } : r));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchReservas();
    }, [fetchReservas]);

    return {
        reservas,
        isLoading,
        error,
        refresh: fetchReservas,
        saveReserva,
        updateReservaStatus,
        calculatePrice
    };
}
