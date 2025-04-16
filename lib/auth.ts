import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = "121212"

export async function createToken(payload: { userId: any; email: any; userType: any }) {
  try {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 60 * 60 * 24 * 7 // 7 days

    const token = await new SignJWT({ ...payload, iat, exp })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(exp)
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .sign(new TextEncoder().encode(secretKey))
    return token
  } catch (error) {
    console.error("Token creation error:", error)
    return null
  }
}

type AuthPayload = {
  userId: number
  email: string
  userType: "resident" | "doctor" | "admin"
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey))
    return payload as AuthPayload
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function setTokenCookie(token: string) {
  cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}
