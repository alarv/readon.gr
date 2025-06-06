import { notFound } from 'next/navigation'
import { COMMUNITIES, getCommunityDisplayName } from '@/lib/communities'

interface CommunityPageProps {
  params: Promise<{
    community: string
  }>
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { community } = await params
  
  if (!COMMUNITIES[community as keyof typeof COMMUNITIES]) {
    notFound()
  }

  const communityName = getCommunityDisplayName(community)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">c/{community}</h1>
        <p className="text-gray-600 dark:text-gray-400">{communityName}</p>
      </div>
      
      <div className="space-y-4">
        <p className="text-center text-gray-500 py-8">
          Τα posts για την κοινότητα {communityName} θα εμφανιστούν εδώ.
        </p>
      </div>
    </div>
  )
}