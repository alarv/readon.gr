"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusIcon, UserIcon } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              readon.gr
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
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
          </div>
        </div>
      </div>
    </header>
  )
}