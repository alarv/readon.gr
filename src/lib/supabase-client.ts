import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='))
            .reduce((acc, [name, value]) => {
              if (name && value) {
                acc.push({ name, value: decodeURIComponent(value) })
              }
              return acc
            }, [] as { name: string; value: string }[])
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              path: '/'
            }
            
            let cookieString = `${name}=${encodeURIComponent(value)}`
            
            if (cookieOptions.maxAge) {
              cookieString += `; Max-Age=${cookieOptions.maxAge}`
            }
            if (cookieOptions.domain) {
              cookieString += `; Domain=${cookieOptions.domain}`
            }
            if (cookieOptions.path) {
              cookieString += `; Path=${cookieOptions.path}`
            }
            if (cookieOptions.secure) {
              cookieString += '; Secure'
            }
            if (cookieOptions.sameSite) {
              cookieString += `; SameSite=${cookieOptions.sameSite}`
            }
            
            document.cookie = cookieString
          })
        }
      }
    }
  )
}