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
    const { post_id, comment_id, reason, description } = body
    
    if (!post_id && !comment_id) {
      return NextResponse.json({ error: 'Must provide either post_id or comment_id' }, { status: 400 })
    }
    
    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
    }
    
    // Check if user already reported this item
    const existingReport = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq(post_id ? 'post_id' : 'comment_id', post_id || comment_id)
      .single()
    
    if (existingReport.data) {
      return NextResponse.json({ error: 'Έχετε ήδη αναφέρει αυτό το περιεχόμενο' }, { status: 400 })
    }
    
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        post_id,
        comment_id,
        reason,
        description,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}