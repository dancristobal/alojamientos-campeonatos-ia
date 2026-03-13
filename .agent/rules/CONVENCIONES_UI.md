# Convenciones de UI Premium - Alojamientos Campeonatos IA

Este documento define los principios de diseño y componentes para mantener una estética coherente, moderna y de alta calidad en toda la aplicación.

## 1. Estética General: Glassmorphism & Depth
La aplicación debe sentirse "viva" y moderna. Usamos una base de Glassmorphism.

- **Fondo Principal**: `bg-slate-50` (Light) / `bg-slate-950` (Dark).
- **Contenedores (Glass)**: Usar la utilidad `glass` combinada con:
  - `bg-white/70` o `bg-slate-900/40`
  - `backdrop-blur-xl`
  - `border border-white/20` o `border-slate-800/30`
  - `rounded-[2rem]` o `rounded-3xl` para esquinas generosas.

## 2. Paleta de Colores
Evitar colores planos. Usar gradientes y HSL suaves.

- **Primary**: Indigo/Violet. `from-indigo-600 to-violet-600`.
- **Surface**: `slate-100` a `slate-300`.
- **Error/Alerta**: `rose-500` (Crítico/Cerrado), `amber-500` (Vencimiento).
- **Éxito**: `emerald-500`.

## 3. Tipografía
- **Títulos**: `font-black` o `font-bold` con `tracking-tight`. 
- **Gradientes en texto**: Usar `bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent` para títulos principales.
- **Cuerpo**: Inter o System Sans-serif, `font-medium` para labels.

## 4. Componentes y Estados
- **Botones**: Siempre con transiciones. `hover:scale-[1.02] active:scale-[0.98] transition-all`.
- **Badges**: Pequeños, `px-2 py-0.5 rounded-full text-[10px] font-black uppercase`.
- **Inputs**: `rounded-2xl`, bordes suaves, `focus:ring-2 focus:ring-primary/50`.

## 5. Micro-animaciones
Todas las transiciones deben ser suaves.
- **Entrada de vista**: `animate-in fade-in duration-500`.
- **Entrada de lista**: `animate-in fade-in slide-in-from-bottom-4`.
- **Hover**: Sombras sutiles `hover:shadow-xl` y cambios de opacidad en bordes.

## 6. Iconografía
- Utilizar **Lucide React**.
- Grosor de trazo corregido: `strokeWidth={2}` o `{1.5}` para un look más refinado.
- Combinar iconos con colores de estado de forma consistente.
