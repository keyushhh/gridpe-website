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
      subject: "You're on the Grid.Pe waitlist ⚡",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Grid.Pe</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0b0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0c0e; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #121316; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; padding: 36px 32px; text-align: left;">
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #d4ff00;">Grid.Pe</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff; line-height: 1.25;">
                        You're on the list.
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.72); padding-bottom: 20px;">
                      Thanks for joining the Grid.Pe waitlist. We are rolling out doorstep cash access street-by-street across India, starting with our live pilot in <strong>Bengaluru</strong>, with <strong>Guwahati</strong> next.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px;">
                        <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #d4ff00;">No ATM hunts. No hidden deductions.</p>
                        <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,0.65);">
                          Order what you need, track a KYC-verified courier in real time, and confirm handover with a secure 6-digit OTP.
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 14.5px; line-height: 1.6; color: rgba(255,255,255,0.72); padding-bottom: 28px;">
                      We will send you exactly one email the moment delivery goes live in your neighborhood. Nothing else.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.45); border-top: 1px solid rgba(255,255,255,0.07); padding-top: 24px;">
                      Have questions or feedback? Reply directly to this email at <a href="mailto:hello@gridpe.app" style="color: #d4ff00; text-decoration: none;">hello@gridpe.app</a>.<br><br>
                      &copy; 2026 Grid.Pe &middot; Built in India. Cash access, street by street.
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
