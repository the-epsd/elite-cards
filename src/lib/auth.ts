import jwt from 'jsonwebtoken'
import { supabase, createOrUpdateUser as supabaseCreateOrUpdateUser, getUserByShopDomain } from './supabase'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface UserSession {
  userId: string
  shopDomain: string
  role: 'admin' | 'end_user'
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export function createSession(user: UserSession): string {
  console.log('Creating session with JWT_SECRET:', JWT_SECRET ? 'SET' : 'NOT SET')
  console.log('User session data:', user)
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
  console.log('Generated token length:', token.length)
  return token
}

export function verifySession(token: string): UserSession | null {
  try {
    console.log('Verifying session with JWT_SECRET:', JWT_SECRET ? 'SET' : 'NOT SET')
    return jwt.verify(token, JWT_SECRET) as UserSession
  } catch (error) {
    console.log('Session verification failed:', error)
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
  return await getUserByShopDomain(session.shopDomain)
}

export async function createOrUpdateUser(
  shopDomain: string,
  accessToken: string,
  role: 'admin' | 'end_user' = 'end_user'
) {
  return await supabaseCreateOrUpdateUser(shopDomain, accessToken, role)
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

