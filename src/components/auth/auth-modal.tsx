'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username,
          })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {isSignUp ? 'Εγγραφή' : 'Σύνδεση'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Όνομα χρήστη"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
          
          <input
            type="password"
            placeholder="Κωδικός"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Παρακαλώ περιμένετε...' : (isSignUp ? 'Εγγραφή' : 'Σύνδεση')}
          </Button>
        </form>
        
        <p className="mt-4 text-center">
          {isSignUp ? 'Έχετε ήδη λογαριασμό;' : 'Δεν έχετε λογαριασμό;'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-blue-500 hover:underline"
          >
            {isSignUp ? 'Σύνδεση' : 'Εγγραφή'}
          </button>
        </p>
        
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full mt-4"
        >
          Ακύρωση
        </Button>
      </div>
    </div>
  )
}