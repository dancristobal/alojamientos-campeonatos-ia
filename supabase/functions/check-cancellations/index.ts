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

        // 1. Fetch notification email and thresholds from configuration
        const { data: configData, error: configError } = await supabase
            .from('configuracion')
            .select('valor')
            .eq('id', 'general')
            .single()

        if (configError) {
            console.error('Error fetching config:', configError)
        }

        const notificationEmail = configData?.valor?.email_notificaciones || "dancristobal@gmail.com"
        const thresholdCritica = configData?.valor?.umbrales?.critica || 3
        const thresholdProxima = configData?.valor?.umbrales?.proxima || 7

        console.log(`Config: Email=${notificationEmail}, Critica=${thresholdCritica}d, Proxima=${thresholdProxima}d`)

        // 2. Fetch active reservations with cancellation date within the longest threshold
        const now = new Date()
        now.setHours(0, 0, 0, 0)

        const maxThresholdLimit = new Date()
        maxThresholdLimit.setDate(now.getDate() + thresholdProxima)
        maxThresholdLimit.setHours(23, 59, 59, 999)

        const { data: reservas, error } = await supabase
            .from('reservas')
            .select('*, campeonato:campeonatos(nombre)')
            .eq('estado', 'activa')
            .not('fecha_cancelacion', 'is', null)
            .gte('fecha_cancelacion', now.toISOString().split('T')[0])
            .lte('fecha_cancelacion', maxThresholdLimit.toISOString().split('T')[0])

        if (error) throw error

        if (!reservas || reservas.length === 0) {
            return new Response(JSON.stringify({ message: "No cancellations found within thresholds." }), {
                headers: { "Content-Type": "application/json" },
                status: 200,
            })
        }

        // 3. Categorize
        const criticas = reservas.filter(r => {
            const days = Math.ceil((new Date(r.fecha_cancelacion).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            return days <= thresholdCritica
        })
        const proximas = reservas.filter(r => {
            const days = Math.ceil((new Date(r.fecha_cancelacion).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            return days > thresholdCritica && days <= thresholdProxima
        })

        // 4. Format email content
        const formatSection = (title: string, list: any[], color: string) => {
            if (list.length === 0) return ""
            return `
                <div style="margin-bottom: 25px; border-left: 5px solid ${color}; padding-left: 15px;">
                    <h3 style="color: ${color}; text-transform: uppercase;">${title} (${list.length})</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${list.map(r => `
                            <li style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                                <strong>${r.alojamiento_nombre}</strong> (${r.campeonato?.nombre})<br>
                                <span style="font-size: 0.9em; color: #666;">
                                    Límite: ${new Date(r.fecha_cancelacion).toLocaleDateString('es-ES')}<br>
                                    Entrada: ${new Date(r.fecha_entrada).toLocaleDateString('es-ES')}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `
        }

        const emailBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #333;">⚠️ Alerta de Cancelación de Reservas</h2>
                ${formatSection("🛑 CRÍTICAS (Urgente)", criticas, "#e11d48")}
                ${formatSection("⏳ PRÓXIMAS", proximas, "#d97706")}
                <p style="color: #666; font-size: 0.8em; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    Por favor, revisa estas reservas en la aplicación.
                </p>
            </div>
        `

        // 5. Send via Resend
        const subject = criticas.length > 0
            ? `🚨 ALERTA CRÍTICA: ${criticas.length} cancelaciones urgentes`
            : `⚠️ Recordatorio: ${proximas.length} cancelaciones próximas`

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'ArcheryRes <notifications@resend.dev>',
                to: [notificationEmail],
                subject: subject,
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
