# SRMS API Testing Plan

## Overview
This document provides a comprehensive testing plan for all SRMS backend APIs. Test each endpoint systematically using Postman or similar tools.

## Base URL
```
https://srms-backend.test/api
```

## Authentication Flow

### Step 1: Send OTP
**Endpoint:** `POST /api/auth/send-otp`  
**Auth Required:** No  
**Rate Limit:** 5 requests per minute

**Request Body:**
```json
{
  "email": "admin@gmail.com"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "OTP sent successfully"
}
```

### Step 2: Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`  
**Auth Required:** No  
**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "email": "admin@gmail.com",
  "otp": "123456"
}
```

**Expected Response:** `200 OK`
```json
{
  "user": {
    "id": "encoded_hashid",
    "first_name": "SRMS",
    "last_name": "Admin",
    "email": "admin@gmail.com",
    "phone": "9999999999",
    "is_active": true,
    "role": {
      "id": 1,
      "name": "Admin"
    },
    "created_at": "2025-01-16T12:00:00.000000Z",
    "updated_at": "2025-01-16T12:00:00.000000Z"
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**⚠️ IMPORTANT:** Save the `token` from this response. Use it in the `Authorization` header for all subsequent requests:
```
Authorization: Bearer {token}
```

---

## Test Users

Use these seeded users for testing different roles:

### Admin User
- **Email:** `admin@gmail.com`
- **Password:** `test1234` (for Filament only, API uses OTP)
- **Role:** Admin
- **Access:** Full access to all endpoints

### Support Engineer Users
- **Email:** Check database or create via API
- **Role:** Support Engineer
- **Access:** Can view assigned requests, update status, add comments

### Client Users
- **Email:** Check database or create via API
- **Role:** Client
- **Access:** Can create/view own requests, add comments

---

## API Endpoints Testing Checklist

### 1. Authentication APIs ✅

#### 1.1 Send OTP
- [ ] Send OTP with valid email
- [ ] Send OTP with invalid email (should fail)
- [ ] Test rate limiting (5 requests/minute)
- [ ] Verify email is sent (check mail logs)

#### 1.2 Verify OTP
- [ ] Verify with correct OTP
- [ ] Verify with incorrect OTP (should fail)
- [ ] Verify with expired OTP (should fail)
- [ ] Verify with already used OTP (should fail)
- [ ] Test rate limiting (10 requests/minute)
- [ ] Verify token is returned and saved

---

### 2. User Management APIs (Admin Only) ✅

#### 2.1 List Users
**Endpoint:** `GET /api/users`  
**Auth Required:** Yes (Admin only)

**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page (max 100, default 15)
- `search` (optional): Search in name/email

**Expected Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "encoded_hashid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "is_active": true,
      "role": {
        "id": 1,
        "name": "Admin"
      },
      "created_at": "2025-01-16T12:00:00.000000Z",
      "updated_at": "2025-01-16T12:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

**Test Cases:**
- [ ] List users as admin (should succeed)
- [ ] List users as non-admin (should return 403)
- [ ] Test pagination
- [ ] Test search functionality
- [ ] Test without auth token (should return 401)

#### 2.2 Create User
**Endpoint:** `POST /api/users`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "role_id": 2,
  "is_active": true
}
```

**Expected Response:** `201 Created`

**Test Cases:**
- [ ] Create user as admin (should succeed)
- [ ] Create user with duplicate email (should fail)
- [ ] Create user with invalid role_id (should fail)
- [ ] Create user as non-admin (should return 403)
- [ ] Test validation errors

#### 2.3 Show User
**Endpoint:** `GET /api/users/{id}`  
**Auth Required:** Yes (Admin only)

**Test Cases:**
- [ ] Get user details as admin
- [ ] Get non-existent user (should return 404)
- [ ] Get user as non-admin (should return 403)

#### 2.4 Update User
**Endpoint:** `PUT /api/users/{id}` or `PATCH /api/users/{id}`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Updated",
  "email": "jane@example.com",
  "phone": "9876543210",
  "role_id": 2,
  "is_active": true
}
```

**Test Cases:**
- [ ] Update user as admin
- [ ] Update with duplicate email (should fail)
- [ ] Update non-existent user (should return 404)
- [ ] Update as non-admin (should return 403)

#### 2.5 Delete User
**Endpoint:** `DELETE /api/users/{id}`  
**Auth Required:** Yes (Admin only)

**Test Cases:**
- [ ] Delete user as admin
- [ ] Delete non-existent user (should return 404)
- [ ] Delete as non-admin (should return 403)

---

### 3. Services APIs ✅

#### 3.1 List Services
**Endpoint:** `GET /api/services`  
**Auth Required:** Yes (All authenticated users)

**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page (max 100, default 15)
- `is_active` (optional): Filter by active status (`true`/`false`)
- `search` (optional): Search in name/description

**Expected Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "encoded_hashid",
      "name": "IT Support",
      "description": "Technical support for hardware, software, and network issues",
      "is_active": true,
      "created_at": "2025-01-16T12:00:00.000000Z",
      "updated_at": "2025-01-16T12:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

**Test Cases:**
- [ ] List services as admin (should succeed)
- [ ] List services as support engineer (should succeed)
- [ ] List services as client (should succeed)
- [ ] Test pagination
- [ ] Test filter by `is_active` (true/false)
- [ ] Test search functionality (name/description)
- [ ] Test without auth token (should return 401)
- [ ] Verify only active services are returned when filtered

#### 3.2 Create Service
**Endpoint:** `POST /api/services`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "name": "New Service",
  "description": "Service description here",
  "is_active": true
}
```

**Expected Response:** `201 Created`
```json
{
  "data": {
    "id": "encoded_hashid",
    "name": "New Service",
    "description": "Service description here",
    "is_active": true,
    "created_at": "2025-01-16T12:00:00.000000Z",
    "updated_at": "2025-01-16T12:00:00.000000Z"
  }
}
```

**Test Cases:**
- [ ] Create service as admin (should succeed)
- [ ] Create service as non-admin (should return 403)
- [ ] Create with missing name (should fail validation)
- [ ] Create with name exceeding 255 characters (should fail)
- [ ] Create with description exceeding 1000 characters (should fail)
- [ ] Create without `is_active` (should default to true)
- [ ] Test validation error messages

#### 3.3 Show Service
**Endpoint:** `GET /api/services/{id}`  
**Auth Required:** Yes (All authenticated users)

**Expected Response:** `200 OK`
```json
{
  "data": {
    "id": "encoded_hashid",
    "name": "IT Support",
    "description": "Technical support for hardware, software, and network issues",
    "is_active": true,
    "created_at": "2025-01-16T12:00:00.000000Z",
    "updated_at": "2025-01-16T12:00:00.000000Z"
  }
}
```

**Test Cases:**
- [ ] Get service details as admin (should succeed)
- [ ] Get service details as support engineer (should succeed)
- [ ] Get service details as client (should succeed)
- [ ] Get non-existent service (should return 404)
- [ ] Get service with Hashids-encoded ID
- [ ] Test without auth token (should return 401)

#### 3.4 Update Service
**Endpoint:** `PUT /api/services/{id}` or `PATCH /api/services/{id}`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "name": "Updated Service Name",
  "description": "Updated description",
  "is_active": false
}
```

