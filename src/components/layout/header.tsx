"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/auth-modal"
import { PlusIcon, UserIcon, LogOutIcon } from "lucide-react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ username: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

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
            {user && (
              <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/submit">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Δημιουργία Post
                </Link>
              </Button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{profile?.username}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  Αποσύνδεση
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setIsAuthOpen(true)}>
                <UserIcon className="h-4 w-4 mr-2" />
                Σύνδεση
              </Button>
            )}
            
          </div>
        </div>
      </div>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  )
}