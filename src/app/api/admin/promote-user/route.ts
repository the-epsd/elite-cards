import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { shopDomain, newRole } = body

    if (!shopDomain || !newRole) {
      return NextResponse.json(
        { error: 'Missing shopDomain or newRole' },
        { status: 400 }
      )
    }

    if (!['admin', 'end_user'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or end_user' },
        { status: 400 }
      )
    }

    // Update user role in database
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('shop_domain', shopDomain)
      .select()

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: data[0]
    })
  } catch (error) {
    console.error('Error promoting user:', error)
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    )
  }
}