**Expected Response:** `200 OK`

**Test Cases:**
- [ ] Update service as admin (should succeed)
- [ ] Update service as non-admin (should return 403)
- [ ] Update with missing name (should fail if using PUT)
- [ ] Update with name exceeding 255 characters (should fail)
- [ ] Update with description exceeding 1000 characters (should fail)
- [ ] Update non-existent service (should return 404)
- [ ] Update with partial data using PATCH (should succeed)
- [ ] Verify activity log records the update

#### 3.5 Delete Service
**Endpoint:** `DELETE /api/services/{id}`  
**Auth Required:** Yes (Admin only)

**Expected Response:** `200 OK`
```json
{
  "message": "Service deleted successfully"
}
```

**Test Cases:**
- [ ] Delete service as admin (should succeed)
- [ ] Delete service as non-admin (should return 403)
- [ ] Delete non-existent service (should return 404)
- [ ] Delete service that has associated service requests (check behavior - should it be allowed?)
- [ ] Verify activity log records the deletion
- [ ] Verify service is removed from database

---

### 4. Service Request APIs ✅

#### 4.1 List Service Requests
**Endpoint:** `GET /api/service-requests`
**Auth Required:** Yes

**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page (max 100, default 15)
- `status` (optional): Filter by status (`open`, `in_progress`, `closed`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)
- `assigned_to` (optional): Filter by assigned user ID
- `created_by` (optional): Filter by creator user ID
- `service_id` (optional): Filter by service ID
- `date_from` (optional): Filter from date (YYYY-MM-DD)
- `date_to` (optional): Filter to date (YYYY-MM-DD)
- `search` (optional): Search in title/description

