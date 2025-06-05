"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PlusIcon, UserIcon } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.svg" 
                alt="readon.gr" 
                width={160} 
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/submit">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Post
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <UserIcon className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}