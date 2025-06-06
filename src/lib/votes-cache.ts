import React from 'react'

// Client-side vote caching for better performance
interface VoteCache {
  [postId: string]: number // -1 for downvote, 1 for upvote
}

interface VoteCacheWithTimestamp {
  votes: VoteCache
  timestamp: number
  userId?: string
}

const CACHE_KEY = 'readon_user_votes'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

class VotesCache {
  private cache: VoteCache = {}
  private userId: string | null = null
  private listeners: Set<() => void> = new Set()

  // Initialize cache from localStorage
  init(userId: string | null) {
    this.userId = userId
    
    if (!userId) {
      this.cache = {}
      console.log('VotesCache: No user, clearing cache')
      return
    }

    if (typeof window === 'undefined') return

    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const data: VoteCacheWithTimestamp = JSON.parse(cached)
        
        // Check if cache is for same user and not expired
        if (
          data.userId === userId && 
          Date.now() - data.timestamp < CACHE_DURATION
        ) {
          this.cache = data.votes
          console.log('VotesCache: Loaded from localStorage', Object.keys(this.cache).length, 'votes')
        } else {
          // Clear expired or different user cache
          localStorage.removeItem(CACHE_KEY)
          this.cache = {}
          console.log('VotesCache: Cleared expired/different user cache')
        }
      } else {
        console.log('VotesCache: No cached data found')
      }
    } catch (error) {
      console.error('Error loading votes cache:', error)
      this.cache = {}
    }
  }

  // Get vote for a post
  getVote(postId: string): number | null {
    return this.cache[postId] || null
  }

  // Set vote for a post
  setVote(postId: string, voteType: number | null) {
    if (voteType === null) {
      delete this.cache[postId]
    } else {
      this.cache[postId] = voteType
    }
    this.saveToStorage()
    this.notifyListeners()
  }

  // Bulk update votes
  updateVotes(votes: VoteCache) {
    this.cache = { ...this.cache, ...votes }
    this.saveToStorage()
    this.notifyListeners()
  }

  // Add listener for cache changes
  addListener(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Notify all listeners of cache changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  // Fetch votes for multiple posts
  async fetchVotes(postIds: string[]): Promise<void> {
    if (!this.userId || postIds.length === 0) {
      console.log('VotesCache: Skip fetching - no user or empty postIds')
      return
    }

    console.log('VotesCache: Fetching votes for', postIds.length, 'posts')
    try {
      const response = await fetch('/api/user-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postIds }),
      })

      if (response.ok) {
        const votes = await response.json()
        console.log('VotesCache: Received votes:', Object.keys(votes).length)
        this.updateVotes(votes)
      } else {
        console.error('VotesCache: Failed to fetch votes', response.status)
      }
    } catch (error) {
      console.error('Error fetching votes:', error)
    }
  }

  // Get missing post IDs that need to be fetched
  getMissingPostIds(postIds: string[]): string[] {
    return postIds.filter(id => !(id in this.cache))
  }

  // Clear cache
  clear() {
    this.cache = {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
  }

  // Save to localStorage
  private saveToStorage() {
    if (typeof window === 'undefined' || !this.userId) return

    try {
      const data: VoteCacheWithTimestamp = {
        votes: this.cache,
        timestamp: Date.now(),
        userId: this.userId,
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving votes cache:', error)
    }
  }
}

// Export singleton instance
export const votesCache = new VotesCache()

// Hook for React components
export function useVotesCache(postIds: string[]) {
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const missingIds = votesCache.getMissingPostIds(postIds)
    if (missingIds.length > 0) {
      setLoading(true)
      votesCache.fetchVotes(missingIds).finally(() => {
        setLoading(false)
      })
    }
  }, [postIds])

  return {
    getVote: (postId: string) => votesCache.getVote(postId),
    setVote: (postId: string, voteType: number | null) => votesCache.setVote(postId, voteType),
    loading,
  }
}

// Initialize cache (call this when user auth state changes)
export function initVotesCache(userId: string | null) {
  votesCache.init(userId)
}