"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpIcon, ArrowDownIcon, MessageCircleIcon, ExternalLinkIcon, FlagIcon } from "lucide-react"
import { Post } from "@/lib/types"
import { formatTimeAgo, formatNumber, cn } from "@/lib/utils"
import { ReportModal } from "@/components/moderation/report-modal"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const netScore = post.upvotes - post.downvotes

  return (
    <div className="bg-card border border-border rounded-lg hover:border-border/80 transition-colors">
      <div className="flex">
        {/* Vote section */}
        <div className="flex flex-col items-center p-2 bg-muted">
          <button className="p-1 hover:bg-muted-foreground/10 rounded">
            <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className={cn(
            "text-sm font-medium px-1",
            netScore > 0 ? "text-orange-600" : netScore < 0 ? "text-blue-600" : "text-muted-foreground"
          )}>
            {formatNumber(netScore)}
          </span>
          <button className="p-1 hover:bg-muted-foreground/10 rounded">
            <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1 p-4">
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Link href={`/c/${post.community}`} className="hover:text-primary">
              c/{post.community}
            </Link>
            <span className="mx-1">•</span>
            <span>Posted by u/{post.author?.username || 'unknown'}</span>
            <span className="mx-1">•</span>
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>

          <h3 className="text-lg font-medium text-card-foreground mb-2 hover:text-primary">
            <Link href={`/post/${post.id}`}>
              {post.title}
            </Link>
          </h3>

          {post.post_type === 'text' && post.content && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
              {post.content}
            </p>
          )}

          {post.post_type === 'link' && post.url && (
            <div className="flex items-center text-primary text-sm mb-3">
              <ExternalLinkIcon className="h-4 w-4 mr-1" />
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {new URL(post.url).hostname}
              </a>
            </div>
          )}

          {post.post_type === 'image' && post.image_url && (
            <div className="mb-3">
              <Image 
                src={post.image_url} 
                alt={post.title}
                width={600}
                height={400}
                className="max-w-full h-auto rounded border border-border"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-muted-foreground text-sm">
              <Link href={`/post/${post.id}`} className="flex items-center hover:text-card-foreground">
                <MessageCircleIcon className="h-4 w-4 mr-1" />
                {post.comment_count} comments
              </Link>
            </div>
            
            <button 
              onClick={() => setShowReportModal(true)}
              className="flex items-center text-muted-foreground hover:text-red-500 text-sm p-1 rounded"
              title="Αναφορά"
            >
              <FlagIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post.id}
      />
    </div>
  )
}