import api from './api'

export interface Media {
  id: string
  name: string
  url: string
  created_at: string
}

export const mediaService = {
  uploadMedia: async (serviceRequestId: string, file: File, name?: string): Promise<Media> => {
    const formData = new FormData()
    formData.append('file', file)
    if (name) formData.append('name', name)

    const response = await api.post(`/service-requests/${serviceRequestId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  getMedia: async (serviceRequestId: string, mediaId: string): Promise<Blob> => {
    const response = await api.get(`/service-requests/${serviceRequestId}/media/${mediaId}`, {
      responseType: 'blob',
    })
    return response.data
  },

  deleteMedia: async (serviceRequestId: string, mediaId: string): Promise<void> => {
    await api.delete(`/service-requests/${serviceRequestId}/media/${mediaId}`)
  },
}