**Expected Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "encoded_hashid",
      "request_number": "SR-20250116-001",
      "title": "Service Request Title",
      "description": "Description here",
      "status": "open",
      "priority": "medium",
      "service": {
        "id": 1,
        "name": "Service Name"
      },
      "created_by": {
        "id": "encoded_hashid",
        "first_name": "John",
        "last_name": "Doe"
      },
      "assigned_to": null,
      "due_date": null,
      "closed_at": null,
      "created_at": "2025-01-16T12:00:00.000000Z",
      "updated_at": "2025-01-16T12:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

**Test Cases:**
- [ ] List as admin (should see all)
- [ ] List as client (should see only own requests)
- [ ] List as support engineer (should see only assigned requests)
- [ ] Test all filters individually
- [ ] Test filter combinations
- [ ] Test search functionality
- [ ] Test pagination

#### 4.2 Create Service Request
**Endpoint:** `POST /api/service-requests`  
**Auth Required:** Yes (Clients can create)

**Request Body:**
```json
{
  "service_id": 1,
  "title": "New Service Request",
  "description": "Detailed description here",
  "priority": "high",
  "due_date": "2025-01-30"
}
```

**Expected Response:** `201 Created`

**Test Cases:**
- [ ] Create as client (should succeed)
- [ ] Create with invalid service_id (should fail)
- [ ] Create with missing required fields (should fail)
- [ ] Verify request_number is auto-generated
- [ ] Verify created_by is set automatically
- [ ] Verify status defaults to "open"

#### 4.3 Show Service Request
**Endpoint:** `GET /api/service-requests/{id}`  
**Auth Required:** Yes

**Expected Response:** `200 OK` (includes comments and media)

**Test Cases:**
- [ ] View own request as client (should succeed)
- [ ] View assigned request as support engineer (should succeed)
- [ ] View any request as admin (should succeed)
- [ ] View unassigned request as support engineer (should fail)
- [ ] View other client's request as client (should fail)
- [ ] View non-existent request (should return 404)

#### 4.4 Update Service Request
**Endpoint:** `PUT /api/service-requests/{id}` or `PATCH /api/service-requests/{id}`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "high",
  "due_date": "2025-02-01"
}
```

**Test Cases:**
- [ ] Update own request as client
- [ ] Update assigned request as support engineer
- [ ] Update any request as admin
- [ ] Update unassigned request as support engineer (should fail)
- [ ] Update other client's request as client (should fail)

#### 4.5 Delete Service Request
**Endpoint:** `DELETE /api/service-requests/{id}`  
**Auth Required:** Yes (Admin only)

**Test Cases:**
- [ ] Delete as admin (should succeed)
- [ ] Delete as non-admin (should return 403)
- [ ] Delete non-existent request (should return 404)

#### 4.6 Assign Service Request
**Endpoint:** `POST /api/service-requests/{id}/assign`  
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "assigned_to": 2
}
```

**Expected Response:** `200 OK`

**Test Cases:**
- [ ] Assign to support engineer as admin (should succeed)
- [ ] Assign to non-support engineer (should fail validation)
- [ ] Assign as non-admin (should return 403)
- [ ] Assign to inactive user (should fail)

#### 4.7 Update Status
**Endpoint:** `PATCH /api/service-requests/{id}/status`  
**Auth Required:** Yes (Support Engineer or Admin)

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Test Cases:**
- [ ] Update status as assigned support engineer (should succeed)
- [ ] Update status as admin (should succeed)
- [ ] Update status as client (should return 403)
- [ ] Update with invalid status (should fail validation)
- [ ] Update unassigned request as support engineer (should fail)

#### 4.8 Close Service Request
**Endpoint:** `POST /api/service-requests/{id}/close`  
**Auth Required:** Yes (Support Engineer or Admin)

**Request Body:**
```json
{
  "notes": "Issue resolved successfully"
}
```

**Expected Response:** `200 OK`

**Test Cases:**
- [ ] Close assigned request as support engineer (should succeed)
- [ ] Close any request as admin (should succeed)
- [ ] Close as client (should return 403)
- [ ] Close already closed request (should fail)
- [ ] Verify closed_at timestamp is set
- [ ] Verify status changes to "closed"

---

### 5. Comment APIs ✅

#### 5.1 List Comments
**Endpoint:** `GET /api/service-requests/{id}/comments`  
**Auth Required:** Yes

**Test Cases:**
- [ ] List comments on accessible request
- [ ] List comments on inaccessible request (should fail)
- [ ] Verify comments are ordered by latest first

