
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  console.log('--- Creando Reservas de Prueba (Crítico y Próximo) ---')

  // 1. Crear un torneo de prueba
  const { data: tournament, error: tError } = await supabase
    .from('campeonatos')
    .insert([
      { 
        nombre: 'CAMPEONATO DE PRUEBA ALERTAS', 
        fecha: '2026-06-01', 
        localidad: 'Test City', 
        numero_personas: 5 
      }
    ])
    .select()
    .single()

  if (tError) {
    console.error('Error al crear torneo:', tError)
    return
  }
  console.log('Torneo creado:', tournament.id)

  // 2. Definir fechas
  const now = new Date()
  
  // Crítico: 2 días
  const criticalDate = new Date()
  criticalDate.setDate(now.getDate() + 2)
  const strCritical = criticalDate.toISOString().split('T')[0]

  // Próximo: 5 días
  const upcomingDate = new Date()
  upcomingDate.setDate(now.getDate() + 5)
  const strUpcoming = upcomingDate.toISOString().split('T')[0]

  // 3. Crear reservas
  const { data: reservations, error: rError } = await supabase
    .from('reservas')
    .insert([
      {
        campeonato_id: tournament.id,
        alojamiento_nombre: 'HOTEL CRÍTICO (2 días)',
        fecha_entrada: '2026-06-10',
        fecha_salida: '2026-06-15',
        fecha_cancelacion: strCritical,
        estado: 'activa',
        es_reembolsable: true
      },
      {
        campeonato_id: tournament.id,
        alojamiento_nombre: 'HOTEL PRÓXIMO (5 días)',
        fecha_entrada: '2026-06-12',
        fecha_salida: '2026-06-18',
        fecha_cancelacion: strUpcoming,
        estado: 'activa',
        es_reembolsable: true
      }
    ])
    .select()

  if (rError) {
    console.error('Error al crear reservas:', rError)
    return
  }

  console.log('✅ Reservas creadas con éxito:')
  console.log(` - Crítica: ${strCritical}`)
  console.log(` - Próxima: ${strUpcoming}`)
  console.log('\nYa puedes revisar el Dashboard o el Detalle del Campeonato en tu navegador.')
  console.log('ID del Torneo:', tournament.id)
}

createTestData()
