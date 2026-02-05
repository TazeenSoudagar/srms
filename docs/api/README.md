# SRMS API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All API endpoints (except auth endpoints) require authentication using Laravel Sanctum tokens.

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Authentication Endpoints

### Send OTP
Request an OTP for passwordless authentication.

**Endpoint:** `POST /api/auth/send-otp`

**Rate Limit:** 5 requests per minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "email"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent successfully"
}
```

**Validation Errors (422):**
- email: required, valid email format
- type: required, must be 'email'

---

### Verify OTP
Verify OTP and receive authentication token.

**Endpoint:** `POST /api/auth/verify-otp`

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "email"
}
```

**Success Response (200):**
```json
{
  "message": "Authentication successful",
  "data": {
    "token": "1|abcdef123456...",
    "user": {
      "id": "abc123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "phone": "1234567890",
      "is_active": true,
      "role": {
        "id": "xyz789",
        "name": "Client"
      },
      "created_at": "2026-01-01T00:00:00.000000Z",
      "updated_at": "2026-01-01T00:00:00.000000Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired OTP
- `403 Forbidden`: Inactive user account
- `422 Unprocessable Entity`: Validation errors

---

## Service Request Endpoints

### List Service Requests
Get paginated list of service requests based on user role.

**Endpoint:** `GET /api/service-requests`

**Authorization:**
- Admin: Can view all requests
- Support Engineer: Can view assigned requests
- Client: Can view own requests

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `per_page` (integer): Items per page (default: 15, max: 100)
- `status` (string): Filter by status (open, in_progress, closed)
- `priority` (string): Filter by priority (low, medium, high)
- `assigned_to` (string): Filter by assigned user ID (hashed)
- `created_by` (string): Filter by creator user ID (hashed)
- `service_id` (string): Filter by service ID (hashed)
- `date_from` (date): Filter by start date
- `date_to` (date): Filter by end date
- `search` (string): Search in title and description

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "abc123",
      "request_number": "SR-20260201-0001",
      "title": "Network Issue",
      "description": "Internet connection is down",
      "status": "open",
      "priority": "high",
      "due_date": "2026-02-10",
      "service": {
        "id": "xyz789",
        "name": "Network Support"
      },
      "created_by": {
        "id": "user123",
        "name": "John Doe"
      },
      "assigned_to": null,
      "created_at": "2026-02-01T10:00:00.000000Z",
      "updated_at": "2026-02-01T10:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 72
  }
}
```

---

### Create Service Request
Create a new service request.

**Endpoint:** `POST /api/service-requests`

**Authorization:** All authenticated users

**Request Body:**
```json
{
  "service_id": "xyz789",
  "title": "Network Issue",
  "description": "Internet connection is down",
  "priority": "high",
  "due_date": "2026-02-10"
}
```

**Success Response (201):**
```json
{
  "id": "abc123",
  "request_number": "SR-20260201-0001",
  "title": "Network Issue",
  ...
}
```

**Validation Rules:**
- service_id: required, must exist
- title: required, max 255 characters
- description: optional, max 5000 characters
- priority: required, one of (low, medium, high)
- due_date: optional, must be future date

---

### View Service Request
Get details of a specific service request.

**Endpoint:** `GET /api/service-requests/{id}`

**Authorization:** Must have access to view the request

**Success Response (200):**
```json
{
  "id": "abc123",
  "request_number": "SR-20260201-0001",
  ...
}
```

---

### Update Service Request
Update an existing service request.

**Endpoint:** `PUT /api/service-requests/{id}`

**Authorization:** Request creator or admin

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "medium",
  "due_date": "2026-02-15"
}
```

---

### Assign Service Request
Assign a service request to a support engineer.

**Endpoint:** `POST /api/service-requests/{id}/assign`

**Authorization:** Admin only

**Request Body:**
```json
{
  "assigned_to": "engineer_id"
}
```

---

### Update Request Status
Update the status of a service request.

**Endpoint:** `PATCH /api/service-requests/{id}/status`

**Authorization:** Assigned support engineer or admin

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid Status Values:** open, in_progress, closed

---

### Close Service Request
Close a service request with notes.

**Endpoint:** `POST /api/service-requests/{id}/close`

**Authorization:** Assigned support engineer or admin

**Request Body:**
```json
{
  "notes": "Issue resolved successfully"
}
```

---

## Comment Endpoints

### List Comments
Get all comments for a service request.

**Endpoint:** `GET /api/service-requests/{serviceRequestId}/comments`

**Authorization:** Must have access to view the request

---

### Create Comment
Add a comment to a service request.

**Endpoint:** `POST /api/service-requests/{serviceRequestId}/comments`

**Request Body:**
```json
{
  "body": "This is a comment"
}
```

**Validation Rules:**
- body: required, max 2000 characters

---

### Update Comment
Update own comment.

**Endpoint:** `PUT /api/service-requests/{serviceRequestId}/comments/{commentId}`

**Authorization:** Comment author only

**Request Body:**
```json
{
  "body": "Updated comment text"
}
```

---

### Delete Comment
Delete a comment.

**Endpoint:** `DELETE /api/service-requests/{serviceRequestId}/comments/{commentId}`

**Authorization:**
- Comment author can delete own comment
- Admin can delete any comment

---

## Media Endpoints

### Upload File
Upload a file attachment to a service request.

**Endpoint:** `POST /api/service-requests/{serviceRequestId}/media`

**Authorization:** Must have access to view the request

**Request Body:** (multipart/form-data)
```
file: [File object]
```

**File Restrictions:**
- Max size: 10MB
- Allowed types: jpg, jpeg, png, pdf, doc, docx, txt

**Success Response (201):**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "id": "media123",
    "name": "document.pdf",
    "url": "/storage/service-requests/1/xyz.pdf"
  }
}
```

---

### Download File
Download a file attachment.

**Endpoint:** `GET /api/service-requests/{serviceRequestId}/media/{mediaId}`

**Authorization:** Must have access to view the request

**Response:** File download

---

### Delete File
Delete a file attachment.

**Endpoint:** `DELETE /api/service-requests/{serviceRequestId}/media/{mediaId}`

**Authorization:**
- Admin can delete any file
- Support engineer can delete files from assigned requests

---

## User Endpoints

### List Users
Get paginated list of users.

**Endpoint:** `GET /api/users`

**Authorization:** Admin only

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `search` (string): Search in name, email
- `role_id` (string): Filter by role ID

---

### Create User
Create a new user.

**Endpoint:** `POST /api/users`

**Authorization:** Admin only

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "role_id": "role123",
  "is_active": true
}
```

---

### View User
Get user details.

**Endpoint:** `GET /api/users/{id}`

**Authorization:** Admin only

---

### Update User
Update user information.

**Endpoint:** `PUT /api/users/{id}`

**Authorization:** Admin only

---

### Delete User
Delete a user.

**Endpoint:** `DELETE /api/users/{id}`

**Authorization:** Admin only

---

## Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "errors": {
    "field_name": [
      "Validation error message"
    ]
  }
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

- OTP send: 5 requests per minute
- OTP verify: 10 requests per minute
- General API: 60 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
```

---

## Notes

- All IDs in the API are obfuscated using Hashids
- Dates follow ISO 8601 format
- Timestamps are in UTC
- Pagination uses Laravel's standard meta format
- Activity logging is automatic for all mutations
