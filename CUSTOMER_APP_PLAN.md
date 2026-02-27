# SRMS Customer Web Application - Implementation Plan

## 1. Executive Summary

### Objective
Build a modern, customer-facing web application for SRMS (Service Request Management System) where clients can browse services, make service requests, and track their submissions - similar to Urban Company, Urban Service Plaza, and Housejoy.

### Approach
**Separate Application Architecture** - Create a standalone Next.js 15 customer app (`srms-customer`) that consumes the existing Laravel backend API, maintaining clear separation from the management dashboard (`srms-frontend`).

---

## 2. Design Analysis & Inspiration

### Urban Company Design Insights
Based on analysis of urbancompany.com:

**Visual Design:**
- Clean, minimalist interface with ample white space
- Card-based service browsing with clear imagery
- Service cards show: image, title, rating (4.8+), pricing, and "Instant" badges
- Organized by categories: "Most booked", "New and noteworthy", "Offers & discounts"
- Horizontal scrollable service rows with "See all" CTAs

**Color Scheme (Non-AI Palette):**
Urban Company uses a sophisticated, trust-building palette:
- Primary: Deep purple/indigo (#6C3EC5 - professional, premium)
- Accent: Warm orange (#FF6B35 - action, energy)
- Success: Teal green (#00A896 - trust, completion)
- Background: Warm off-white (#FAFAFA)
- Text: Charcoal (#2D3748)

**Navigation Pattern:**
- Sticky header with location selector
- Category grid on homepage (2-3 columns on mobile, 4-6 on desktop)
- Bottom navigation on mobile
- Breadcrumb navigation for deep pages

**Key Features Observed:**
- Location-based service availability
- Instant booking badges
- Rating display with star icons
- Discount badges (percentage off)
- Service bundles/packages
- "Most booked" social proof

### Our Unique Design Direction

**Color Palette (Distinctive & Modern):**
```css
/* Primary - Deep Teal (trustworthy, calm, professional) */
--primary-50: #F0FDFA;
--primary-500: #14B8A6;
--primary-600: #0D9488;
--primary-700: #0F766E;

/* Accent - Warm Coral (friendly, approachable) */
--accent-400: #FB923C;
--accent-500: #F97316;

/* Neutral - Slate (modern, clean) */
--neutral-50: #F8FAFC;
--neutral-100: #F1F5F9;
--neutral-600: #475569;
--neutral-900: #0F172A;

/* Success - Emerald */
--success-500: #10B981;

/* Warning - Amber */
--warning-500: #F59E0B;
```

**Typography System:**
- Headings: Inter (clean, modern, excellent readability)
- Body: Inter
- Monospace (for codes): JetBrains Mono

**Design Principles:**
1. **Minimalist** - Focus on content, avoid clutter
2. **Trustworthy** - Professional colors, clear information
3. **Accessible** - WCAG AA compliant, semantic HTML
4. **Fast** - Optimized images, lazy loading, minimal animations
5. **Responsive** - Mobile-first, seamless cross-device

---

## 3. Tech Stack

### Frontend Framework
**Next.js 15** with App Router
- **Why Next.js over React+Vite:**
  - SEO crucial for service discovery (Google search visibility)
  - Server-Side Rendering (SSR) for initial page load
  - Static Site Generation (SSG) for service catalog pages
  - Built-in Image optimization
  - Better performance (Core Web Vitals)
  - API routes for middleware/BFF pattern if needed

### Core Technologies
```json
{
  "framework": "Next.js 15.1.11",
  "react": "^19.0.0",
  "typescript": "^5.9.3",
  "styling": "Tailwind CSS 4.1.18",
  "forms": "react-hook-form ^7.71.1 + zod ^4.3.5",
  "http": "axios ^1.13.2",
  "state": "zustand ^5.0.2 (lightweight, modern)",
  "routing": "Next.js App Router (built-in)",
  "icons": "lucide-react ^0.563.0",
  "date": "date-fns ^4.1.0",
  "toast": "sonner ^1.7.1 (modern, accessible)",
  "carousel": "embla-carousel-react ^8.5.1",
  "realtime": "pusher-js ^8.4.0 + laravel-echo ^2.3.0"
}
```

### Development Tools
```json
{
  "testing": "Playwright (E2E, already available via MCP)",
  "linting": "ESLint + Prettier",
  "typecheck": "TypeScript strict mode",
  "build": "Next.js turbopack"
}
```

---

## 4. Project Structure

```
srms-customer/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group - Auth layouts
│   │   ├── login/
│   │   └── verify-otp/
│   ├── (customer)/               # Route group - Customer layouts
│   │   ├── layout.tsx            # Customer layout with header/footer
│   │   ├── page.tsx              # Homepage
│   │   ├── services/
│   │   │   ├── page.tsx          # Services catalog
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Service detail page
│   │   ├── my-requests/
│   │   │   ├── page.tsx          # My service requests list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Request detail & tracking
│   │   ├── profile/
│   │   │   ├── page.tsx          # Profile view/edit
│   │   │   └── settings/
│   │   │       └── page.tsx      # Account settings
│   │   └── checkout/
│   │       └── [serviceId]/
│   │           └── page.tsx      # Service request creation flow
│   ├── api/                      # API routes (if needed for BFF pattern)
│   │   └── webhook/              # Handle backend webhooks
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + Tailwind
│   └── not-found.tsx             # 404 page
│
├── components/
│   ├── common/                   # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Rating.tsx
│   │   ├── PriceDisplay.tsx
│   │   └── Avatar.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── Container.tsx
│   ├── ui/                       # UI feedback components
│   │   ├── Loading.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── EmptyState.tsx
│   └── features/                 # Feature-specific components
│       ├── services/
│       │   ├── ServiceCard.tsx
│       │   ├── ServiceGrid.tsx
│       │   ├── ServiceCarousel.tsx
│       │   ├── ServiceDetail.tsx
│       │   └── CategoryFilter.tsx
│       ├── requests/
│       │   ├── RequestCard.tsx
│       │   ├── RequestTimeline.tsx
│       │   ├── RequestStatusBadge.tsx
│       │   └── RequestComments.tsx
│       └── checkout/
│           ├── ServiceRequestForm.tsx
│           ├── CheckoutSummary.tsx
│           └── ScheduleSelector.tsx
│
├── lib/
│   ├── api/                      # API client & services
│   │   ├── client.ts             # Axios instance
│   │   ├── services.ts           # Services API
│   │   ├── requests.ts           # Service requests API
│   │   ├── auth.ts               # Authentication API
│   │   └── profile.ts            # User profile API
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useServices.ts
│   │   ├── useRequests.ts
│   │   └── useWebSocket.ts
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts
│   │   └── cartStore.ts          # For multi-service checkout (future)
│   ├── utils/                    # Utility functions
│   │   ├── format.ts             # Date, price formatting
│   │   ├── validation.ts         # Zod schemas
│   │   └── cn.ts                 # Class name utility
│   └── types/                    # TypeScript types
│       ├── service.ts
│       ├── request.ts
│       └── user.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── .env.local                    # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. MVP Features (Phase 1)

### 5.1 Public Pages (No Auth Required)

#### Homepage
**Purpose:** Service discovery and conversion
**Components:**
- Hero section with search bar and popular service categories
- Featured services carousel
- Category grid (6-8 main categories)
- "How it works" section (3-step process)
- Trust indicators (ratings, customer count, professional count)
- Footer with links

**Key Elements:**
```typescript
// Hero Section
- Large heading: "Professional Services at Your Doorstep"
- Search bar: "What service are you looking for?"
- Location selector (future: auto-detect)
- Popular category pills (Cleaning, Plumbing, Electrical, etc.)

// Featured Services
- Horizontal scrollable carousel
- Service cards with:
  - Service image
  - Service name
  - Starting price
  - Rating (if available)
  - "Book Now" CTA

// Category Grid
- 2 columns on mobile, 4 on desktop
- Icon + Category name
- On click: Navigate to filtered services page

// How It Works
1. Browse Services
2. Book Your Service
3. Get It Done

// Trust Section
- "10,000+ Happy Customers"
- "500+ Verified Professionals"
- "4.8 Average Rating"
```

#### Services Catalog Page (`/services`)
**Purpose:** Browse and filter all available services
**Components:**
- Category filter sidebar (desktop) / bottom sheet (mobile)
- Service grid with cards
- Search functionality
- Sorting options (Popular, Price: Low-High, Rating)
- Pagination or infinite scroll

**Service Card Design:**
```typescript
interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
}

// Card Elements:
- Image (16:9 aspect ratio)
- Service name (truncate at 2 lines)
- Short description (truncate at 3 lines)
- Price: "Starting at ₹{basePrice}"
- Rating: ⭐ 4.8 (120 reviews)
- "View Details" button
```

#### Service Detail Page (`/services/[id]`)
**Purpose:** Detailed service information and booking CTA
**Components:**
- Service image gallery (if multiple images available)
- Service name and description
- Pricing details
- "What's included" section
- FAQ section (future)
- "Book This Service" CTA
- Related services (future)

**Layout:**
```typescript
// Desktop: 2-column layout
Left (60%):
- Image gallery
- Description
- What's included
- FAQs

Right (40%):
- Sticky card with:
  - Price
  - "Book Now" button
  - Service details summary
  - Trust badges

// Mobile: Single column
- Image gallery (swipeable)
- Sticky bottom bar with price + "Book Now"
```

### 5.2 Authenticated Pages (Login Required)

#### Login/OTP Flow (`/login`, `/verify-otp`)
**Flow:**
1. User enters phone number or email
2. Backend sends OTP
3. User enters OTP
4. Backend verifies and returns token
5. Store token + redirect to intended page

**Components:**
```typescript
// LoginForm
- Phone/Email input
- "Send OTP" button
- Switch between phone/email
- Loading state

// OTPVerificationForm
- 6-digit OTP input (individual boxes)
- "Verify" button
- "Resend OTP" link (with countdown)
- Auto-submit on 6 digits entered
```

#### Checkout/Service Request Creation (`/checkout/[serviceId]`)
**Purpose:** Create service request for selected service
**Components:**
- Service summary card (sticky on desktop)
- Service request form
- Schedule selector (date + time slot)
- Additional notes textarea
- File upload (optional, for reference images)
- Submit button

**Form Fields:**
```typescript
interface ServiceRequestForm {
  serviceId: string;
  title: string;              // Auto-filled: "{Service Name} Request"
  description: string;         // User's detailed requirements
  scheduledDate?: string;      // ISO date
  scheduledTime?: string;      // Time slot
  address: string;             // Service location
  contactPhone: string;        // Pre-filled from profile
  attachments?: File[];        // Optional images
}

// Validation (Zod):
- title: min 5 chars
- description: min 20 chars
- address: required
- phone: valid phone format
```

**Schedule Selector (Phase 2 WebSocket Integration):**
- Calendar view for date selection
- Time slots display (based on availability)
- Real-time slot updates via WebSocket
- "Flexible timing" option

#### My Requests Page (`/my-requests`)
**Purpose:** View all user's service requests
**Components:**
- Filter tabs (All, Pending, In Progress, Completed, Cancelled)
- Request cards list
- Empty state when no requests
- Pull-to-refresh (mobile)

**Request Card:**
```typescript
interface RequestCard {
  id: string;
  serviceId: string;
  serviceName: string;
  status: RequestStatus;
  createdAt: string;
  scheduledDate?: string;
  assignedEngineer?: {
    name: string;
    avatar?: string;
  };
}

// Card Elements:
- Status badge (top-right)
- Service name
- Request title
- Created date
- Scheduled date (if available)
- Assigned engineer info (if assigned)
- "View Details" button
```

#### Request Detail Page (`/my-requests/[id]`)
**Purpose:** Track request progress and communicate
**Components:**
- Request header (service name, status, created date)
- Status timeline/tracker
- Request details section
- Assigned engineer info (if assigned)
- Comments section (chat-like interface)
- Attachments section
- Action buttons (Cancel request, Contact support)

**Status Timeline:**
```typescript
// Visual timeline (vertical on mobile, horizontal on desktop)
Steps:
1. Submitted ✓ (with timestamp)
2. Under Review (current/pending)
3. Assigned (pending)
4. In Progress (pending)
5. Completed (pending)

// Highlight current step
// Show completion timestamps for completed steps
```

**Comments Section:**
```typescript
// Chat-style interface
- User comments (right-aligned, teal background)
- Engineer comments (left-aligned, gray background)
- Support comments (centered, blue background)
- Timestamp below each comment
- "Add comment" input at bottom
- File attachment option
- Real-time updates via WebSocket (Phase 2)
```

#### Profile Page (`/profile`)
**Purpose:** View and edit user profile
**Components:**
- Profile avatar (upload capability)
- Personal information form
- Contact information
- Logout button

**Form Fields:**
```typescript
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
}
```

---

## 6. Design System Specifications

### 6.1 Color System

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',  // Main primary
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          400: '#FB923C',
          500: '#F97316',  // Main accent
          600: '#EA580C',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',  // Main text
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
    },
  },
};
```

### 6.2 Typography

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: theme('colors.neutral.600');
}

h1 { @apply text-4xl md:text-5xl font-bold text-neutral-900 leading-tight; }
h2 { @apply text-3xl md:text-4xl font-bold text-neutral-900; }
h3 { @apply text-2xl md:text-3xl font-semibold text-neutral-900; }
h4 { @apply text-xl md:text-2xl font-semibold text-neutral-800; }
h5 { @apply text-lg md:text-xl font-medium text-neutral-800; }
h6 { @apply text-base md:text-lg font-medium text-neutral-700; }
```

### 6.3 Component Styles

#### Button Variants
```typescript
// components/common/Button.tsx
const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
  accent: 'bg-accent-500 text-white hover:bg-accent-600',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

// Base styles
const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
```

#### Card Styles
```typescript
// components/common/Card.tsx
const variants = {
  default: 'bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow',
  elevated: 'bg-white shadow-lg',
  outlined: 'bg-white border-2 border-neutral-300',
};

const baseStyles = 'rounded-xl overflow-hidden';
```

#### Input Styles
```typescript
// components/common/Input.tsx
const baseStyles = `
  w-full px-4 py-2.5
  bg-white border border-neutral-300 rounded-lg
  text-neutral-900 placeholder:text-neutral-400
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
  disabled:bg-neutral-100 disabled:cursor-not-allowed
  transition-colors
`;

const errorStyles = 'border-red-500 focus:ring-red-500';
```

### 6.4 Spacing & Layout

```typescript
// Consistent spacing scale
const spacing = {
  section: 'py-16 md:py-24',        // Section padding
  container: 'px-4 md:px-6 lg:px-8', // Container padding
  cardPadding: 'p-6',                 // Card internal padding
  gap: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },
};

// Grid systems
const grids = {
  services: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
  categories: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4',
  twoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
};
```

### 6.5 Animations

```css
/* globals.css */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
```

---

## 7. API Integration

### 7.1 Backend Endpoints (Existing Laravel API)

```typescript
// Base URL: http://localhost:8000/api

// Authentication
POST   /auth/send-otp          // Send OTP to phone/email
POST   /auth/verify-otp        // Verify OTP and get token

// Services (Public)
GET    /services               // List all active services
GET    /services/:id           // Get service details

// Service Requests (Authenticated)
GET    /service-requests       // List user's requests (filtered by user_id)
POST   /service-requests       // Create new request
GET    /service-requests/:id   // Get request details
PUT    /service-requests/:id   // Update request (limited fields for client)
DELETE /service-requests/:id   // Cancel request

// Comments (Authenticated)
GET    /service-requests/:id/comments  // Get request comments
POST   /service-requests/:id/comments  // Add comment

// Media/Attachments (Authenticated)
POST   /service-requests/:id/media     // Upload attachment
DELETE /media/:id                       // Delete attachment

// User Profile (Authenticated)
GET    /profile                         // Get current user profile
PUT    /profile                         // Update profile
POST   /profile/avatar                  // Upload avatar
```

### 7.2 API Client Configuration

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 7.3 API Service Layer

```typescript
// lib/api/services.ts
export const servicesApi = {
  getAll: async (params?: { search?: string; category?: string }) => {
    const response = await apiClient.get('/services', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },
};

// lib/api/requests.ts
export const requestsApi = {
  getAll: async (params?: { status?: string }) => {
    const response = await apiClient.get('/service-requests', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/service-requests/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceRequestDto) => {
    const response = await apiClient.post('/service-requests', data);
    return response.data;
  },

  update: async (id: string, data: UpdateServiceRequestDto) => {
    const response = await apiClient.put(`/service-requests/${id}`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.delete(`/service-requests/${id}`);
    return response.data;
  },

  addComment: async (id: string, content: string) => {
    const response = await apiClient.post(`/service-requests/${id}/comments`, {
      content,
    });
    return response.data;
  },
};

// lib/api/auth.ts
export const authApi = {
  sendOtp: async (identifier: string, type: 'phone' | 'email') => {
    const response = await apiClient.post('/auth/send-otp', {
      [type]: identifier,
    });
    return response.data;
  },

  verifyOtp: async (identifier: string, otp: string, type: 'phone' | 'email') => {
    const response = await apiClient.post('/auth/verify-otp', {
      [type]: identifier,
      otp,
    });
    return response.data;
  },
};
```

---

## 8. State Management

### 8.1 Zustand Store - Authentication

```typescript
// lib/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: {
    id: string;
    name: string;
  };
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 8.2 Custom Hooks

```typescript
// lib/hooks/useAuth.ts
export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    login: setAuth,
    logout,
    updateUser,
  };
};

// lib/hooks/useServices.ts
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/lib/api/services';

export const useServices = (params?: { search?: string; category?: string }) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesApi.getAll(params),
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
};

// lib/hooks/useRequests.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '@/lib/api/requests';

export const useRequests = (params?: { status?: string }) => {
  return useQuery({
    queryKey: ['requests', params],
    queryFn: () => requestsApi.getAll(params),
  });
};

export const useRequest = (id: string) => {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => requestsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};
```

---

## 9. WebSocket Integration (Phase 2)

### 9.1 Real-time Features

**Use Cases:**
1. **Request Status Updates** - Notify user when request status changes
2. **New Comments** - Real-time chat with support/engineer
3. **Schedule Availability** - Live slot updates during checkout
4. **Assignment Notifications** - Alert when engineer is assigned

### 9.2 Implementation (Using Existing Laravel Echo Setup)

```typescript
// lib/hooks/useWebSocket.ts
import { useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo: Echo | null = null;

export const useWebSocket = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    // Initialize Echo (only once)
    if (!echo) {
      echo = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
        forceTLS: true,
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        },
      });
    }

    return () => {
      // Cleanup on unmount
      if (echo) {
        echo.disconnect();
        echo = null;
      }
    };
  }, [userId]);

  return echo;
};

// Usage in components
export const useRequestUpdates = (requestId: string) => {
  const { user } = useAuth();
  const echo = useWebSocket(user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!echo || !requestId) return;

    // Listen for request updates
    const channel = echo.private(`service-request.${requestId}`);

    channel.listen('ServiceRequestUpdated', (event: any) => {
      // Invalidate and refetch request data
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });

      // Show toast notification
      toast.info(`Request status updated to: ${event.status}`);
    });

    channel.listen('NewComment', (event: any) => {
      // Invalidate comments
      queryClient.invalidateQueries({ queryKey: ['request', requestId, 'comments'] });

      // Show notification
      toast.info(`New comment from ${event.userName}`);
    });

    return () => {
      echo.leave(`service-request.${requestId}`);
    };
  }, [echo, requestId]);
};
```

---

## 10. SEO & Performance Optimization

### 10.1 Next.js Metadata

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'SRMS - Professional Home Services',
    template: '%s | SRMS',
  },
  description: 'Book professional home services - cleaning, plumbing, electrical, and more. Trusted professionals at your doorstep.',
  keywords: ['home services', 'plumber', 'electrician', 'cleaning', 'repair'],
  authors: [{ name: 'SRMS Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://srms.example.com',
    siteName: 'SRMS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SRMS - Professional Home Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SRMS - Professional Home Services',
    description: 'Book trusted professionals for all your home service needs',
    images: ['/twitter-image.jpg'],
  },
};

// app/services/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await servicesApi.getById(params.id);

  return {
    title: service.name,
    description: service.description,
    openGraph: {
      title: service.name,
      description: service.description,
      images: [service.image],
    },
  };
}
```

### 10.2 Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/services/plumbing.jpg"
  alt="Plumbing services"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### 10.3 Route Optimization

```typescript
// Static Generation for service catalog
export async function generateStaticParams() {
  const services = await servicesApi.getAll();

  return services.map((service) => ({
    id: service.id,
  }));
}

// Revalidate every hour
export const revalidate = 3600;
```

---

## 11. Testing Strategy

### 11.1 E2E Testing with Playwright (Via MCP)

```typescript
// tests/e2e/service-booking.spec.ts

// Test: Browse services and create request
test('Customer can browse services and create service request', async () => {
  // 1. Navigate to homepage
  await page.goto('/');

  // 2. Browse services
  await page.click('text=View All Services');
  await expect(page).toHaveURL('/services');

  // 3. Select a service
  await page.click('[data-testid="service-card-plumbing"]');
  await expect(page).toHaveURL(/\/services\/\w+/);

  // 4. Click "Book Now" - should redirect to login if not authenticated
  await page.click('text=Book Now');
  await expect(page).toHaveURL('/login');

  // 5. Login with OTP
  await page.fill('[name="phone"]', '9876543210');
  await page.click('text=Send OTP');

  // Wait for OTP (in test, we can mock or use test OTP)
  await page.fill('[name="otp"]', '123456');
  await page.click('text=Verify');

  // 6. Should redirect back to service detail
  await expect(page).toHaveURL(/\/services\/\w+/);

  // 7. Click "Book Now" again
  await page.click('text=Book Now');
  await expect(page).toHaveURL(/\/checkout\/\w+/);

  // 8. Fill request form
  await page.fill('[name="description"]', 'Need urgent plumbing repair for kitchen sink leak');
  await page.fill('[name="address"]', '123 Test Street, Bangalore');

  // 9. Submit request
  await page.click('text=Submit Request');

  // 10. Should redirect to request detail page
  await expect(page).toHaveURL(/\/my-requests\/\w+/);
  await expect(page.locator('text=Request submitted successfully')).toBeVisible();
});

// Test: View request status and add comment
test('Customer can track request and add comments', async () => {
  // Login first (setup)
  await loginAsCustomer(page);

  // Navigate to My Requests
  await page.goto('/my-requests');

  // Click on a request
  await page.click('[data-testid="request-card"]:first-child');

  // Verify request detail page
  await expect(page.locator('[data-testid="request-status"]')).toBeVisible();

  // Add a comment
  await page.fill('[name="comment"]', 'When will the engineer arrive?');
  await page.click('text=Send');

  // Verify comment appears
  await expect(page.locator('text=When will the engineer arrive?')).toBeVisible();
});
```

### 11.2 Component Testing

```typescript
// components/features/services/ServiceCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';

describe('ServiceCard', () => {
  const mockService = {
    id: '1',
    name: 'Plumbing Service',
    description: 'Professional plumbing repairs',
    image: '/services/plumbing.jpg',
    basePrice: 299,
    rating: 4.8,
    reviewCount: 120,
    isActive: true,
  };

  it('renders service information correctly', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('Plumbing Service')).toBeInTheDocument();
    expect(screen.getByText(/Professional plumbing/)).toBeInTheDocument();
    expect(screen.getByText(/Starting at ₹299/)).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('shows "View Details" button', () => {
    render(<ServiceCard service={mockService} />);

    const button = screen.getByRole('button', { name: /view details/i });
    expect(button).toBeInTheDocument();
  });
});
```

---

## 12. Deployment & DevOps

### 12.1 Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Pusher (WebSocket)
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_APP_CLUSTER=ap2

# Analytics (future)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# .env.production
NEXT_PUBLIC_API_URL=https://api.srms.example.com/api
NEXT_PUBLIC_APP_URL=https://srms.example.com
```

### 12.2 Build & Deploy

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test:e2e": "playwright test",
    "test:component": "jest"
  }
}
```

### 12.3 Deployment Options

**Option 1: Vercel (Recommended for Next.js)**
- Automatic deployments from Git
- Edge network CDN
- Serverless functions
- Zero configuration

**Option 2: Docker + VPS**
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 13. Implementation Phases

### Phase 1: Foundation & Core Features (Week 1-2)
**Deliverables:**
- [ ] Project setup (Next.js 15, Tailwind, TypeScript)
- [ ] Design system implementation (colors, typography, components)
- [ ] API client configuration
- [ ] Authentication flow (OTP login/verification)
- [ ] Homepage with hero + category grid
- [ ] Services catalog page
- [ ] Service detail page
- [ ] Basic responsive layout (Header, Footer, Mobile Nav)

**Priority:** HIGH
**Testing:** Manual testing + basic Playwright flows

### Phase 2: Service Request Flow (Week 3)
**Deliverables:**
- [ ] Checkout page (service request creation form)
- [ ] My Requests page (list view)
- [ ] Request detail page (tracking + timeline)
- [ ] Comments section (basic, no real-time yet)
- [ ] File upload for attachments
- [ ] Profile page

**Priority:** HIGH
**Testing:** E2E tests for complete booking flow

### Phase 3: WebSocket Integration (Week 4)
**Deliverables:**
- [ ] Real-time request status updates
- [ ] Real-time comment notifications
- [ ] Schedule availability (live slot updates)
- [ ] Push notifications setup

**Priority:** MEDIUM
**Testing:** WebSocket connection tests

### Phase 4: Polish & Optimization (Week 5)
**Deliverables:**
- [ ] SEO optimization (metadata, sitemap, robots.txt)
- [ ] Performance optimization (image optimization, lazy loading)
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Mobile responsiveness refinement
- [ ] Error boundary implementation
- [ ] Loading states and skeleton screens
- [ ] Empty states design

**Priority:** MEDIUM
**Testing:** Lighthouse audits, accessibility testing

### Phase 5: Advanced Features (Future)
**Deferred for later:**
- [ ] Service ratings & reviews
- [ ] Service packages/bundles
- [ ] Multi-service checkout (cart)
- [ ] Payment integration
- [ ] Location-based service filtering
- [ ] Professional profiles
- [ ] Service recommendations
- [ ] Promotional offers/coupons
- [ ] Referral system
- [ ] FAQ section per service
- [ ] Live chat support

---

## 14. Success Metrics

### Technical Metrics
- **Performance:**
  - First Contentful Paint (FCP) < 1.5s
  - Largest Contentful Paint (LCP) < 2.5s
  - Time to Interactive (TTI) < 3.5s
  - Lighthouse score > 90

- **SEO:**
  - Core Web Vitals: All green
  - Mobile-friendly test: Pass
  - Structured data: Implemented

- **Accessibility:**
  - WCAG AA compliance: 100%
  - Keyboard navigation: Fully supported
  - Screen reader compatible: Yes

### User Metrics
- **Conversion:**
  - Service view to request creation: > 10%
  - Login completion rate: > 80%
  - Request submission success rate: > 95%

- **Engagement:**
  - Average session duration: > 3 minutes
  - Pages per session: > 3
  - Bounce rate: < 40%

---

## 15. Risk Mitigation

### Identified Risks

1. **Backend API Compatibility**
   - **Risk:** Existing Laravel API may not have all required endpoints
   - **Mitigation:** Review API documentation, communicate with backend team, create additional endpoints if needed

2. **Mobile Performance**
   - **Risk:** Large images and animations may slow down mobile experience
   - **Mitigation:** Use Next.js Image optimization, lazy loading, Lighthouse audits

3. **Real-time Features Complexity**
   - **Risk:** WebSocket integration may introduce bugs and complexity
   - **Mitigation:** Implement in Phase 3 after core features are stable, thorough testing

4. **SEO for Dynamic Content**
   - **Risk:** Client-side routing may hurt SEO
   - **Mitigation:** Use Next.js SSR/SSG, proper metadata, sitemap generation

5. **Browser Compatibility**
   - **Risk:** Modern features may not work on older browsers
   - **Mitigation:** Use polyfills, test on major browsers (Chrome, Safari, Firefox, Edge)

---

## 16. Developer Handoff Checklist

### Before Starting Development

- [ ] Review and approve this plan
- [ ] Clarify any design questions
- [ ] Confirm backend API endpoints are ready
- [ ] Set up development environment
- [ ] Create Git repository (`srms-customer`)
- [ ] Set up project scaffolding (Next.js 15)
- [ ] Install dependencies
- [ ] Configure ESLint + Prettier
- [ ] Set up environment variables
- [ ] Create initial component library (Button, Input, Card)
- [ ] Set up Playwright for E2E testing

### During Development

- [ ] Follow component structure guidelines
- [ ] Implement mobile-first responsive design
- [ ] Write TypeScript types for all data structures
- [ ] Use Zod for form validation
- [ ] Implement proper error handling
- [ ] Add loading states for async operations
- [ ] Test on mobile devices (real or emulated)
- [ ] Write E2E tests for critical flows
- [ ] Commit code frequently with meaningful messages
- [ ] Request code reviews for major features

### Before Launch

- [ ] Complete all Phase 1 & 2 features
- [ ] Run full E2E test suite
- [ ] Lighthouse audit (score > 90)
- [ ] Accessibility audit (WCAG AA)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Load testing (simulate traffic)
- [ ] Security audit (XSS, CSRF protection)
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Create deployment pipeline
- [ ] Write deployment documentation

---

## 17. Next Steps

1. **Review & Approval**
   - Review this plan with stakeholders
   - Clarify any questions or concerns
   - Get approval to proceed

2. **Design Mockups (Optional)**
   - Create Figma designs for key pages
   - Get design approval before development
   - OR proceed with development using this spec

3. **Project Setup**
   - Initialize Next.js 15 project
   - Set up folder structure
   - Install dependencies
   - Configure Tailwind CSS 4

4. **Start Phase 1 Development**
   - Implement design system
   - Build common components
   - Create homepage
   - Implement authentication flow

---

## 18. Questions & Clarifications Needed

Before starting implementation, please confirm:

1. **Backend API:**
   - Are all required endpoints documented and ready?
   - Is Hashids being used for all IDs in API responses?
   - Are file uploads handled via Laravel Media Library?

2. **Design Preferences:**
   - Any specific brand colors or logo to incorporate?
   - Preference for service card design (vertical vs horizontal)?
   - Image aspect ratios for service images?

3. **Business Logic:**
   - Should users be able to book multiple services at once (cart)?
   - Is scheduling mandatory or optional for service requests?
   - Can users cancel requests after submission? (seems yes from plan)
   - Are there service availability restrictions (time, location)?

4. **Payment:**
   - Is payment integration in scope for MVP? (assumed NO based on plan)
   - If yes, which payment gateway? (Razorpay, Stripe, etc.)

5. **Content:**
   - Will service images be provided, or should we use placeholders?
   - Will service descriptions be written by business team?
   - Any sample data/seeders available for testing?

---

## Appendix A: Tech Stack Comparison

### Why Next.js 15 over React + Vite?

| Feature | Next.js 15 | React + Vite |
|---------|------------|--------------|
| **SEO** | ✅ Built-in SSR/SSG | ⚠️ Requires complex setup |
| **Performance** | ✅ Automatic optimization | ⚠️ Manual optimization |
| **Routing** | ✅ File-based routing | ❌ Manual setup |
| **Image Optimization** | ✅ Built-in | ❌ Manual |
| **API Routes** | ✅ Built-in | ❌ Requires separate server |
| **Build Time** | ⚠️ Slower (worth it for features) | ✅ Faster |
| **Learning Curve** | ⚠️ Steeper | ✅ Simpler |
| **Deployment** | ✅ Vercel one-click | ⚠️ More configuration |

**Verdict:** Next.js 15 is the clear winner for a customer-facing, SEO-critical application.

---

## Appendix B: Color Palette Reference

```css
/* Teal-Coral Palette (Distinctive & Modern) */

