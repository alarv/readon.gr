'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { CreatePostData } from '@/lib/types'

interface LinkPreview {
  siteName: string;
  description: string;
  image: string, title: string
}

export function PostForm() {
  const [postType, setPostType] = useState<'text' | 'link' | 'image'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [community, setCommunity] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const fetchPreview = async (url: string) => {
    if (!url.trim()) {
      setLinkPreview(null)
      return
    }

    try {
      new URL(url) // Validate URL
    } catch {
      return // Invalid URL, don't fetch preview
    }

    setLoadingPreview(true)
    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const metadata = await response.json()
        setLinkPreview(metadata)

        // Auto-fill title if empty
        if (!title.trim() && metadata.title) {
          setTitle(metadata.title)
        }
      }
    } catch (error) {
      console.error('Error fetching preview:', error)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload image')
    }

    const data = await response.json()
    return data.url
  }

  // Debounced effect for URL preview
  useEffect(() => {
    if (postType === 'link' && url.trim()) {
      const timer = setTimeout(async () => {
        await fetchPreview(url)
      }, 1000) // 1 second delay

      return () => clearTimeout(timer)
    } else {
      setLinkPreview(null)
    }
  }, [url, postType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Πρέπει να συνδεθείτε για να δημιουργήσετε post')
        setLoading(false)
        return
      }

      console.log('Creating post for user:', user.id)
      console.log('User session:', user)

      // Validate required fields
      if (!title.trim()) {
        setError('Ο τίτλος είναι υποχρεωτικός')
        setLoading(false)
        return
      }

      if (postType === 'text' && !content.trim()) {
        setError('Το περιεχόμενο είναι υποχρεωτικό για text posts')
        setLoading(false)
        return
      }

      if (postType === 'link' && !url.trim()) {
        setError('Το URL είναι υποχρεωτικό για link posts')
        setLoading(false)
        return
      }

      if (postType === 'image' && !imageUrl.trim() && !selectedFile) {
        setError('Είναι υποχρεωτικό να επιλέξετε εικόνα ή να εισάγετε URL εικόνας')
        setLoading(false)
        return
      }

      const postData: CreatePostData = {
        title: title.trim(),
        post_type: postType,
        community: community,
      }

      if (postType === 'text') {
        postData.content = content.trim()
      } else if (postType === 'link') {
        postData.url = url.trim()
      } else if (postType === 'image') {
        let finalImageUrl = imageUrl.trim()

        // If user selected a file, upload it first
        if (selectedFile) {
          setUploadingImage(true)
          try {
            finalImageUrl = await uploadImage(selectedFile)
          } catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : 'Αποτυχία μεταφόρτωσης εικόνας')
            setLoading(false)
            setUploadingImage(false)
            return
          }
          setUploadingImage(false)
        }

        postData.image_url = finalImageUrl
      }

      console.log('Sending post data:', postData)

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      // Get the current session for the API call
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session)

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(postData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Αποτυχία δημιουργίας post')
      }

      const createdPost = await response.json()
      console.log('Created post:', createdPost)

      // Redirect to the created post
      router.push(`/post/${createdPost.id}`)
      router.refresh()
    } catch (error) {
      console.error('Post creation error:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Η αίτηση έλαβε timeout. Παρακαλώ δοκιμάστε ξανά.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Παρουσιάστηκε σφάλμα')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Τύπος Post</label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setPostType('text')}
              className={`px-4 py-2 rounded ${
                postType === 'text'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Κείμενο
            </button>
            <button
              type="button"
              onClick={() => setPostType('link')}
              className={`px-4 py-2 rounded ${
                postType === 'link'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => setPostType('image')}
              className={`px-4 py-2 rounded ${
                postType === 'image'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Εικόνα
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Τίτλος *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Εισάγετε τον τίτλο του post..."
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Community */}
        <div>
          <label htmlFor="community" className="block text-sm font-medium mb-2">
            Κοινότητα
          </label>
          <select
            id="community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="general">c/general - Γενικά</option>
            <option value="technologia">c/technologia - Τεχνολογία</option>
            <option value="politiki">c/politiki - Πολιτική</option>
            <option value="athlitika">c/athlitika - Αθλητικά</option>
            <option value="psichagogia">c/psichagogia - Ψυχαγωγία</option>
            <option value="oikonomia">c/oikonomia - Οικονομία</option>
            <option value="ekpaideysi">c/ekpaideysi - Εκπαίδευση</option>
            <option value="ygeia">c/ygeia - Υγεία</option>
            <option value="koinonia">c/koinonia - Κοινωνία</option>
            <option value="epistimi">c/epistimi - Επιστήμη</option>
          </select>
        </div>

        {/* Content based on post type */}
        {postType === 'text' && (
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Περιεχόμενο *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Γράψτε το περιεχόμενο του post..."
              rows={8}
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              required
            />
          </div>
        )}

        {postType === 'link' && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              URL *
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            {/* Loading indicator */}
            {loadingPreview && (
              <div className="mt-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Φόρτωση προεπισκόπησης...</span>
                </div>
              </div>
            )}

            {/* Link preview */}
            {linkPreview && !loadingPreview && (
              <div className="mt-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <div className="flex space-x-3">
                  {linkPreview.image && (
                    <img
                      src={linkPreview.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                      {linkPreview.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {linkPreview.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {linkPreview.siteName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {postType === 'image' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Μεταφόρτωση Εικόνας
              </label>
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Υποστηριζόμενοι τύποι: JPEG, PNG, GIF, WebP. Μέγιστο μέγεθος: 5MB
              </p>
            </div>

            {imagePreview && (
              <div className="border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                <p className="text-sm font-medium mb-2">Προεπισκόπηση:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded border"
                />
              </div>
            )}

            <div className="text-center text-gray-500">
              <span>ή</span>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
                URL Εικόνας
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={loading || uploadingImage}
            className="flex-1"
          >
            {uploadingImage ? 'Μεταφόρτωση εικόνας...' : loading ? 'Δημιουργία...' : 'Δημιουργία Post'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Ακύρωση
          </Button>
        </div>
      </form>
    </div>
  )
}
