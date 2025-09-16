import jwt from 'jsonwebtoken'
import { prisma } from './db'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface UserSession {
  userId: string
  shopDomain: string
  role: 'admin' | 'end_user'
}

const JWT_SECRET = process.env.JWT_SECRET!

export function createSession(user: UserSession): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifySession(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch {
    return null
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<UserSession | null> {
  const token = request.cookies.get('session')?.value
  if (!token) return null
  return verifySession(token)
}

export async function getSessionFromCookies(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySession(token)
}

export async function getUserFromSession(session: UserSession) {
  return await prisma.user.findUnique({
    where: { id: session.userId },
  })
}

export async function createOrUpdateUser(
  shopDomain: string,
  accessToken: string,
  role: 'admin' | 'end_user' = 'end_user'
) {
  return await prisma.user.upsert({
    where: { shopDomain },
    update: { accessToken, role },
    create: {
      shopDomain,
      accessToken,
      role,
    },
  })
}

export function setSessionCookie(session: string) {
  return {
    'Set-Cookie': `session=${session}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`,
  }
}

export function clearSessionCookie() {
  return {
    'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
  }
}

