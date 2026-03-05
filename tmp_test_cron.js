
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)


async function testCron() {
  console.log('--- Starting Cron Logic Test ---')

  // 1. Create a test tournament
  const { data: tournament, error: tError } = await supabase
    .from('campeonatos')
    .insert([
      { nombre: 'TORNEO TEST CRON', fecha: '2026-04-01', localidad: 'Test City', numero_personas: 1 }
    ])
    .select()
    .single()

  if (tError) {
    console.error('Error creating tournament:', tError)
    return
  }
  console.log('Created test tournament:', tournament.id)

  // 2. Create test reservations
  // R1: Cancellation tomorrow (Should be caught)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateTomorrow = tomorrow.toISOString().split('T')[0]

  // R2: Cancellation today (Might be missed if logic is buggy)
  const today = new Date().toISOString().split('T')[0]

  // R3: Cancellation in 5 days (Should be ignored)
  const fiveDays = new Date()
  fiveDays.setDate(fiveDays.getDate() + 5)
  const dateFiveDays = fiveDays.toISOString().split('T')[0]

  const { data: reservations, error: rError } = await supabase
    .from('reservas')
    .insert([
      {
        campeonato_id: tournament.id,
        alojamiento_nombre: 'HOTEL TOMORROW',
        fecha_entrada: '2026-03-30',
        fecha_salida: '2026-04-02',
        fecha_cancelacion: dateTomorrow,
        estado: 'activa'
      },
      {
        campeonato_id: tournament.id,
        alojamiento_nombre: 'HOTEL TODAY',
        fecha_entrada: '2026-03-30',
        fecha_salida: '2026-04-02',
        fecha_cancelacion: today,
        estado: 'activa'
      },
      {
        campeonato_id: tournament.id,
        alojamiento_nombre: 'HOTEL FAR',
        fecha_entrada: '2026-03-30',
        fecha_salida: '2026-04-02',
        fecha_cancelacion: dateFiveDays,
        estado: 'activa'
      }
    ])
    .select()

  if (rError) {
    console.error('Error creating reservations:', rError)
    await supabase.from('campeonatos').delete().eq('id', tournament.id)
    return
  }
  console.log('Created 3 test reservations.')

  // 3. Emulate the Edge Function logic
  console.log('Emulating Edge Function Query Logic...')
  const now = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(now.getDate() + 3)

  console.log(`Searching between: ${now.toISOString()} and ${threeDaysFromNow.toISOString()}`)

  const { data: found, error: fError } = await supabase
    .from('reservas')
    .select('*, campeonato:campeonatos(nombre)')
    .eq('estado', 'activa')
    .not('fecha_cancelacion', 'is', null)
    .gte('fecha_cancelacion', now.toISOString())
    .lte('fecha_cancelacion', threeDaysFromNow.toISOString())

  if (fError) {
    console.error('Query error:', fError)
  } else {
    console.log(`Found ${found.length} reservations for the alert:`)
    found.forEach(r => {
      console.log(` - ${r.alojamiento_nombre} (Límite: ${r.fecha_cancelacion})`)
    })

    const hasToday = found.some(r => r.alojamiento_nombre === 'HOTEL TODAY')
    const hasTomorrow = found.some(r => r.alojamiento_nombre === 'HOTEL TOMORROW')
    const hasFar = found.some(r => r.alojamiento_nombre === 'HOTEL FAR')

    if (hasTomorrow) console.log('✅ Tomorrow is correctly identified.')
    if (hasFar) console.log('❌ Far reservation was INCORRECTLY identified.')
    if (!hasToday) console.log('⚠️ TODAY was missed (likely due to time mismatch in comparison).')
  }

  // 4. Cleanup
  console.log('Cleaning up test data...')
  await supabase.from('campeonatos').delete().eq('id', tournament.id)
  console.log('Done.')
}


testCron()
