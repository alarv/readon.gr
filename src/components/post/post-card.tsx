"use client"

import Link from "next/link"
import { ArrowUpIcon, ArrowDownIcon, MessageCircleIcon, ExternalLinkIcon } from "lucide-react"
import { Post } from "@/lib/types"
import { formatTimeAgo, formatNumber, cn } from "@/lib/utils"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const netScore = post.upvotes - post.downvotes

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex">
        {/* Vote section */}
        <div className="flex flex-col items-center p-2 bg-gray-50">
          <button className="p-1 hover:bg-gray-200 rounded">
            <ArrowUpIcon className="h-4 w-4 text-gray-600" />
          </button>
          <span className={cn(
            "text-sm font-medium px-1",
            netScore > 0 ? "text-orange-600" : netScore < 0 ? "text-blue-600" : "text-gray-600"
          )}>
            {formatNumber(netScore)}
          </span>
          <button className="p-1 hover:bg-gray-200 rounded">
            <ArrowDownIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1 p-4">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span>r/{post.community}</span>
            <span className="mx-1">•</span>
            <span>Posted by u/{post.author?.username || 'unknown'}</span>
            <span className="mx-1">•</span>
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600">
            <Link href={`/post/${post.id}`}>
              {post.title}
            </Link>
          </h3>

          {post.post_type === 'text' && post.content && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-3">
              {post.content}
            </p>
          )}

          {post.post_type === 'link' && post.url && (
            <div className="flex items-center text-blue-600 text-sm mb-3">
              <ExternalLinkIcon className="h-4 w-4 mr-1" />
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {new URL(post.url).hostname}
              </a>
            </div>
          )}

          {post.post_type === 'image' && post.image_url && (
            <div className="mb-3">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="max-w-full h-auto rounded border"
              />
            </div>
          )}

          <div className="flex items-center space-x-4 text-gray-500 text-sm">
            <Link href={`/post/${post.id}`} className="flex items-center hover:text-gray-700">
              <MessageCircleIcon className="h-4 w-4 mr-1" />
              {post.comment_count} comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}