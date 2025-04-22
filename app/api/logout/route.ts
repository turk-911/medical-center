import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Clear the auth_token cookie by setting its Max-Age to 0
        const res = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })

        // Set the auth_token cookie with an expiration date in the past to clear it
        res.headers.set('Set-Cookie', 'auth_token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict')

        return res
    } catch (error) {
        console.error('Error logging out:', error)
        return NextResponse.json({ message: 'Error logging out' }, { status: 500 })
    }
}