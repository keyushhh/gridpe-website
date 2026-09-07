// @ts-nocheck
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

Deno.serve(async (req: Request) => {
  // Allow health check / options
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const payload = await req.json()

    // When triggered via Supabase Database Webhook, the row is in payload.record
    // When tested manually via curl/fetch, it might be payload.email or payload.record.email
    const email = payload.record?.email || payload.email

    if (!email) {
      return new Response(JSON.stringify({ error: 'No recipient email found in payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`[send-waitlist-email] Sending welcome email to: ${email}`)

    const { data, error } = await resend.emails.send({
      from: 'Grid.Pe <hello@gridpe.app>',
      to: [email],
      replyTo: 'hello@gridpe.app',
      subject: "You're in. Now go touch some grass.",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Grid.Pe Waitlist</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0b0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c0e; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #121316; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; padding: 36px 32px; text-align: left;">
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #d4ff00;">Grid.Pe</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 20px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff; line-height: 1.3;">
                        You're in. Now go touch some grass.
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 15.5px; line-height: 1.65; color: rgba(255,255,255,0.85); padding-bottom: 14px;">
                      Hey,
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; line-height: 1.6; color: #ffffff; padding-bottom: 14px;">
                      <strong>You're on the Grid.Pe waitlist.</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 15.5px; line-height: 1.65; color: rgba(255,255,255,0.85); padding-bottom: 14px;">
                      Beautiful.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.75); padding-bottom: 16px;">
                      Your spot is secured. Your cash is not yet en route. Please do not wait by the door.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.75); padding-bottom: 24px;">
                      We’re busy making doorstep cash a thing, because apparently humanity has conquered space but still makes people leave home for an ATM.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; font-weight: 700; color: #d4ff00; padding-bottom: 28px;">
                      Your turn is coming.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.45); border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;">
                      <strong style="color: rgba(255,255,255,0.75);">Grid.Pe</strong><br>
                      Cash, delivered.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('[send-waitlist-email] Resend API error:', error)
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('[send-waitlist-email] Email sent successfully:', data)
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[send-waitlist-email] Unexpected error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
