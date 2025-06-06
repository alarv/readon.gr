import React from 'react'

// Client-side vote counts caching for better performance
interface PostCounts {
  upvotes: number
  downvotes: number
}

interface CountsCache {
  [postId: string]: PostCounts
}

interface CountsCacheWithTimestamp {
  counts: CountsCache
  timestamp: number
}

const CACHE_KEY = 'readon_post_counts'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes (shorter than posts cache)

class PostCountsCache {
  private cache: CountsCache = {}
  private listeners: Set<() => void> = new Set()

  // Initialize cache from localStorage
  init() {
    if (typeof window === 'undefined') return

    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const data: CountsCacheWithTimestamp = JSON.parse(cached)
        
        // Check if cache is not expired
        if (Date.now() - data.timestamp < CACHE_DURATION) {
          this.cache = data.counts
          console.log('CountsCache: Loaded from localStorage', Object.keys(this.cache).length, 'counts')
        } else {
          // Clear expired cache
          localStorage.removeItem(CACHE_KEY)
          this.cache = {}
          console.log('CountsCache: Cleared expired cache')
        }
      } else {
        console.log('CountsCache: No cached data found')
      }
    } catch (error) {
      console.error('Error loading counts cache:', error)
      this.cache = {}
    }
  }

  // Get counts for a post
  getCounts(postId: string): PostCounts | null {
    return this.cache[postId] || null
  }

  // Set counts for a post
  setCounts(postId: string, counts: PostCounts) {
    this.cache[postId] = counts
    this.saveToStorage()
    this.notifyListeners()
  }

  // Bulk update counts
  updateCounts(counts: CountsCache) {
    this.cache = { ...this.cache, ...counts }
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

  // Fetch counts for multiple posts
  async fetchCounts(postIds: string[]): Promise<void> {
    if (postIds.length === 0) {
      console.log('CountsCache: Skip fetching - empty postIds')
      return
    }

    console.log('CountsCache: Fetching counts for', postIds.length, 'posts')
    try {
      const response = await fetch('/api/post-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postIds }),
      })

      if (response.ok) {
        const counts = await response.json()
        console.log('CountsCache: Received counts:', Object.keys(counts).length)
        this.updateCounts(counts)
      } else {
        console.error('CountsCache: Failed to fetch counts', response.status)
      }
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  // Get missing post IDs that need to be fetched
  getMissingPostIds(postIds: string[]): string[] {
    return postIds.filter(id => !(id in this.cache))
  }

  // Save to localStorage
  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      const data: CountsCacheWithTimestamp = {
        counts: this.cache,
        timestamp: Date.now(),
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving counts cache:', error)
    }
  }
}

// Export singleton instance
export const countsCache = new PostCountsCache()

// Initialize cache (call this on app start)
export function initCountsCache() {
  countsCache.init()
}