# Authentication Implementation Guide

## Overview
This document outlines the complete authentication system implemented for the YDOL Environmental Project frontend.

## Backend Endpoints

The frontend connects to the following backend authentication endpoints (Base URL: `http://localhost:8080/api`):

### 1. POST `/api/auth/login`
**Login user with email and password**
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object with token and user details

### 2. POST `/api/auth/register`
**Register new user**
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+237655143266",
    "city": "Yaoundé",
    "district": "Bastos",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Response:** User object with token

### 3. POST `/api/auth/forgot-password`
**Request password reset link**
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:** Success message, email sent to user

### 4. POST `/api/auth/reset-password`
**Reset password with token from email**
- **Request Body:**
  ```json
  {
    "token": "reset-token-from-email",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }
  ```
- **Response:** Success message

## Frontend Implementation

### 1. Authentication Service (`src/services/auth.js`)
Central authentication service handling all auth operations:

```javascript
import { auth } from "@/services/auth";

// Login
const result = await auth.login(email, password);

// Register
const result = await auth.register(userData);

// Forgot Password
const result = await auth.forgotPassword(email);

// Reset Password
const result = await auth.resetPassword(token, newPassword, confirmPassword);

// Logout
auth.logout();

// Check authentication
const isAuth = auth.isAuthenticated();
const user = auth.getCurrentUser();
const token = auth.getToken();
```

### 2. Auth Pages

#### Login Page (`/connexion`)
- Email and password fields
- Remember me checkbox
- Link to forgot password
- Automatic redirect based on user role:
  - ADMIN/SUPER_ADMIN → `/admin/dashboard`
  - CLIENT → `/client/dashboard`
  - DRIVER → `/driver/dashboard`

#### Register Page (`/inscription`)
- User information fields (name, email, phone, city, district)
- Password validation (minimum 6 characters)
- Automatic login after successful registration
- Role-based redirects

#### Forgot Password Page (`/forgot-password`)
- Email input
- Sends reset link to user email

#### Reset Password Page (`/reset-password`)
- Accessed via email link with token query parameter
- Password reset form
- Auto-redirect to login after success

### 3. Authentication Hooks (`src/hooks/useAuth.js`)

#### useAuth Hook
Manages global authentication state:

```javascript
const { user, isLoading, isAuthenticated, login, logout, register } = useAuth();
```

#### useProtectedRoute Hook
Protects routes and redirects unauthorized users:

```javascript
const { user, isLoading, isAuthenticated } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
```

### 4. Middleware (`middleware.js`)
- Protects admin/client/driver routes
- Redirects unauthenticated users to login
- Stores redirect path for post-login navigation

## Token Management

Tokens are stored in localStorage:
- **token**: JWT authentication token
- **user**: User object JSON

Each API request includes the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Usage Examples

### Protecting a Page
```javascript
"use client";
import { useProtectedRoute } from "@/hooks/useAuth";

export default function AdminPage() {
  const { user, isLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user?.firstName}</h1>
    </div>
  );
}
```

### Using Auth Service
```javascript
const result = await auth.login(email, password);

if (result.success) {
  // User logged in successfully
  const user = result.data;
  router.push("/admin/dashboard");
} else {
  // Handle error
  console.error(result.error);
}
```

### Making Authenticated API Requests
```javascript
const headers = auth.getAuthHeaders(); // Returns headers with Bearer token

const response = await fetch(`${BASE_URL}/endpoint`, {
  method: 'GET',
  headers: headers
});
```

## API Request Flow

1. User enters credentials on login page
2. Frontend calls `auth.login(email, password)`
3. auth.js sends POST request to `/api/auth/login`
4. Backend validates credentials and returns token + user data
5. Frontend stores token and user in localStorage
6. User is redirected to appropriate dashboard
7. For subsequent requests, token is included in Authorization header

## Security Considerations

- ✅ Passwords validated on both client and server
- ✅ Minimum 6 character password requirement
- ✅ Tokens stored securely (localStorage)
- ✅ Routes protected on both client and server
- ✅ Role-based access control
- ✅ Automatic logout on token expiration (implement on server)

## Files Created/Modified

### New Files
- `src/services/auth.js` - Authentication service
- `src/hooks/useAuth.js` - Authentication hooks
- `src/app/(auth)/forgot-password/page.jsx` - Forgot password page
- `src/app/(auth)/reset-password/page.jsx` - Reset password page
- `middleware.js` - Route protection middleware
- `AUTHENTICATION.md` - This file

### Modified Files
- `src/app/(auth)/connexion/page.jsx` - Login with auth integration
- `src/app/(auth)/inscription/page.jsx` - Register with auth integration
- `jsconfig.json` - Fixed path aliases
- Multiple import paths - Fixed @/src/ to @/ references

## Next Steps

1. Test login/register with backend
2. Implement email verification if required
3. Add password strength indicators
4. Implement session refresh/token rotation
5. Add rate limiting to login attempts
6. Implement two-factor authentication (optional)
7. Add remember me functionality persistence