/* Primary (Teal) - Trust, Professionalism, Calm */
--color-primary-50: #F0FDFA;
--color-primary-100: #CCFBF1;
--color-primary-200: #99F6E4;
--color-primary-300: #5EEAD4;
--color-primary-400: #2DD4BF;
--color-primary-500: #14B8A6;  /* Main */
--color-primary-600: #0D9488;
--color-primary-700: #0F766E;
--color-primary-800: #115E59;
--color-primary-900: #134E4A;

/* Accent (Coral) - Energy, Friendliness, Action */
--color-accent-50: #FFF7ED;
--color-accent-100: #FFEDD5;
--color-accent-200: #FED7AA;
--color-accent-300: #FDBA74;
--color-accent-400: #FB923C;
--color-accent-500: #F97316;  /* Main */
--color-accent-600: #EA580C;
--color-accent-700: #C2410C;

/* Neutral (Slate) - Modern, Clean */
--color-neutral-50: #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;  /* Main text */
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;
--color-neutral-900: #0F172A;

/* Semantic Colors */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;
```

---

## Appendix C: Component Library Preview

### Button Component
```typescript
<Button variant="primary" size="lg">Book Now</Button>
<Button variant="secondary" size="md">Learn More</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost">View All</Button>
```

### Service Card Component
```typescript
<ServiceCard
  service={{
    id: '1',
    name: 'Plumbing Repair',
    description: 'Professional plumbing services for all your needs',
    image: '/services/plumbing.jpg',
    basePrice: 299,
    rating: 4.8,
    reviewCount: 120,
  }}
  onClick={() => router.push('/services/1')}
/>
```

### Request Status Badge
```typescript
<StatusBadge status="pending" />       // Yellow
<StatusBadge status="in_progress" />   // Blue
<StatusBadge status="completed" />     // Green
<StatusBadge status="cancelled" />     // Red
```

---

**END OF PLAN**

Total Pages: 35+
Last Updated: 2026-02-27
Version: 1.0
