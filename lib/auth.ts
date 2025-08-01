import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserById } from "./user-management" // Assuming this function exists

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Session expires in 7 days
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("Failed to decrypt session:", error)
    return null
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session = await encrypt({ userId, expiresAt })

  cookies().set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function updateSession() {
  const session = cookies().get("session")?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const currentTime = Date.now()
  const sessionExpiresAt = payload.expiresAt ? new Date(payload.expiresAt as number).getTime() : 0

  // Refresh the session if it's about to expire (e.g., within 24 hours)
  if (sessionExpiresAt - currentTime < 24 * 60 * 60 * 1000) {
    const newExpiresAt = new Date(currentTime + 7 * 24 * 60 * 60 * 1000)
    const newSession = await encrypt({ userId: payload.userId, expiresAt: newExpiresAt })

    cookies().set("session", newSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: newExpiresAt,
      sameSite: "lax",
      path: "/",
    })
  }

  return payload
}

export async function deleteSession() {
  cookies().delete("session")
}

export async function getSession() {
  const session = cookies().get("session")?.value
  if (!session) return null
  return await decrypt(session)
}

export async function getAuthenticatedUser() {
  const session = await getSession()
  if (!session?.userId) {
    return null
  }
  const user = await getUserById(session.userId)
  return user
}

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Using Next.js 15.1 experimental forbidden() API for 403
    // You need to enable `authInterrupts: true` in next.config.ts
    // and create an app/forbidden.tsx file.
    // For now, we'll redirect to login or a generic error page.
    console.warn(`User ${user.email} (role: ${user.role}) attempted to access restricted resource.`)
    redirect("/login?error=unauthorized") // Or redirect to a custom 403 page
  }

  return user
}
