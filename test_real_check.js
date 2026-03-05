
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function realTest() {
  console.log('--- Iniciando Prueba Real ---')

  // 1. Crear un torneo de prueba
  const { data: tournament, error: tError } = await supabase
    .from('campeonatos')
    .insert([
      { nombre: 'PRUEBA REAL SISTEMA', fecha: '2026-05-01', localidad: 'Test Cloud', numero_personas: 1 }
    ])
    .select()
    .single()

  if (tError) {
    console.error('Error al crear torneo:', tError)
    return
  }
  console.log('Torneo creado:', tournament.id)

  // 2. Crear una reserva con cancelación para MAÑANA
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateTomorrow = tomorrow.toISOString().split('T')[0]

  const { data: reservation, error: rError } = await supabase
    .from('reservas')
    .insert([
      {
        campeonato_id: tournament.id,
        alojamiento_nombre: 'HOTEL PRUEBA REAL (BORRAR)',
        fecha_entrada: '2026-05-10',
        fecha_salida: '2026-05-15',
        fecha_cancelacion: dateTomorrow,
        estado: 'activa'
      }
    ])
    .select()
    .single()

  if (rError) {
    console.error('Error al crear reserva:', rError)
    await supabase.from('campeonatos').delete().eq('id', tournament.id)
    return
  }
  console.log('Reserva creada con cancelación para:', dateTomorrow)

  // 3. Forzar ejecución de la función en la NUBE
  console.log('Llamando a la función en Supabase...')
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/check-cancellations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({})
    })
    
    const result = await response.json()
    console.log('Respuesta de la Nube:', JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('✅ ¡ÉXITO! La función se ejecutó en la nube y dice haber enviado el mail.')
      console.log('Revisa tu bandeja de entrada (y la de carmengaro8@gmail.com).')
    } else {
      console.log('❌ La función respondió pero hubo un error en el envío.')
    }
  } catch (err) {
    console.error('Error al contactar con la nube:', err)
  }

  // 4. Limpieza
  console.log('Borrando datos de prueba...')
  await supabase.from('campeonatos').delete().eq('id', tournament.id)
  console.log('Limpieza completada.')
}

realTest()
