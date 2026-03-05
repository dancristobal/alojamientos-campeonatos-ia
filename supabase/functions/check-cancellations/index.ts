import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')


serve(async (req: Request) => {
    try {

        const supabase = createClient(
            SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Fetch notification email from configuration
        const { data: configData, error: configError } = await supabase
            .from('configuracion')
            .select('valor')
            .eq('id', 'general')
            .single()

        if (configError) {
            console.error('Error fetching config:', configError)
        }

        // Extract email from JSONB field 'valor'. Fallback if not found.
        const notificationEmail = configData?.valor?.email_notificaciones || "dancristobal@gmail.com"
        console.log(`Sending alerts to: ${notificationEmail}`)

        // 2. Fetch active reservations with cancellation date in the next 3 days
        const now = new Date()
        now.setHours(0, 0, 0, 0) // Start of today

        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(now.getDate() + 3)
        threeDaysFromNow.setHours(23, 59, 59, 999) // End of day 3

        const { data: reservas, error } = await supabase
            .from('reservas')
            .select('*, campeonato:campeonatos(nombre)')
            .eq('estado', 'activa')
            .not('fecha_cancelacion', 'is', null)
            .gte('fecha_cancelacion', now.toISOString().split('T')[0])
            .lte('fecha_cancelacion', threeDaysFromNow.toISOString().split('T')[0])


        if (error) throw error

        if (!reservas || reservas.length === 0) {
            return new Response(JSON.stringify({ message: "No critical cancellations found." }), {
                headers: { "Content-Type": "application/json" },
                status: 200,
            })
        }

        // 2. Format email content
        const emailBody = `
      <h2>⚠️ Alerta de Cancelación de Reservas</h2>
      <p>Las siguientes reservas tienen su fecha límite de cancelación en los próximos 3 días:</p>
      <ul>
        ${reservas.map((r: any) => `
          <li>
            <strong>${r.alojamiento_nombre}</strong> (${r.campeonato?.nombre})<br>
            Límite: ${new Date(r.fecha_cancelacion).toLocaleDateString('es-ES')}<br>
            Entrada: ${new Date(r.fecha_entrada).toLocaleDateString('es-ES')}
          </li>
        `).join('')}
      </ul>
      <p>Por favor, revisa estas reservas en la aplicación.</p>
    `

        // 3. Send via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'ArcheryRes <notifications@resend.dev>',
                to: [notificationEmail],
                subject: '⚠️ Alerta: Cancelación Próxima de Alojamiento',
                html: emailBody,
            }),
        })

        const resData = await res.json()

        return new Response(JSON.stringify({ success: true, resData }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})
