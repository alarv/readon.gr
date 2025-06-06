import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: string): string {
  const now = new Date()
  const posted = new Date(date)
  const diffMs = now.getTime() - posted.getTime()
  
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  
  if (seconds < 60) {
    return 'τώρα'
  } else if (minutes < 60) {
    return `${minutes}λ πριν`
  } else if (hours < 24) {
    return `${hours}ω πριν`
  } else if (days < 30) {
    return `${days}μ πριν`
  } else {
    return `${months}μήν πριν`
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}