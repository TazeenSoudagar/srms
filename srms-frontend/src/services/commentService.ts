import api from './api'

export interface Comment {
  id: string
  body: string
  user: {
    id: string
    name: string
    email: string
  }
  created_at: string
  updated_at: string
}

export const commentService = {
  getComments: async (serviceRequestId: string): Promise<Comment[]> => {
    const response = await api.get(`/service-requests/${serviceRequestId}/comments`)
    return response.data.data
  },

  createComment: async (serviceRequestId: string, body: string): Promise<Comment> => {
    const response = await api.post(`/service-requests/${serviceRequestId}/comments`, { body })
    return response.data.data
  },

  updateComment: async (
    serviceRequestId: string,
    commentId: string,
    body: string
  ): Promise<Comment> => {
    const response = await api.put(
      `/service-requests/${serviceRequestId}/comments/${commentId}`,
      { body }
    )
    return response.data.data
  },

  deleteComment: async (serviceRequestId: string, commentId: string): Promise<void> => {
    await api.delete(`/service-requests/${serviceRequestId}/comments/${commentId}`)
  },
}
