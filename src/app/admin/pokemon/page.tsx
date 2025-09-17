'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, Plus, Users, RefreshCw } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SkeletonLoader from '@/components/SkeletonLoader'
import PageTransition from '@/components/PageTransition'
import { useNotification } from '@/contexts/NotificationContext'

interface PokemonCard {
  id: string
  name: string
  set: string
  number: string
  rarity: string
  imageUrl: string
  marketPrice: number
  lowPrice: number
  midPrice: number
  highPrice: number
  lastUpdated: string
}

interface PokemonSet {
  id: string
  name: string
  series: string
  total: number
  releaseDate: string
  symbolUrl: string
  logoUrl: string
}

interface User {
  id: string
  shop_domain: string
  role: 'admin' | 'end_user'
  created_at: string
}

export default function PokemonAdminPage() {
  const { showSuccess, showError } = useNotification()
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [sets, setSets] = useState<PokemonSet[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSet, setSelectedSet] = useState('')
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [pushing, setPushing] = useState(false)
  const [priceSyncing, setPriceSyncing] = useState(false)

  const fetchInitialData = useCallback(async () => {
    try {
      const [setsResponse, usersResponse] = await Promise.all([
        fetch('/api/pokemon/sets'),
        fetch('/api/admin/users')
      ])

      if (setsResponse.ok) {
        const setsData = await setsResponse.json()
        setSets(setsData.sets)
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users.filter((user: User) => user.role === 'end_user'))
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      showError('Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const searchCards = async (query: string, setFilter?: string) => {
    if (!query.trim()) return

    setSearching(true)
    try {
      const params = new URLSearchParams({
        q: query,
        page: '1',
        pageSize: '50'
      })

      if (setFilter) {
        params.set('set', setFilter)
      }

      const response = await fetch(`/api/pokemon/search?${params}`)

      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
      } else {
        showError('Failed to search cards')
      }
    } catch (error) {
      console.error('Error searching cards:', error)
      showError('Failed to search cards')
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchCards(searchQuery, selectedSet)
  }

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards)
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId)
    } else {
      newSelection.add(cardId)
    }
    setSelectedCards(newSelection)
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const selectAllCards = () => {
    if (selectedCards.size === cards.length) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(cards.map(card => card.id)))
    }
  }

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)))
    }
  }

  const pushProductsToUsers = async () => {
    if (selectedCards.size === 0 || selectedUsers.size === 0) {
      showError('Please select at least one card and one user')
      return
    }

    setPushing(true)
    try {
      const results = {
        successful: [] as string[],
        failed: [] as { card: string; user: string; error: string }[]
      }

      for (const cardId of selectedCards) {
        const card = cards.find(c => c.id === cardId)
        if (!card) continue

        // First, add the product to our database
        const addProductResponse = await fetch('/api/pokemon/add-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pokemonCardId: cardId })
        })

        if (!addProductResponse.ok) {
          const error = await addProductResponse.json()
          results.failed.push({
            card: card.name,
            user: 'All users',
            error: error.error || 'Failed to create product'
          })
          continue
        }

        const productData = await addProductResponse.json()
        const productId = productData.product.id

        // Then push to each selected user
        for (const userId of selectedUsers) {
          try {
            const pushResponse = await fetch('/api/admin/push-to-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId,
                userId
              })
            })

            if (pushResponse.ok) {
              results.successful.push(`${card.name} → ${users.find(u => u.id === userId)?.shop_domain}`)
            } else {
              const error = await pushResponse.json()
              results.failed.push({
                card: card.name,
                user: users.find(u => u.id === userId)?.shop_domain || 'Unknown',
                error: error.error || 'Failed to push product'
              })
            }
          } catch (error) {
            results.failed.push({
              card: card.name,
              user: users.find(u => u.id === userId)?.shop_domain || 'Unknown',
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }
      }

      // Show results
      if (results.successful.length > 0) {
        showSuccess(`Successfully pushed ${results.successful.length} products`)
      }
      if (results.failed.length > 0) {
        showError(`Failed to push ${results.failed.length} products. Check console for details.`)
        console.error('Failed pushes:', results.failed)
      }

      // Clear selections
      setSelectedCards(new Set())
      setSelectedUsers(new Set())
    } catch (error) {
      console.error('Error pushing products:', error)
      showError('Failed to push products')
    } finally {
      setPushing(false)
    }
  }

  const syncAllPrices = async () => {
    setPriceSyncing(true)
    try {
      const response = await fetch('/api/pokemon/sync-prices', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        showSuccess(`Synced prices for ${data.updated} products`)
      } else {
        const error = await response.json()
        showError(`Failed to sync prices: ${error.error}`)
      }
    } catch (error) {
      console.error('Error syncing prices:', error)
      showError('Failed to sync prices')
    } finally {
      setPriceSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentPage="pokemon" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 py-6 px-6">
            <SkeletonLoader type="stats" />
            <SkeletonLoader type="table" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="pokemon" />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
          <PageTransition>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Pokemon TCG Management</h1>
              <p className="mt-2 text-gray-600">
                Search Pokemon cards and push them to user stores with automatic price synchronization
              </p>
            </div>

            {/* Search Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Search Pokemon Cards</h2>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search for Pokemon cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="w-64">
                    <select
                      value={selectedSet}
                      onChange={(e) => setSelectedSet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Sets</option>
                      {sets.map((set) => (
                        <option key={set.id} value={set.id}>
                          {set.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
            </div>

            {/* Cards Results */}
            {cards.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Search Results ({cards.length} cards)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllCards}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      {selectedCards.size === cards.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedCards.has(card.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => toggleCardSelection(card.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          {card.imageUrl ? (
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              width={64}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{card.name}</h3>
                          <p className="text-sm text-gray-500">{card.set} • {card.rarity}</p>
                          <p className="text-sm font-medium text-green-600">${card.marketPrice}</p>
                          <p className="text-xs text-gray-400">
                            Low: ${card.lowPrice} • High: ${card.highPrice}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Selection */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Select Users ({users.length} users)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllUsers}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    {selectedUsers.size === users.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedUsers.has(user.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => toggleUserSelection(user.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.shop_domain}</p>
                        <p className="text-sm text-gray-500">End User</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={pushProductsToUsers}
                    disabled={pushing || selectedCards.size === 0 || selectedUsers.size === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {pushing ? 'Pushing...' : `Push to ${selectedUsers.size} Users`}
                  </button>

                  <button
                    onClick={syncAllPrices}
                    disabled={priceSyncing}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${priceSyncing ? 'animate-spin' : ''}`} />
                    {priceSyncing ? 'Syncing...' : 'Sync All Prices'}
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  {selectedCards.size} cards selected • {selectedUsers.size} users selected
                </div>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
