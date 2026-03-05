export type EstadoCampeonato = 'abierto' | 'cerrado';
export type EstadoReserva = 'activa' | 'cancelada' | 'vencida' | 'finalizada';

export interface Campeonato {
    id: string;
    nombre: string;
    fecha: string;
    fecha_fin?: string | null;
    localidad: string;
    numero_personas: number;
    estado: EstadoCampeonato;
    created_at: string;
}

export interface Reserva {
    id: string;
    campeonato_id: string;
    alojamiento_nombre?: string;
    fecha_entrada: string;
    fecha_salida: string;
    fecha_cancelacion?: string | null;
    es_reembolsable: boolean;
    estado: EstadoReserva;
    precio_total_manual?: number;
    precio_total_calculado: number;
    precio_total_final: number;
    enlace_web?: string;
    observaciones?: string; // Nuevo campo para notas
    created_at: string;
    updated_at: string;
    // Habitaciones related info if flattened or joined
    habitaciones?: HabitacionReserva[];
}

export interface HabitacionReserva {
    id: string;
    reserva_id: string;
    numero_habitaciones: number;
    precio_por_habitacion: number;
    capacidad: number;
}

export interface DashboardMetrics {
    totalCampeonatosActivos: number;
    proximasCancelaciones: Reserva[];
    proximasEntradas: Reserva[];
    alertasPlazasInsuficientes: {
        campeonato: Campeonato;
        plazasTotales: number;
    }[];
}
