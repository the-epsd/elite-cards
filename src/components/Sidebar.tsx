'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Users, Plus, LogOut, BarChart3 } from 'lucide-react'

interface UserSession {
  userId: string
  shopDomain: string
  role: 'admin' | 'end_user'
}

interface SidebarProps {
  currentPage?: string
}

export default function Sidebar({ currentPage = '' }: SidebarProps) {
  const [session, setSession] = useState<UserSession | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const sessionData = await response.json()
        setSession(sessionData.session)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const handleLogout = () => {
    document.cookie = 'session=; Path=/; Max-Age=0'
    router.push('/auth/login')
  }

  const isActive = (page: string) => {
    return currentPage === page ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
  }

  const handleNavigation = (path: string) => {
    // Add a small delay to make navigation feel smoother
    setTimeout(() => {
      router.push(path)
    }, 100)
  }

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <Package className="h-10 w-10 text-indigo-600" />
          <h1 className="ml-3 text-xl font-bold text-gray-900">Elite Cards</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {/* Admin Navigation - Only show if user is admin */}
          {session?.role === 'admin' && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Admin
              </div>
              <button
                onClick={() => handleNavigation('/admin')}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive('admin')}`}
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation('/admin/create-product')}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive('create-product')}`}
              >
                <Plus className="h-4 w-4 mr-3" />
                Create Product
              </button>
              <button
                onClick={() => handleNavigation('/admin/users')}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive('users')}`}
              >
                <Users className="h-4 w-4 mr-3" />
                Manage Users
              </button>
            </>
          )}

          {/* General Navigation */}
          <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${session?.role === 'admin' ? 'mt-6' : ''}`}>
            {session?.role === 'admin' ? 'General' : 'Navigation'}
          </div>
          <button
            onClick={() => handleNavigation('/catalog')}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive('catalog')}`}
          >
            <Package className="h-4 w-4 mr-3" />
            View Catalog
          </button>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}
