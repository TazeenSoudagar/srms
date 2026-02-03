import React, { useState, useEffect } from 'react'
import { Button } from '../../../components/common/Button'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { ErrorMessage } from '../../../components/ui/ErrorMessage'
import { useAuth } from '../../../contexts/AuthContext'
import { commentService } from '../../../services/commentService'
import type { Comment } from '../../../services/commentService'

interface CommentsSectionProps {
  serviceRequestId: string
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ serviceRequestId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchComments()
  }, [serviceRequestId])

  const fetchComments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await commentService.getComments(serviceRequestId)
      setComments(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    setError(null)
    try {
      const comment = await commentService.createComment(serviceRequestId, newComment)
      setComments([comment, ...comments])
      setNewComment('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await commentService.deleteComment(serviceRequestId, commentId)
      setComments(comments.filter((c) => c.id !== commentId))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete comment')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
      {error && <ErrorMessage message={error} />}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : 'Add Comment'}
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.user.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                </div>
                {(user?.id === comment.user.id || user?.role.name === 'Admin') && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
