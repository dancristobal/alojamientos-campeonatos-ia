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
                .order('fecha', { ascending: false });

            if (error) throw error;
            setCampeonatos(data || []);
        } catch (err: any) {
            setError(err.message);
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
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateCampeonatoStatus = async (id: string, estado: EstadoCampeonato) => {
        try {
            const { error } = await supabase
                .from('campeonatos')
                .update({ estado })
                .eq('id', id);

            if (error) throw error;
            setCampeonatos(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteCampeonato = async (id: string) => {
        try {
            const { error } = await supabase
                .from('campeonatos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCampeonatos(prev => prev.filter(c => c.id !== id));
        } catch (err: any) {
            setError(err.message);
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
        updateCampeonatoStatus,
        deleteCampeonato
    };
}