#### 5.2 Create Comment
**Endpoint:** `POST /api/service-requests/{id}/comments`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "body": "This is a comment"
}
```

**Test Cases:**
- [ ] Create comment on accessible request
- [ ] Create comment on inaccessible request (should fail)
- [ ] Create with empty body (should fail validation)
- [ ] Verify user_id is set automatically

#### 5.3 Show Comment
**Endpoint:** `GET /api/service-requests/{id}/comments/{commentId}`  
**Auth Required:** Yes

**Test Cases:**
- [ ] View comment on accessible request
- [ ] View comment on inaccessible request (should fail)
- [ ] View non-existent comment (should return 404)

#### 5.4 Update Comment
**Endpoint:** `PUT /api/service-requests/{id}/comments/{commentId}`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "body": "Updated comment text"
}
```

**Test Cases:**
- [ ] Update own comment (should succeed)
- [ ] Update other user's comment (should return 403)
- [ ] Update comment on inaccessible request (should fail)
- [ ] Update as admin (should succeed)

#### 5.5 Delete Comment
**Endpoint:** `DELETE /api/service-requests/{id}/comments/{commentId}`  
**Auth Required:** Yes

**Test Cases:**
- [ ] Delete own comment (should succeed)
- [ ] Delete other user's comment (should return 403)
- [ ] Delete any comment as admin (should succeed)
- [ ] Delete comment on inaccessible request (should fail)

---

### 6. Media/Attachment APIs ✅

#### 6.1 Upload Media
**Endpoint:** `POST /api/service-requests/{id}/media`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `file`: (file) The file to upload
- `name`: (optional) Custom name for the file

**Test Cases:**
- [ ] Upload file to accessible request
- [ ] Upload to inaccessible request (should fail)
- [ ] Upload invalid file type (should fail if validation exists)
- [ ] Upload file that's too large (should fail if validation exists)
- [ ] Verify file is stored correctly
- [ ] Verify media record is created

#### 6.2 Show Media
**Endpoint:** `GET /api/service-requests/{id}/media/{mediaId}`  
**Auth Required:** Yes

**Test Cases:**
- [ ] View media on accessible request
- [ ] View media on inaccessible request (should fail)
- [ ] View non-existent media (should return 404)

#### 6.3 Delete Media
**Endpoint:** `DELETE /api/service-requests/{id}/media/{mediaId}`  
**Auth Required:** Yes

**Test Cases:**
- [ ] Delete media on accessible request
- [ ] Delete media on inaccessible request (should fail)
- [ ] Delete non-existent media (should return 404)
- [ ] Verify file is deleted from storage

---

## Postman Collection Setup

### Environment Variables
Create a Postman Environment with:
- `base_url`: `https://srms-backend.test/api`
- `auth_token`: (will be set automatically by test script)

### Collection Structure
```
SRMS API Collection
├── Authentication
│   ├── Send OTP
│   └── Verify OTP
├── Users
│   ├── List Users
│   ├── Create User
│   ├── Show User
│   ├── Update User
│   └── Delete User
├── Services
│   ├── List Services
│   ├── Create Service
│   ├── Show Service
│   ├── Update Service
│   └── Delete Service
├── Service Requests
│   ├── List Service Requests
│   ├── Create Service Request
│   ├── Show Service Request
│   ├── Update Service Request
│   ├── Delete Service Request
│   ├── Assign Service Request
│   ├── Update Status
│   └── Close Service Request
├── Comments
│   ├── List Comments
│   ├── Create Comment
│   ├── Show Comment
│   ├── Update Comment
│   └── Delete Comment
└── Media
    ├── Upload Media
    ├── Show Media
    └── Delete Media
```

---

## Testing Workflow

1. **Setup**
   - Ensure database is seeded: `php artisan migrate:fresh --seed`
   - Create Postman environment
   - Import/configure Postman collection

2. **Authentication Flow**
   - Test send-otp
   - Test verify-otp
   - Save token automatically

3. **Test Each Endpoint Group**
   - Start with Users (Admin only)
   - Then Services (List/Show: all, CUD: admin)
   - Then Service Requests
   - Then Comments
   - Finally Media

4. **Test Authorization**
   - Test with different user roles
   - Verify access restrictions work correctly

5. **Test Edge Cases**
   - Invalid data
   - Missing fields
   - Non-existent resources
   - Rate limiting

---

## Common Response Formats

### Success Response
```json
{
  "data": {...},
  "message": "Success message" // Sometimes
}
```

### Error Response (Validation)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message 1",
      "Error message 2"
    ]
  }
}
```

### Error Response (Authorization)
```json
{
  "message": "This action is unauthorized."
}
```

### Error Response (Not Found)
```json
{
  "message": "Resource not found"
}
```

---

## Next Steps After Testing

1. Document any issues found
2. Fix bugs if any
3. Create frontend integration plan
4. Set up API client in frontend
5. Implement frontend screens
