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

            let query = supabase
                .from('reservas')
                .select(`
                  *,
                  habitaciones:habitaciones_reserva(*),
                  campeonatos (nombre, estado),
                  pagos:pagos_reserva(*)
                `)
                .order('fecha_entrada', { ascending: true });

            if (campeonatoId !== 'all') {
                query = query.eq('campeonato_id', campeonatoId);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Computed synchronization: check for reservations that should be 'finalizada'
            // We use local time for the "today" boundary to match user expectations
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const nowStr = now.toISOString().split('T')[0];

            const reservations = data as (Reserva & { id: string, fecha_salida: string, estado: string })[];
            const idsToUpdate: string[] = [];

            reservations.forEach(r => {
                // If chek-out date is strictly before today and it was 'activa', update it
                if (r.estado === 'activa' && r.fecha_salida < nowStr) {
                    r.estado = 'finalizada';
                    idsToUpdate.push(r.id);
                }
            });

            if (idsToUpdate.length > 0) {
                // background update to DB
                supabase
                    .from('reservas')
                    .update({ estado: 'finalizada' })
                    .in('id', idsToUpdate)
                    .then(({ error }) => {
                        if (error) console.error('Error auto-finalizing reservations:', error);
                    });
            }

            setReservas(reservations || []);
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
        reservaData: Omit<Reserva, 'id' | 'created_at' | 'updated_at' | 'habitaciones' | 'precio_total_calculado' | 'precio_total_final'> & { id?: string },
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
                .upsert({
                    ...reservaData,
                    precio_total_calculado: precioCalculado,
                    precio_total_final: precioFinal,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (resError) throw resError;

            // 2. Clear old habitaciones if updating
            // We use resData.id to be absolutely sure we have the correct ID
            const { error: delError } = await supabase
                .from('habitaciones_reserva')
                .delete()
                .eq('reserva_id', resData.id);

            if (delError) throw delError;

            // 3. Insert new habitaciones
            if (habitaciones.length > 0) {
                const roomsToInsert = habitaciones.map(h => ({ ...h, reserva_id: resData.id }));
                const { error: roomError } = await supabase
                    .from('habitaciones_reserva')
                    .insert(roomsToInsert);

                if (roomError) throw roomError;
            }

            await fetchReservas();
            return resData;
        } catch (err: any) {
            console.error('Error in saveReserva:', err);
            setError(err.message);
            throw err;
        }
    };

    const checkPagosPendientesReserva = async (reservaId: string) => {
        const { data: pagos } = await supabase
            .from('pagos_reserva')
            .select('id')
            .eq('reserva_id', reservaId)
            .eq('ha_pagado', false);
        if (pagos && pagos.length > 0) {
            throw new Error('No se puede realizar esta acción: hay arqueros pendientes de pago en esta reserva.');
        }
    };

    const updateReservaStatus = async (id: string, estado: EstadoReserva) => {
        try {
            if (estado === 'cancelada') {
                await checkPagosPendientesReserva(id);
            }
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

    const deleteReserva = async (id: string) => {
        try {
            await checkPagosPendientesReserva(id);
            // 1. Delete associated rooms first to avoid FK constraints
            const { error: roomsError } = await supabase
                .from('habitaciones_reserva')
                .delete()
                .eq('reserva_id', id);

            if (roomsError) throw roomsError;

            // 2. Delete the reservation
            const { error: resError } = await supabase
                .from('reservas')
                .delete()
                .eq('id', id);

            if (resError) throw resError;
            setReservas(prev => prev.filter(r => r.id !== id));
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
        deleteReserva,
        calculatePrice
    };
}
