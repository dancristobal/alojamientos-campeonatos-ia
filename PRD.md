# PRD: Sistema de Gestión de Alojamientos para Campeonatos

## 1. Visión General
Este proyecto es una aplicación web diseñada para arqueros y gestores de equipos que necesitan organizar la logística de alojamiento durante los campeonatos nacionales e internacionales. El sistema permite gestionar campeonatos, registrar hoteles, controlar fechas críticas de cancelación y repartir los gastos equitativamente entre los participantes.

## 2. Público Objetivo
- Arqueros individuales.
- Capitanes de equipo o gestores logísticos de clubes de tiro con arco.

## 3. Funcionalidades Principales

### 3.1. Gestión de Campeonatos
- **CRUD de Campeonatos**: Creación, edición y eliminación de eventos deportivos.
- **Estado del Campeonato**: 
    - **Abierto**: Permite modificaciones y nuevas reservas.
    - **Cerrado**: Bloquea ediciones para preservar el historial. Se visualiza con una identidad cromática roja para diferenciarlo.
- **Búsqueda y Filtrado**: Filtros por estado (abierto/cerrado) y búsqueda por nombre o localidad.

### 3.2. Gestión de Reservas y Alojamientos
- **Detalle Técnico**: Registro de fechas de entrada/salida, tipos de habitación, capacidad y precios.
- **Control de Cancelaciones**:
    - Alertas visuales basadas en umbrales configurables (Próxima/Crítica).
    - Identificación visual roja para reservas canceladas.
- **Sincronización Automática**: El sistema detecta y marca automáticamente como "Finalizadas" las reservas cuya fecha de salida ya ha pasado.

### 3.3. Base de Datos de Arqueros
- **Gestión Global**: Listado centralizado de arqueros con nombres y números de licencia para evitar duplicidad de datos.

### 3.4. Reparto de Gastos (Financial Flow)
- **Cálculo Automático**: Distribución del coste total del hotel entre los arqueros asignados.
- **Seguimiento de Pagos**: Sistema de "Check-pago" para marcar quién ha liquidado su parte.
- **Bloqueos de Seguridad**: No se permite cerrar un campeonato o borrar una reserva si existen pagos pendientes.

### 3.5. Dashboard (Panel de Control)
- **Métricas Clave**: Total de reservas activas y balance de pagos pendientes.
- **Alertas Tempranas**: Listado de cancelaciones urgentes y próximas entradas.

## 4. Stack Tecnológico
- **Frontend**: React.js con TypeScript.
- **Estilos**: Tailwind CSS (Diseño moderno, "Glassmorphism", modo oscuro nativo).
- **Backend/Base de Datos**: Supabase (PostgreSQL + Realtime).
- **Iconografía**: Lucide React.
- **Manejo de Fechas**: Date-fns.

## 5. Arquitectura de Datos (Esquema simplificado)
- `campeonatos`: Eventos principales.
- `reservas`: Hoteles asociados a cada campeonato.
- `habitaciones_reserva`: Tipos de habitación por hotel.
- `arqueros`: Entidades globales.
- `pagos_reserva`: Join table que vincula arqueros con reservas y controla su deuda/pago.

## 6. Hoja de Ruta (Mejoras Futuras)
- [ ] **Barra de Progreso Financiero**: Indicador visual de cobros en la tarjeta del campeonato.
- [ ] **Integración WhatsApp**: Generación automática de mensajes con el resumen del reparto.
- [ ] **Geolocalización**: Enlaces directos a Google Maps desde la ficha del hotel.
- [ ] **Gestión Documental**: Subida de PDFs de confirmación de reserva.
- [ ] **Multiperfil**: Diferentes niveles de acceso (lectura/edición).

---
*Documento generado el 2026-03-06 para el proyecto Alojamiento Campeonatos IA.*
