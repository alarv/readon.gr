import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        profiles!posts_author_id_fkey (
          username,
          avatar_url
        )
      `)
      .single()
    
    if (error) throw error
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}