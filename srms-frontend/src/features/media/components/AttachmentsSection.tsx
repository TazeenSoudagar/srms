import React, { useState, useEffect } from 'react'
import { Button } from '../../../components/common/Button'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { useAuth } from '../../../contexts/AuthContext'
import { mediaService } from '../../../services/mediaService'
import type { Media } from '../../../services/mediaService'

interface AttachmentsSectionProps {
  serviceRequestId: string
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ serviceRequestId }) => {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Note: We'll need to get attachments from the service request detail
    // For now, this is a placeholder
    setIsLoading(false)
  }, [serviceRequestId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setError(null)
    try {
      const media = await mediaService.uploadMedia(serviceRequestId, file, file.name)
      setAttachments([...attachments, media])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
      e.target.value = '' // Reset input
    }
  }

  const handleDownload = async (media: Media) => {
    try {
      const blob = await mediaService.getMedia(serviceRequestId, media.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = media.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download file')
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return

    try {
      await mediaService.deleteMedia(serviceRequestId, mediaId)
      setAttachments(attachments.filter((a) => a.id !== mediaId))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete attachment')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
            disabled={isUploading}
          />
          <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {isUploading ? <LoadingSpinner size="sm" /> : 'Upload File'}
          </span>
        </label>
      </div>
      {error && <ErrorMessage message={error} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No attachments yet.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-900">{attachment.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(attachment.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(attachment)}>
                  Download
                </Button>
                {(user?.role.name === 'Admin' || user?.role.name === 'Support Engineer') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
