export type ServiceRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  service: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  scheduledAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  address: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequestDto {
  serviceId: string;
  title: string;
  description: string;
  address: string;
  scheduledAt?: string;
}

export interface UpdateServiceRequestDto {
  title?: string;
  description?: string;
  address?: string;
  scheduledAt?: string;
}

export interface CancelServiceRequestDto {
  reason: string;
}

export interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface ServiceRequestFilters {
  status?: ServiceRequestStatus;
  serviceId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'scheduledAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
