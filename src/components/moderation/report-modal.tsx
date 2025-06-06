'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreateReportData } from '@/lib/types'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  postId?: string
  commentId?: string
}

const REPORT_REASONS = {
  spam: 'Spam / Ανεπιθύμητο περιεχόμενο',
  harassment: 'Παρενόχληση / Εκφοβισμός',
  inappropriate: 'Ακατάλληλο περιεχόμενο',
  misinformation: 'Παραπληροφόρηση',
  other: 'Άλλος λόγος'
} as const

export function ReportModal({ isOpen, onClose, postId, commentId }: ReportModalProps) {
  const [reason, setReason] = useState<keyof typeof REPORT_REASONS>('spam')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Πρέπει να συνδεθείτε για να κάνετε αναφορά')
        setLoading(false)
        return
      }

      const reportData: CreateReportData = {
        reason,
        description: description.trim() || undefined,
      }

      if (postId) {
        reportData.post_id = postId
      } else if (commentId) {
        reportData.comment_id = commentId
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Αποτυχία αναφοράς')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setReason('spam')
        setDescription('')
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Παρουσιάστηκε σφάλμα')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError('')
      setSuccess(false)
      setReason('spam')
      setDescription('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Αναφορά Περιεχομένου</DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="py-6 text-center">
            <div className="text-green-600 dark:text-green-400 mb-2">✓</div>
            <p className="text-green-600 dark:text-green-400">
              Η αναφορά σας υποβλήθηκε επιτυχώς
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Λόγος αναφοράς *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as keyof typeof REPORT_REASONS)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
              >
                {Object.entries(REPORT_REASONS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Περιγραφή (προαιρετικό)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Προσθέστε περισσότερες λεπτομέρειες..."
                rows={3}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 resize-vertical"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Υποβολή...' : 'Υποβολή Αναφοράς'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Ακύρωση
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}