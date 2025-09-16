interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'stats' | 'form'
  count?: number
}

export default function SkeletonLoader({ type = 'card', count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'table':
        return (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </div>
            <div className="px-6 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'form':
        return (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
            <div className="px-6 py-6 space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )

      default: // card
        return (
          <div className="space-y-8">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className="border rounded-lg overflow-hidden">
                      <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                      <div className="p-4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
    }
  }

  return <>{renderSkeleton()}</>
}
