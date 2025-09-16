import { redirect } from 'next/navigation'
import { getSessionFromCookies } from '@/lib/auth'

export default async function Home() {
  const session = await getSessionFromCookies()

  if (session) {
    // Redirect based on user role
    redirect(session.role === 'admin' ? '/admin' : '/catalog')
  }

  // If no session, redirect to login
  redirect('/auth/login')
}
