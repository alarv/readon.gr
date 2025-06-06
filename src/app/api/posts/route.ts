import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'

// Create a service role client for cached functions (no cookies needed)
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

// Cached function to fetch posts from database with different cache strategies per sort
const getCachedPosts = (sort: string) => {
  const cacheOptions = {
    'new': { tags: ['posts', 'posts-new'], revalidate: 3600 }, // 1 hour for new posts (ordering doesn't change)
    'top': { tags: ['posts', 'posts-top'], revalidate: 3600 }, // 1 hour (we fetch counts separately)
    'hot': { tags: ['posts', 'posts-hot'], revalidate: 1800 }  // 30 min for hot (time-dependent scoring)
  }
  
  return unstable_cache(
    async (sortType: string) => {
      const supabase = getServiceSupabaseClient()
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('is_deleted', false)

      if (sortType === 'new') {
        query = query.order('created_at', { ascending: false })
      } else if (sortType === 'top') {
        query = query.order('upvotes', { ascending: false })
      } else {
        // Hot algorithm: Calculate hot score in the database
        query = query.order('created_at', { ascending: false }) // Fallback for now
      }
      
      const { data: posts, error } = await query.limit(50)
      
      if (error) throw error
      
      // Apply hot algorithm in JavaScript for now (later move to database function)
      if (sortType === 'hot') {
        return posts.map(post => {
          const score = post.upvotes - post.downvotes
          const hoursAge = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
          const commentBoost = Math.log10(Math.max(1, post.comment_count)) * 2
          
          // Hot score formula: (score + comment_boost) / (age_in_hours + 2)^1.5
          const hotScore = (score + commentBoost) / Math.pow(hoursAge + 2, 1.5)
          
          return { ...post, hot_score: hotScore }
        }).sort((a, b) => b.hot_score - a.hot_score)
      }
      
      return posts
    },
    [`posts-${sort}`],
    cacheOptions[sort as keyof typeof cacheOptions] || cacheOptions.hot
  )(sort)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'hot' // hot, new, top
    
    const posts = await getCachedPosts(sort)
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the authorization header and set it for the request
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      // Extract token from Bearer token
      const token = authHeader.replace('Bearer ', '')
      if (token) {
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
      }
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Ensure user profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (!profile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
        })
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
    }
    
    const body = await request.json()
    const { title, content, url, image_url, post_type, community = 'general' } = body
    
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        url,
        image_url,
        post_type,
        author_id: user.id,
        community,
      })
      .select(`
        *,
        author:profiles!posts_author_id_fkey (
          username,
          avatar_url
        )
      `)
      .single()
    
    if (error) throw error
    
    // Invalidate posts cache when new post is created
    revalidateTag('posts')
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}