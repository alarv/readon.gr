import { PostCard } from "@/components/post/post-card"
import { Post } from "@/lib/types"

// Mock data for development
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Καλώς ήρθατε στο readon.gr!",
    content: "Αυτό είναι το πρώτο post στην ελληνική Reddit κοινότητα. Ελπίζουμε να απολαύσετε την εμπειρία!",
    post_type: "text",
    author_id: "user1",
    community: "general",
    upvotes: 42,
    downvotes: 3,
    comment_count: 15,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    is_moderated: false,
    author: {
      id: "user1",
      username: "admin",
      display_name: "Administrator",
      karma: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: "2", 
    title: "Τι γνώμη έχετε για την τεχνολογία blockchain στην Ελλάδα;",
    content: "Πρόσφατα διάβασα ότι αρκετές ελληνικές εταιρείες αρχίζουν να ενσωματώνουν blockchain στις διαδικασίες τους. Τι πιστεύετε για αυτή την εξέλιξη;",
    post_type: "text",
    author_id: "user2",
    community: "technology",
    upvotes: 28,
    downvotes: 8,
    comment_count: 22,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    is_moderated: false,
    author: {
      id: "user2",
      username: "tech_enthusiast",
      display_name: "Tech Enthusiast",
      karma: 245,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: "3",
    title: "Ενδιαφέρον άρθρο για την ελληνική startup σκηνή",
    url: "https://example.com/greek-startups",
    post_type: "link",
    author_id: "user3",
    community: "business",
    upvotes: 67,
    downvotes: 12,
    comment_count: 8,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    is_moderated: false,
    author: {
      id: "user3",
      username: "entrepreneur",
      display_name: "Greek Entrepreneur",
      karma: 892,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Τελευταίες αναρτήσεις
        </h1>
        
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
