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
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Fetch or create profile when user changes
  useEffect(() => {
    if (user && !profile) {
      const fetchOrCreateProfile = async () => {
        // First try to fetch existing profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!profile) {
          // Create profile if it doesn't exist
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            })
            .select()
            .single()
          
          if (newProfile) {
            setProfile(newProfile)
          }
        } else {
          setProfile(profile)
        }
      }
      fetchOrCreateProfile()
    }
  }, [user, profile, supabase])

  const handleSignOut = async () => {
    try {
      console.log('Signing out...')
      
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any
      
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Sign out successful')
      }
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      // Always redirect regardless of success/failure
      console.log('Redirecting to home...')
      window.location.href = '/'
    }
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