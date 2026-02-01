const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SpartanFinder <onboarding@resend.dev>'

interface EmailResult {
    success: boolean
    error?: string
}

export async function sendOTPEmail(email: string, code: string): Promise<EmailResult> {
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured')
        return { success: false, error: 'Email service not configured' }
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: email,
                subject: 'Your SpartanFinder Verification Code',
                html: getOTPEmailTemplate(code),
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Resend API Error:', data)
            return {
                success: false,
                error: data.message || 'Failed to send email'
            }
        }

        return { success: true }
    } catch (error) {
        console.error('Email sending failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

function getOTPEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #18453B 0%, #2D5A4E 100%); border-radius: 16px; display: inline-block; text-align: center; line-height: 56px;">
                                <span style="color: white; font-size: 28px; font-weight: 900;">S</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                        <td style="background: linear-gradient(180deg, #141414 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 24px; padding: 40px;">
                            <!-- Header -->
                            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #ffffff; text-align: center;">
                                Verification Code
                            </h1>
                            <p style="margin: 0 0 32px 0; font-size: 14px; color: #737373; text-align: center;">
                                Enter this code to verify your MSU email
                            </p>

                            <!-- Code Box -->
                            <div style="background: #1a1a1a; border: 1px solid #333333; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
                                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #18453B; font-family: monospace;">
                                    ${code}
                                </span>
                            </div>

                            <!-- Expiry Notice -->
                            <p style="margin: 0; font-size: 13px; color: #525252; text-align: center;">
                                This code expires in <strong style="color: #737373;">10 minutes</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding-top: 32px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #404040;">
                                Didn't request this code? You can safely ignore this email.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #333333; text-transform: uppercase; letter-spacing: 1px;">
                                SpartanFinder - Michigan State University
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
}
