'use client'

import { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
        } ${className}`}
    >
      {children}
    </div>
  )
}
