# Authentication Flow

This directory contains the authentication pages for the SRMS customer web app.

## Pages

### `/login` - Phone Number Entry
- User enters their 10-digit Indian mobile number
- Validates phone format (must start with 6-9, exactly 10 digits)
- Sends OTP via backend API
- Auto-navigates to OTP verification page

### `/verify-otp` - OTP Verification
- 6-digit OTP input with auto-focus
- Auto-submit when all digits entered
- 60-second resend timer
- Paste support for OTP
- On successful verification:
  - Stores token in localStorage
  - Updates Auth context
  - Redirects to home page

## Auth Context

Location: `contexts/AuthContext.tsx`

Provides global auth state:
- `user`: Current user object or null
- `isAuthenticated`: Boolean auth status
- `isLoading`: Loading state during initialization
- `login(token, user)`: Set auth state
- `logout()`: Clear auth and redirect to login
- `refreshUser()`: Refresh user data from API

## Protected Routes

Use the `ProtectedRoute` component to wrap pages that require authentication:

```tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MyRequestsPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## Features

- **Passwordless Authentication**: OTP-based login via phone
- **Auto Account Creation**: New users automatically registered
- **Persistent Sessions**: Token stored in localStorage
- **Auto Logout**: Handles 401 errors globally
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Mobile Optimized**: Works seamlessly on mobile devices

## User Flow

1. User visits protected page → Redirected to `/login`
2. User enters phone number → OTP sent
3. User enters OTP → Token received
4. Auth context updated → User logged in
5. Redirected to requested page or home

## Security

- Phone validation on frontend and backend
- OTP expiry (10 minutes default)
- Rate limiting on OTP requests
- Secure token storage
- Auto logout on token expiry (401 errors)
- No password storage (passwordless auth)
