import React, { useState, useRef, useEffect } from 'react'
import { profileService } from '../../../services/profileService'
import { useAuth } from '../../../contexts/AuthContext'
import { Button } from '../../../components/common/Button'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { Toast } from '../../../components/ui/Toast'

interface ProfilePictureUploadProps {
  onSuccess?: () => void
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onSuccess }) => {
  const { user, updateUser } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear states when component mounts/unmounts
  useEffect(() => {
    return () => {
      setError(null)
      setShowToast(false)
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [])

  if (!user) return null

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered')
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', file.name, file.type, file.size)

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      console.error('Invalid file type:', file.type)
      setError('Please select a valid image file (JPG, JPEG, or PNG)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size)
      setError('File size must be less than 5MB')
      return
    }

    console.log('File validation passed, creating preview')
    setError(null)
    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      console.log('Preview URL created')
      setPreviewUrl(reader.result as string)
    }
    reader.onerror = (error) => {
      console.error('FileReader error:', error)
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      console.error('No file selected for upload')
      return
    }

    console.log('Starting upload:', selectedFile.name)
    setIsUploading(true)
    setError(null)

    try {
      console.log('Calling profileService.uploadAvatar')
      const response = await profileService.uploadAvatar(selectedFile)
      console.log('Upload response:', response)

      // Update user in context with new avatar
      const updatedUser = {
        ...user,
        avatar: response.avatar,
      }
      console.log('Updating user with avatar:', updatedUser.avatar)
      updateUser(updatedUser)

      // Clear preview and selected file
      setPreviewUrl(null)
      setSelectedFile(null)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Show success toast
      showNotification('Profile picture updated successfully!', 'success')

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || 'Failed to upload image. Please try again.'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelPreview = () => {
    console.log('Cancelling preview')
    setPreviewUrl(null)
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user.avatar) return

    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await profileService.deleteAvatar()

      // Update user in context without avatar
      updateUser({
        ...user,
        avatar: null,
      })

      // Show success toast
      showNotification('Profile picture deleted successfully!', 'success')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete image. Please try again.'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = () => {
    console.log('Edit button clicked, triggering file input')
    fileInputRef.current?.click()
  }

  // Calculate initials
  const getInitials = () => {
    const firstInitial = user.first_name ? user.first_name.charAt(0).toUpperCase() : ''
    const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : ''
    return firstInitial + lastInitial || user.email.substring(0, 2).toUpperCase()
  }

  const displayUrl = previewUrl || user.avatar?.url
  const displayInitials = getInitials()

  console.log('Render - displayUrl:', displayUrl, 'previewUrl:', previewUrl, 'user.avatar:', user.avatar)

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>

        <div className="flex flex-col items-center space-y-4">
          {/* Avatar with Instagram-style icons */}
          <div className="relative group">
            {/* Large Avatar */}
            <div className="w-40 h-40 rounded-full flex items-center justify-center font-semibold text-white overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600">
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('Image loaded successfully')}
                  onError={(e) => {
                    console.error('Image failed to load:', displayUrl)
                    // Fallback to default avatar if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : null}
              {(!displayUrl || displayUrl === '') && (
                <svg
                  className="w-24 h-24 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>

            {/* Edit Icon (Instagram style) */}
            {!previewUrl && (
              <button
                onClick={handleEditClick}
                disabled={isUploading || isDeleting}
                className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit profile picture"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}

            {/* Delete Icon (Instagram style) - Only show if avatar exists and not in preview mode */}
            {user.avatar && !previewUrl && (
              <button
                onClick={handleDeleteAvatar}
                disabled={isUploading || isDeleting}
                className="absolute top-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete profile picture"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Save/Cancel buttons - Only show when preview is active */}
          {previewUrl && (
            <div className="flex space-x-3 w-full max-w-xs">
              <Button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  'Save Picture'
                )}
              </Button>
              <Button
                type="button"
                onClick={handleCancelPreview}
                disabled={isUploading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Error message */}
          {error && <ErrorMessage message={error} />}

          {/* Help text */}
          <p className="text-xs text-gray-500 text-center">
            Allowed: JPG, JPEG, PNG (max 5MB)
          </p>
        </div>
      </div>
    </>
  )
}
