# API Integration

This directory contains the API client configuration and service layer for interacting with the SRMS backend.

## Structure

```
lib/api/
├── client.ts       # Axios instance with interceptors
├── auth.ts         # Authentication API methods
├── services.ts     # Services and categories API
├── requests.ts     # Service requests, comments, media API
├── profile.ts      # User profile API
└── index.ts        # Barrel exports
```

## Setup

1. Ensure your `.env.local` has the correct API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

2. The API client will automatically:
   - Add authentication token to requests
   - Handle 401 errors (redirect to login)
   - Show toast notifications for errors
   - Handle validation errors (422)

## Usage Examples

### Authentication

```typescript
import { authApi } from '@/lib/api';

// Send OTP
const sendOtp = async (phone: string) => {
  try {
    const response = await authApi.sendOtp({ phone });
    console.log(response.data.message);
  } catch (error) {
    // Error toast shown automatically
  }
};

// Verify OTP
const verifyOtp = async (phone: string, otp: string) => {
  try {
    const response = await authApi.verifyOtp({ phone, otp });
    // Token and user automatically stored in localStorage
    const { token, user } = response.data;
    // Redirect to dashboard
  } catch (error) {
    // Error toast shown automatically
  }
};

// Logout
const logout = async () => {
  await authApi.logout();
  // Token and user automatically removed from localStorage
};
```

### Services

```typescript
import { servicesApi, categoriesApi } from '@/lib/api';

// Get all services
const services = await servicesApi.getAll();

// Get services with filters
const filteredServices = await servicesApi.getAll({
  categoryId: 'cat123',
  search: 'plumbing',
  minPrice: 500,
  maxPrice: 2000,
  sortBy: 'price',
  sortOrder: 'asc'
});

// Get paginated services
const paginatedServices = await servicesApi.getPaginated(1, 12, {
  isPopular: true
});

// Get service by ID
const service = await servicesApi.getById('service123');

// Get featured services
const featured = await servicesApi.getFeatured(6);

// Search services
const searchResults = await servicesApi.search('cleaning');

// Get all categories
const categories = await categoriesApi.getAll();

// Get category services
const categoryServices = await categoriesApi.getServices('cat123');
```

### Service Requests

```typescript
import { serviceRequestsApi, commentsApi, mediaApi } from '@/lib/api';

// Create service request
const createRequest = async () => {
  const newRequest = await serviceRequestsApi.create({
    serviceId: 'service123',
    title: 'Plumbing Issue',
    description: 'Leaking tap in bathroom',
    address: '123 Main St, Bangalore',
    scheduledAt: '2024-02-01T10:00:00Z'
  });
};

// Get all requests
const requests = await serviceRequestsApi.getAll();

// Get requests with filters
const filteredRequests = await serviceRequestsApi.getAll({
  status: 'pending',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Get paginated requests
const paginatedRequests = await serviceRequestsApi.getPaginated(1, 10, {
  status: 'in_progress'
});

// Get request by ID
const request = await serviceRequestsApi.getById('request123');

// Update request
const updatedRequest = await serviceRequestsApi.update('request123', {
  description: 'Updated description',
  scheduledAt: '2024-02-02T14:00:00Z'
});

// Cancel request
const cancelledRequest = await serviceRequestsApi.cancel('request123', {
  reason: 'Changed my mind'
});

// Delete request
await serviceRequestsApi.delete('request123');

// Add comment
const comment = await commentsApi.create('request123', {
  content: 'When will the technician arrive?'
});

// Upload media
const file = document.querySelector('input[type="file"]').files[0];
const media = await mediaApi.upload('request123', file);
```

### User Profile

```typescript
import { profileApi } from '@/lib/api';

// Get profile
const profile = await profileApi.getProfile();

// Update profile
const updatedProfile = await profileApi.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  address: '456 New Street, Bangalore'
});

// Upload avatar
const file = document.querySelector('input[type="file"]').files[0];
const userWithAvatar = await profileApi.uploadAvatar(file);

// Delete avatar
const userWithoutAvatar = await profileApi.deleteAvatar();
```

## Error Handling

The API client automatically handles common errors:

- **401 Unauthorized**: Clears token, shows error toast, redirects to login
- **403 Forbidden**: Shows permission error toast
- **404 Not Found**: Shows not found error toast
- **422 Validation Error**: Shows validation error toast (first error message)
- **500 Server Error**: Shows generic error toast
- **Network Error**: Shows network error toast

For custom error handling:

```typescript
try {
  await serviceRequestsApi.create(data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Access error response
    console.log(error.response?.status);
    console.log(error.response?.data);
  }
}
```

## TypeScript Types

All API methods have proper TypeScript types. Import types from `@/lib/types`:

```typescript
import type {
  User,
  Service,
  ServiceRequest,
  CreateServiceRequestDto
} from '@/lib/types';
```

## Authentication Flow

1. User enters phone number
2. Call `authApi.sendOtp({ phone })`
3. User receives OTP via SMS
4. User enters OTP
5. Call `authApi.verifyOtp({ phone, otp })`
6. Token and user stored in localStorage automatically
7. All subsequent API calls include the token in headers
8. On 401 error, user is automatically logged out and redirected

## LocalStorage

The API layer manages these localStorage items:

- `auth_token`: Bearer token for authentication
- `user`: Serialized user object

These are automatically set on login and cleared on logout/401 errors.
