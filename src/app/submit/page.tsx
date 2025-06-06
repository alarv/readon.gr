import { PostForm } from '@/components/post/post-form'

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Δημιουργία Νέου Post</h1>
      <PostForm />
    </div>
  )
}