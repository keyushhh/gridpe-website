// @ts-nocheck
// Sends the Grid.Pe waitlist welcome email.
//
// Triggered by a Supabase Database Webhook on INSERT into public.waitlist.
// Database Webhooks send no Authorization header, so this function is deployed
// with verify_jwt = false (see supabase/config.toml). That makes the URL
// publicly callable, so the recipient is verified against the waitlist table
// before anything is sent - a stranger hitting this URL cannot make it mail an
// arbitrary address.
import { Resend } from 'npm:resend'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const resend = new Resend(RESEND_API_KEY)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* true = on the list, false = definitely not, null = could not check.
   A null (network blip, missing env) sends anyway rather than dropping a real
   signup on the floor; a definite false is refused. */
async function isOnWaitlist(email: string): Promise<boolean | null> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null
  try {
    const url = SUPABASE_URL + '/rest/v1/waitlist?select=email&limit=1&email=eq.' +
      encodeURIComponent(email)
    const res = await fetch(url, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: 'Bearer ' + SERVICE_ROLE_KEY },
    })
    if (!res.ok) {
      console.warn('[send-waitlist-email] waitlist lookup failed: HTTP ' + res.status)
      return null
    }
    const rows = await res.json()
    return Array.isArray(rows) && rows.length > 0
  } catch (err) {
    console.warn('[send-waitlist-email] waitlist lookup threw:', err)
    return null
  }
}

