'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, Plus } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SkeletonLoader from '@/components/SkeletonLoader'
import PageTransition from '@/components/PageTransition'
import { useNotification } from '@/contexts/NotificationContext'

interface PokemonCard {
  id: string
  name: string
  set: string
  setId: string
  number: string
  rarity: string
  imageUrl: string
  marketPrice: number
  lowPrice: number
  midPrice: number
  highPrice: number
  lastUpdated: string
  language: 'en' | 'ja'
}

interface PokemonSet {
  id: string
  name: string
  series: string
  total: number
  releaseDate: string
  symbolUrl: string
  logoUrl: string
  language: 'en' | 'ja'
}

export default function PokemonTCGJpPage() {
  const { showSuccess, showError } = useNotification()
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [sets, setSets] = useState<PokemonSet[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSet, setSelectedSet] = useState('')
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)

  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch('/api/pokemon-tcg/sets?language=ja')

      if (response.ok) {
        const data = await response.json()
        setSets(data.sets)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.warn('Failed to load Pokemon sets:', errorData.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      showError('Network error. Please check your connection and refresh the page.')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const searchCards = async (query: string, setFilter?: string) => {
    setSearching(true)
    try {
      const params = new URLSearchParams({
        language: 'ja',
        page: '1',
        pageSize: '50'
      })

      if (query.trim()) {
        params.set('q', query)
      }

      if (setFilter) {
        params.set('setId', setFilter)
      }

      const response = await fetch(`/api/pokemon-tcg/search?${params}`)

      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to search cards'
        showError(errorMessage)
      }
    } catch (error) {
      console.error('Error searching cards:', error)
      showError('Network error. Please check your connection and try again.')
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

  const selectAllCards = () => {
    if (selectedCards.size === cards.length) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(cards.map(card => card.id)))
    }
  }

  const addSelectedCardsToCatalog = async () => {
    if (selectedCards.size === 0) {
      showError('Please select at least one card')
      return
    }

    setAdding(true)
    try {
      const results = {
        successful: [] as string[],
        failed: [] as { card: string; error: string }[]
      }

      for (const cardId of selectedCards) {
        const card = cards.find(c => c.id === cardId)
        if (!card) continue

        try {
          const response = await fetch('/api/pokemon-tcg/add-to-catalog', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pokemonCardId: cardId,
              language: 'ja'
            })
          })

          if (response.ok) {
            results.successful.push(card.name)
          } else {
            const error = await response.json()
            results.failed.push({
              card: card.name,
              error: error.error || 'Failed to add card'
            })
          }
        } catch (error) {
          results.failed.push({
            card: card.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Show results
      if (results.successful.length > 0) {
        showSuccess(`Successfully added ${results.successful.length} cards to catalog`)
      }
      if (results.failed.length > 0) {
        showError(`Failed to add ${results.failed.length} cards. Check console for details.`)
        console.error('Failed additions:', results.failed)
      }

      // Clear selections
      setSelectedCards(new Set())
    } catch (error) {
      console.error('Error adding cards to catalog:', error)
      showError('Failed to add cards to catalog')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentPage="pokemon-tcg-jp" />
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
      <Sidebar currentPage="pokemon-tcg-jp" />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
          <PageTransition>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Pokemon TCG (Japanese)</h1>
              <p className="mt-2 text-gray-600">
                Search Japanese Pokemon cards and add them to the catalog
              </p>
            </div>

            {/* Search Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Search Japanese Pokemon Cards</h2>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search for Japanese Pokemon cards (optional)..."
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
                    disabled={searching || (!searchQuery.trim() && !selectedSet)}
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

            {/* Action Buttons */}
            {cards.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <button
                      onClick={addSelectedCardsToCatalog}
                      disabled={adding || selectedCards.size === 0}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {adding ? 'Adding...' : `Add ${selectedCards.size} Cards to Catalog`}
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    {selectedCards.size} cards selected
                  </div>
                </div>
              </div>
            )}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
