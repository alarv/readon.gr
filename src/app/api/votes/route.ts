import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id, comment_id, vote_type } = body

    if ((!post_id && !comment_id) || (post_id && comment_id)) {
      return NextResponse.json({ error: 'Must provide either post_id or comment_id' }, { status: 400 })
    }

    const existingVote = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq(post_id ? 'post_id' : 'comment_id', post_id || comment_id)
      .single()

    if (existingVote.data) {
      if (existingVote.data.vote_type === vote_type) {
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.data.id)

        return NextResponse.json({ message: 'Vote removed' })
      } else {
        const { data: vote, error } = await supabase
          .from('votes')
          .update({ vote_type })
          .eq('id', existingVote.data.id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json(vote)
      }
    } else {
      const { data: vote, error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          post_id,
          comment_id,
          vote_type,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(vote, { status: 201 })
    }
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