const TEXT_BODY = [
  "You're in. Now go touch some grass.",
  '',
  'Hey,',
  '',
  "You're on the Grid.Pe waitlist.",
  '',
  'Beautiful.',
  '',
  'Your spot is secured. Your cash is not yet en route. Please do not wait by the door.',
  '',
  "We're busy making doorstep cash a thing, because apparently humanity has conquered space but still makes people leave home for an ATM.",
  '',
  'Your turn is coming.',
  '',
  'Grid.Pe',
  'Cash, delivered.',
  '',
  '---',
  "You're receiving this because you joined the Grid.Pe waitlist.",
  'Questions? hello@gridpe.app',
  'Privacy: https://gridpe.app/privacy.html',
  'Terms: https://gridpe.app/terms.html',
  'Unsubscribe: reply to this email with "Unsubscribe"',
].join('\n')

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  if (!RESEND_API_KEY) {
    console.error('[send-waitlist-email] RESEND_API_KEY is not set')
    return json({ error: 'RESEND_API_KEY is not configured' }, 500)
  }

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Body is not valid JSON' }, 400)
  }

  /* Ignore UPDATE and DELETE so an edited row never re-sends. A manual test
     call has no `type` field, which is treated as a send. */
  if (payload.type && payload.type !== 'INSERT') {
    console.log('[send-waitlist-email] ignoring ' + payload.type + ' event')
    return json({ skipped: 'not an INSERT' })
  }

  const email = String(payload.record?.email ?? payload.email ?? '').trim().toLowerCase()

  if (!email) return json({ error: 'No recipient email found in payload' }, 400)
  if (!EMAIL_RE.test(email)) return json({ error: 'Recipient email is not valid' }, 400)

  if ((await isOnWaitlist(email)) === false) {
    console.warn('[send-waitlist-email] refusing: ' + email + ' is not on the waitlist')
    return json({ error: 'Recipient is not on the waitlist' }, 403)
  }

  console.log('[send-waitlist-email] sending welcome email to: ' + email)

  const { data, error } = await resend.emails.send({
    from: 'Grid.Pe <hello@gridpe.app>',
    to: [email],
    replyTo: 'hello@gridpe.app',
    subject: "You're in. Now go touch some grass.",
    headers: {
      'List-Unsubscribe': '<mailto:hello@gridpe.app?subject=Unsubscribe>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    text: TEXT_BODY,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Grid.Pe Waitlist</title>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; }
    body, table, td, p, h1, h2, span, div { -webkit-text-size-adjust:100%; }
    img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    a { color:#111111; }
    @media only screen and (max-width:620px) {
      .shell { padding:20px 12px 32px !important; }
      .pad { padding-left:26px !important; padding-right:26px !important; }
      .h1 { font-size:27px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#eceef1; font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#111111; -webkit-font-smoothing:antialiased;">

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#eceef1;">
    <tr>
      <td align="center" class="shell" style="padding:40px 16px 48px;">

        <!-- ===== card ===== -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border:1px solid #e4e7eb; border-radius:16px; overflow:hidden;">

          <!-- masthead -->
          <tr>
            <td class="pad" style="padding:34px 44px 0;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="https://gridpe.app/assets/logo-full.png" width="124" height="40" alt="Grid.Pe" style="display:block; width:124px; height:auto; max-width:124px; border:0;">
                  </td>
                  <td align="right" valign="middle" style="font-size:0; line-height:0;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="right">
                      <tr>
                        <td valign="middle" style="font-size:0; line-height:0;">
                          <a href="https://www.instagram.com/gridpe.app/" target="_blank" style="text-decoration:none;"><img src="https://gridpe.app/assets/email/instagram.png" width="20" height="20" alt="Instagram" style="display:block; width:20px; height:20px; border:0;"></a>
                        </td>
                        <td width="10" style="width:10px; font-size:0; line-height:0;">&nbsp;</td>
                        <td valign="middle" style="font-size:0; line-height:0;">
                          <a href="https://www.linkedin.com/company/gridpe" target="_blank" style="text-decoration:none;"><img src="https://gridpe.app/assets/email/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:block; width:20px; height:20px; border:0;"></a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- title -->
          <tr>
            <td align="left" class="pad" style="padding:32px 44px 0;">
              <h1 class="h1" style="margin:0; font-family:'Archivo',Helvetica,Arial,sans-serif; font-size:30px; line-height:1.24; font-weight:700; letter-spacing:-0.032em; color:#111111;">
                You're in. Now go touch some grass.
              </h1>
            </td>
          </tr>

          <!-- body copy -->
          <tr>
            <td class="pad" style="padding:34px 44px 0;">
              <p style="margin:0 0 20px; font-size:16px; line-height:1.62; color:#3d4148;">
                Hey,
              </p>
              <p style="margin:0 0 20px; font-size:16px; line-height:1.62; color:#111111; font-weight:600;">
                You're on the Grid.Pe waitlist.
              </p>
              <p style="margin:0 0 20px; font-size:16px; line-height:1.62; color:#3d4148;">
                Beautiful.
              </p>
              <p style="margin:0 0 20px; font-size:16px; line-height:1.62; color:#3d4148;">
                Your spot is secured. Your cash is not yet en route. Please do not wait by the door.
              </p>
              <p style="margin:0; font-size:16px; line-height:1.62; color:#3d4148;">
                We&rsquo;re busy making doorstep cash a thing, because apparently humanity has conquered space but still makes people leave home for an ATM.
              </p>
            </td>
          </tr>

          <!-- accent note -->
          <tr>
            <td class="pad" style="padding:30px 44px 0;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f7f8fa; border-radius:12px;">
                <tr>
                  <td width="3" style="width:3px; font-size:0; line-height:0; background-color:#7b2bff;">&nbsp;</td>
                  <td style="padding:18px 22px; font-family:'Archivo',Helvetica,Arial,sans-serif; font-size:17px; font-weight:600; letter-spacing:-0.015em; color:#111111;">
                    Your turn is coming.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- divider -->
          <tr>
            <td class="pad" style="padding:34px 44px 0;">
              <div style="height:1px; line-height:1px; font-size:0; background-color:#e9ecef;">&nbsp;</div>
            </td>
          </tr>

          <!-- sign-off -->
          <tr>
            <td class="pad" style="padding:26px 44px 38px;">
              <p style="margin:0 0 4px; font-family:'Archivo',Helvetica,Arial,sans-serif; font-size:15px; font-weight:700; letter-spacing:-0.02em; color:#111111;">
                Grid.Pe
              </p>
              <p style="margin:0; font-size:14px; line-height:1.5; color:#8b9099;">
                Cash, delivered.
              </p>
            </td>
          </tr>

          <!-- ===== footer ===== -->
          <tr>
            <td align="center" class="pad" style="padding:28px 44px 32px; background-color:#f7f8fa; border-top:1px solid #eceef1;">

              <img src="https://gridpe.app/assets/logo-full.png" width="86" height="28" alt="Grid.Pe" style="display:block; width:86px; height:auto; max-width:86px; border:0; opacity:0.42; margin:0 auto;">

              <p style="margin:14px 0 0; font-size:12.5px; line-height:1.65; color:#9aa0a8;">
                You&rsquo;re receiving this because you joined the Grid.Pe waitlist.
              </p>

              <p style="margin:10px 0 0; font-size:12.5px; line-height:1.65; color:#9aa0a8;">
                Questions? <a href="mailto:hello@gridpe.app" style="color:#4b5058; text-decoration:underline;">hello@gridpe.app</a>
              </p>

              <p style="margin:16px 0 0; font-size:12.5px; line-height:1.9; color:#9aa0a8;">
                <a href="https://gridpe.app/privacy.html" style="color:#6b7280; text-decoration:underline; white-space:nowrap;">Privacy Policy</a>
                <span style="color:#cfd4da;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                <a href="https://gridpe.app/terms.html" style="color:#6b7280; text-decoration:underline; white-space:nowrap;">Terms of Service</a>
                <span style="color:#cfd4da;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                <a href="mailto:hello@gridpe.app?subject=Unsubscribe%20me%20from%20the%20Grid.Pe%20waitlist" style="color:#6b7280; text-decoration:underline; white-space:nowrap;">Unsubscribe</a>
              </p>

              <p style="margin:16px 0 0; font-size:12px; line-height:1.6; color:#b1b6bd;">
                &copy; 2026 Grid.Pe &middot; <a href="https://gridpe.app" style="color:#b1b6bd; text-decoration:none;">gridpe.app</a>
              </p>

            </td>
          </tr>
          <!-- ===== /footer ===== -->

        </table>
        <!-- ===== /card ===== -->

      </td>
    </tr>
  </table>
</body>
</html>`,
  })

  if (error) {
    console.error('[send-waitlist-email] Resend API error:', error)
    return json({ error }, 502)
  }

  console.log('[send-waitlist-email] sent:', data?.id ?? data)
  return json({ success: true, id: data?.id ?? null })
})
