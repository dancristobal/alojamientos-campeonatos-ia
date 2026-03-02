
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AppConfig {
    umbrales: {
        proxima: number;
        critica: number;
    };
    usuario: {
        nombre: string;
        rol: string;
    };
    email_notificaciones: string;
}

const defaultConfig: AppConfig = {
    umbrales: {
        proxima: 7,
        critica: 3,
    },
    usuario: {
        nombre: 'Daniel Cristobal',
        rol: 'Admin',
    },
    email_notificaciones: 'daniel@example.com',
};

export const useConfig = () => {
    const [config, setConfig] = useState<AppConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('configuracion')
                .select('valor')
                .eq('id', 'general')
                .single();

            if (error) {
                console.error('Supabase error fetching config:', error);
            }

            if (data?.valor) {
                setConfig(data.valor as AppConfig);
            }
        } catch (err) {
            console.error('Error fetching config:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateConfig = async (newConfig: AppConfig) => {
        try {
            const { error } = await supabase
                .from('configuracion')
                .upsert({ id: 'general', valor: newConfig });

            if (!error) {
                setConfig(newConfig);
                return true;
            }
            console.error('Supabase error updating config:', error);
            return false;
        } catch (err) {
            console.error('Error updating config:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return { config, updateConfig, isLoading, refresh: fetchConfig };
};
