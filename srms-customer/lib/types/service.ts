export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: {
    id: string;
    name: string;
  };
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  serviceCount?: number;
}

export interface ServiceFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isPopular?: boolean;
  sortBy?: 'name' | 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
}
