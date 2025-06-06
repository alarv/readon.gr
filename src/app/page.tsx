'use client'

import { useState, useEffect } from 'react'
import { PostCard } from "@/components/post/post-card"
import { Post } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { votesCache, initVotesCache } from "@/lib/votes-cache"
import { countsCache, initCountsCache } from "@/lib/counts-cache"
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot')
  const supabase = createClient()

  // Initialize caches when user auth state changes
  useEffect(() => {
    const initCache = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      initVotesCache(user?.id || null)
      initCountsCache()
    }
    
    initCache()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initVotesCache(session?.user?.id || null)
      initCountsCache()
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/posts?sort=${sortBy}`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
          
          // Fetch votes for all posts in background
          const postIds = data.map((post: Post) => post.id)
          if (postIds.length > 0) {
            // Small delay to ensure cache is initialized
            setTimeout(() => {
              // Fetch missing votes
              const missingVoteIds = votesCache.getMissingPostIds(postIds)
              if (missingVoteIds.length > 0) {
                console.log('Fetching votes for missing IDs:', missingVoteIds.length)
                votesCache.fetchVotes(missingVoteIds)
              }
              
              // Fetch missing counts
              const missingCountIds = countsCache.getMissingPostIds(postIds)
              if (missingCountIds.length > 0) {
                console.log('Fetching counts for missing IDs:', missingCountIds.length)
                countsCache.fetchCounts(missingCountIds)
              }
            }, 100)
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [sortBy])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Τελευταίες αναρτήσεις
          </h1>
          <p>Φόρτωση...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            Αναρτήσεις
          </h1>
          
          <div className="flex space-x-2">
            <Button
              variant={sortBy === 'hot' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('hot')}
            >
              🔥 Trending
            </Button>
            <Button
              variant={sortBy === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('new')}
            >
              🆕 Νέα
            </Button>
            <Button
              variant={sortBy === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('top')}
            >
              ⭐ Top
            </Button>
          </div>
        </div>
        
        {posts.length === 0 ? (
          <p className="text-muted-foreground">Δεν υπάρχουν αναρτήσεις ακόμα.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  )
}
