import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PostCard } from '@/components/post/post-card'

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_author_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <PostCard post={post} />
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Σχόλια</h3>
        <p className="text-gray-500">Τα σχόλια θα προστεθούν σύντομα...</p>
      </div>
    </div>
  )
}