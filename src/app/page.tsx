'use client'

import { useState, useEffect } from 'react'
import { PostCard } from "@/components/post/post-card"
import { Post } from "@/lib/types"

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Τελευταίες αναρτήσεις
        </h1>
        
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
