"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpIcon, ArrowDownIcon, MessageCircleIcon, ExternalLinkIcon, FlagIcon } from "lucide-react"
import { Post } from "@/lib/types"
import { formatTimeAgo, formatNumber, cn } from "@/lib/utils"
import { ReportModal } from "@/components/moderation/report-modal"
import { votesCache } from "@/lib/votes-cache"
import { countsCache } from "@/lib/counts-cache"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [votingType, setVotingType] = useState<number | null>(null)
  const [userVote, setUserVote] = useState<number | null>(null)
  const [currentUpvotes, setCurrentUpvotes] = useState(post.upvotes)
  const [currentDownvotes, setCurrentDownvotes] = useState(post.downvotes)

  // Initialize user vote from cache and listen for changes
  useEffect(() => {
    const updateVoteFromCache = () => {
      const cachedVote = votesCache.getVote(post.id)
      setUserVote(cachedVote)
    }

    // Initial load
    updateVoteFromCache()

    // Listen for cache changes
    votesCache.addListener(updateVoteFromCache)
  }, [post.id])

  // Initialize vote counts from cache and listen for changes
  useEffect(() => {
    const updateCountsFromCache = () => {
      const cachedCounts = countsCache.getCounts(post.id)
      if (cachedCounts) {
        setCurrentUpvotes(cachedCounts.upvotes)
        setCurrentDownvotes(cachedCounts.downvotes)
      }
    }

    // Initial load
    updateCountsFromCache()

    // Listen for cache changes
    countsCache.addListener(updateCountsFromCache)
  }, [post.id])

  const netScore = currentUpvotes - currentDownvotes

  const handleVote = async (voteType: number) => {
    if (isVoting) return

    setIsVoting(true)
    setVotingType(voteType)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: post.id,
          vote_type: voteType,
        }),
      })

      if (response.ok) {
        // Update local state and cache optimistically
        let newVote: number | null = null
        let newUpvotes = currentUpvotes
        let newDownvotes = currentDownvotes

        if (userVote === voteType) {
          // Removing vote
          newVote = null
          if (voteType === 1) {
            newUpvotes = currentUpvotes - 1
            setCurrentUpvotes(newUpvotes)
          } else {
            newDownvotes = currentDownvotes - 1
            setCurrentDownvotes(newDownvotes)
          }
        } else {
          // Adding or changing vote
          if (userVote !== null) {
            // Remove previous vote
            if (userVote === 1) {
              newUpvotes = currentUpvotes - 1
              setCurrentUpvotes(newUpvotes)
            } else {
              newDownvotes = currentDownvotes - 1
              setCurrentDownvotes(newDownvotes)
            }
          }

          // Add new vote
          newVote = voteType
          if (voteType === 1) {
            newUpvotes = newUpvotes + 1
            setCurrentUpvotes(newUpvotes)
          } else {
            newDownvotes = newDownvotes + 1
            setCurrentDownvotes(newDownvotes)
          }
        }

        setUserVote(newVote)
        votesCache.setVote(post.id, newVote)

        // Update counts cache with new values
        countsCache.setCounts(post.id, {
          upvotes: newUpvotes,
          downvotes: newDownvotes
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
      setVotingType(null)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg hover:border-border/80 transition-colors">
      <div className="flex">
        {/* Vote section */}
        <div className="flex flex-col items-center justify-center p-3 bg-muted min-h-[120px]">
          <button
            onClick={() => handleVote(1)}
            disabled={isVoting}
            className={cn(
              "p-2 hover:bg-muted-foreground/10 rounded transition-colors disabled:opacity-50",
              userVote === 1 ? "text-orange-600 bg-orange-100 dark:bg-orange-900/20" : "text-muted-foreground"
            )}
          >
            {isVoting && votingType === 1 ? (
              <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              <ArrowUpIcon className="h-6 w-6" />
            )}
          </button>
          <span className={cn(
            "text-base font-bold py-2 px-1 min-w-[2rem] text-center",
            netScore > 0 ? "text-orange-600" : netScore < 0 ? "text-blue-600" : "text-muted-foreground"
          )}>
            {formatNumber(netScore)}
          </span>
          <button
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            className={cn(
              "p-2 hover:bg-muted-foreground/10 rounded transition-colors disabled:opacity-50",
              userVote === -1 ? "text-blue-600 bg-blue-100 dark:bg-blue-900/20" : "text-muted-foreground"
            )}
          >
            {isVoting && votingType === -1 ? (
              <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              <ArrowDownIcon className="h-6 w-6" />
            )}
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
            <div className="mb-3">
              <div className="flex items-center text-primary text-sm mb-2">
                <ExternalLinkIcon className="h-4 w-4 mr-1" />
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {new URL(post.url).hostname}
                </a>
              </div>
              {/* TODO: Add link preview here if metadata exists */}
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
