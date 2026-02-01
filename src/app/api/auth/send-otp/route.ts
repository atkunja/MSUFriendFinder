import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOTPEmail } from '@/lib/email'

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export async function POST(request: Request) {
    try {
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { email } = await request.json()

        if (!email || !email.endsWith('@msu.edu')) {
            return NextResponse.json({ error: 'Valid @msu.edu email required' }, { status: 400 })
        }

        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Store in DB
        const { error: dbError } = await supabase
            .from('otps')
            .insert({ email, code, expires_at: expiresAt.toISOString() })

        if (dbError) throw dbError

        // Send email via Resend
        const emailResult = await sendOTPEmail(email, code)

        if (!emailResult.success) {
            console.error('Email sending failed:', emailResult.error)

            // Fallback: show code in UI if email fails (until domain is verified)
            return NextResponse.json({
                success: true,
                message: 'Email delivery failed - use code below',
                devCode: code
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email'
        })
    } catch (error: unknown) {
        console.error('OTP Error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
