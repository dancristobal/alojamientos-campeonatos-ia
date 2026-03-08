import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Arquero } from '../types';

export function useArqueros() {
    const [arqueros, setArqueros] = useState<Arquero[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArqueros = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('arqueros')
                .select('*')
                .order('nombre', { ascending: true });
            if (error) throw error;
            setArqueros(data || []);
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchArqueros(); }, [fetchArqueros]);

    const createArquero = async (data: { nombre: string; email?: string; numero_licencia?: string }) => {
        const { data: created, error } = await supabase
            .from('arqueros')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        setArqueros(prev => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        return created;
    };

    const updateArquero = async (id: string, updates: { nombre: string; email?: string; numero_licencia?: string }) => {
        const { error } = await supabase
            .from('arqueros')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
        setArqueros(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const deleteArquero = async (id: string) => {
        const { error } = await supabase.from('arqueros').delete().eq('id', id);
        if (error) throw error;
        setArqueros(prev => prev.filter(a => a.id !== id));
    };

    return { arqueros, isLoading, error, createArquero, updateArquero, deleteArquero, refetch: fetchArqueros };
}
