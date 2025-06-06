import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Return empty object for anonymous users
      return NextResponse.json({})
    }
    
    const body = await request.json()
    const { postIds } = body
    
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({})
    }
    
    // Fetch user votes for the given post IDs
    const { data: votes, error } = await supabase
      .from('votes')
      .select('post_id, vote_type')
      .eq('user_id', user.id)
      .in('post_id', postIds)
      .not('post_id', 'is', null)
    
    if (error) {
      console.error('Error fetching user votes:', error)
      return NextResponse.json({ error: 'Failed to fetch user votes' }, { status: 500 })
    }
    
    // Convert to object with post_id as key and vote_type as value
    const voteMap = votes.reduce((acc, vote) => {
      acc[vote.post_id] = vote.vote_type
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json(voteMap)
  } catch (error) {
    console.error('Error in user-votes API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}