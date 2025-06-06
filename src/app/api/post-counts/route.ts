import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role client for reading public vote counts
const getServiceSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { postIds } = body
    
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({})
    }
    
    const supabase = getServiceSupabaseClient()
    
    // Fetch current vote counts for the given post IDs
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, upvotes, downvotes')
      .in('id', postIds)
    
    if (error) {
      console.error('Error fetching post counts:', error)
      return NextResponse.json({ error: 'Failed to fetch post counts' }, { status: 500 })
    }
    
    // Convert to object with post_id as key and counts as value
    const countsMap = posts.reduce((acc, post) => {
      acc[post.id] = {
        upvotes: post.upvotes,
        downvotes: post.downvotes
      }
      return acc
    }, {} as Record<string, { upvotes: number; downvotes: number }>)
    
    return NextResponse.json(countsMap)
  } catch (error) {
    console.error('Error in post-counts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}