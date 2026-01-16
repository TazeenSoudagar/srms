# SRMS API Endpoints Reference

## Base URL
```
https://srms-backend.test/api
```

---

## Authentication Endpoints

### 1. Send OTP
```
POST /api/auth/send-otp
```
**Auth Required:** No  
**Rate Limit:** 5 requests/minute

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP sent successfully"
}
```

---

### 2. Verify OTP
```
POST /api/auth/verify-otp
```
**Auth Required:** No  
**Rate Limit:** 10 requests/minute

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "login" // optional
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "encoded_hashid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "phone": "1234567890",
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

**⚠️ Save the token for authenticated requests!**

---

## User Endpoints (Admin Only)

### 3. List Users
```
GET /api/users
```
**Auth Required:** Yes (Admin)  
**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page (max 100, default 15)
- `search` (optional): Search in name/email

**Response:** `200 OK`
```json
{
  "data": [...],
  "links": {...},
  "meta": {...}
}
```

---

### 4. Create User
```
POST /api/users
```
**Auth Required:** Yes (Admin)

**Request:**
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

**Response:** `201 Created`

---

### 5. Show User
```
GET /api/users/{id}
```
**Auth Required:** Yes (Admin)

**Response:** `200 OK`

---

### 6. Update User
```
PUT /api/users/{id}
PATCH /api/users/{id}
```
**Auth Required:** Yes (Admin)

**Request:** Same as Create User

**Response:** `200 OK`

---

### 7. Delete User
```
DELETE /api/users/{id}
```
**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

---

## Service Endpoints

### 8. List Services
```
GET /api/services
```
**Auth Required:** Yes (All authenticated users)

**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page (max 100, default 15)
- `is_active` (optional): Filter by active status (true/false)
- `search` (optional): Search in name/description

**Response:** `200 OK`
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

---

### 9. Create Service
```
POST /api/services
```
**Auth Required:** Yes (Admin only)

**Request:**
```json
{
  "name": "New Service",
  "description": "Service description",
  "is_active": true
}
```

**Response:** `201 Created`

---

### 10. Show Service
```
GET /api/services/{id}
```
**Auth Required:** Yes (All authenticated users)

**Response:** `200 OK`

---

### 11. Update Service
```
PUT /api/services/{id}
PATCH /api/services/{id}
```
**Auth Required:** Yes (Admin only)

**Request:**
```json
{
  "name": "Updated Service Name",
  "description": "Updated description",
  "is_active": true
}
```

**Response:** `200 OK`

---

### 12. Delete Service
```
DELETE /api/services/{id}
```
**Auth Required:** Yes (Admin only)

**Response:** `200 OK`
```json
{
  "message": "Service deleted successfully"
}
```

---

## Service Request Endpoints

### 13. List Service Requests
```
GET /api/service-requests
```
**Auth Required:** Yes

**Query Parameters:**
- `page`, `per_page`: Pagination
- `status`: Filter by status (`open`, `in_progress`, `closed`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `assigned_to`: Filter by assigned user ID
- `created_by`: Filter by creator user ID
- `service_id`: Filter by service ID
- `date_from`, `date_to`: Date range filter
- `search`: Search in title/description

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "encoded_hashid",
      "request_number": "SR-20250116-001",
      "title": "Service Request Title",
      "description": "Description",
      "status": "open",
      "priority": "medium",
      "service": {...},
      "created_by": {...},
      "assigned_to": {...},
      "due_date": null,
      "closed_at": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "links": {...},
  "meta": {...}
}
```

---

### 14. Create Service Request
```
POST /api/service-requests
```
**Auth Required:** Yes (Clients can create)

**Request:**
```json
{
  "service_id": 1,
  "title": "New Service Request",
  "description": "Detailed description",
  "priority": "high",
  "due_date": "2025-01-30"
}
```

**Response:** `201 Created`

---

### 15. Show Service Request
```
GET /api/service-requests/{id}
```
**Auth Required:** Yes

**Response:** `200 OK` (includes comments and media)

---

### 16. Update Service Request
```
PUT /api/service-requests/{id}
PATCH /api/service-requests/{id}
```
**Auth Required:** Yes

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "high",
  "due_date": "2025-02-01"
}
```

**Response:** `200 OK`

---

### 17. Delete Service Request
```
DELETE /api/service-requests/{id}
```
**Auth Required:** Yes (Admin only)

**Response:** `200 OK`

---

### 18. Assign Service Request
```
POST /api/service-requests/{id}/assign
```
**Auth Required:** Yes (Admin only)

**Request:**
```json
{
  "assigned_to": 2
}
```

**Response:** `200 OK`

---

### 19. Update Status
```
PATCH /api/service-requests/{id}/status
```
**Auth Required:** Yes (Support Engineer or Admin)

**Request:**
```json
{
  "status": "in_progress"
}
```

**Response:** `200 OK`

---

### 20. Close Service Request
```
POST /api/service-requests/{id}/close
```
**Auth Required:** Yes (Support Engineer or Admin)

**Request:**
```json
{
  "notes": "Issue resolved successfully"
}
```

**Response:** `200 OK`

---

## Comment Endpoints

### 21. List Comments
```
GET /api/service-requests/{serviceRequestId}/comments
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "encoded_hashid",
      "body": "Comment text",
      "user": {
        "id": "encoded_hashid",
        "first_name": "John",
        "last_name": "Doe"
      },
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

### 22. Create Comment
```
POST /api/service-requests/{serviceRequestId}/comments
```
**Auth Required:** Yes

**Request:**
```json
{
  "body": "This is a comment"
}
```

**Response:** `201 Created`

---

### 23. Show Comment
```
GET /api/service-requests/{serviceRequestId}/comments/{commentId}
```
**Auth Required:** Yes

**Response:** `200 OK`

---

### 24. Update Comment
```
PUT /api/service-requests/{serviceRequestId}/comments/{commentId}
```
**Auth Required:** Yes (Owner or Admin)

**Request:**
```json
{
  "body": "Updated comment text"
}
```

**Response:** `200 OK`

---

### 25. Delete Comment
```
DELETE /api/service-requests/{serviceRequestId}/comments/{commentId}
```
**Auth Required:** Yes (Owner or Admin)

**Response:** `200 OK`
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Media Endpoints

### 26. Upload Media
```
POST /api/service-requests/{serviceRequestId}/media
```
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request (Form Data):**
- `file`: (file) The file to upload
- `name`: (optional) Custom name

**Response:** `201 Created`
```json
{
  "data": {
    "id": "encoded_hashid",
    "name": "filename.pdf",
    "url": "/storage/path/to/file.pdf",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

### 27. Show Media
```
GET /api/service-requests/{serviceRequestId}/media/{mediaId}
```
**Auth Required:** Yes

**Response:** `200 OK`

---

### 28. Delete Media
```
DELETE /api/service-requests/{serviceRequestId}/media/{mediaId}
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "message": "Media deleted successfully"
}
```

---

## Current User Endpoint

### 29. Get Current User
```
GET /api/user
```
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "id": "encoded_hashid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  ...
}
```

---

## Common Response Codes

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Authorization Summary

| Endpoint | Admin | Support Engineer | Client |
|----------|-------|------------------|--------|
| List Users | ✅ | ❌ | ❌ |
| Create/Update/Delete Users | ✅ | ❌ | ❌ |
| List/Show Services | ✅ | ✅ | ✅ |
| Create/Update/Delete Services | ✅ | ❌ | ❌ |
| List Service Requests | ✅ (all) | ✅ (assigned) | ✅ (own) |
| Create Service Request | ✅ | ❌ | ✅ |
| Update Service Request | ✅ | ✅ (assigned) | ✅ (own) |
| Assign Request | ✅ | ❌ | ❌ |
| Update Status | ✅ | ✅ (assigned) | ❌ |
| Close Request | ✅ | ✅ (assigned) | ❌ |
| Comments | ✅ | ✅ (on accessible) | ✅ (on accessible) |
| Media | ✅ | ✅ (on accessible) | ✅ (on accessible) |

---

## Notes

1. All IDs in responses are Hashids-encoded (not plain integers)
2. Use Hashids when making requests with IDs
3. Token expires based on Sanctum configuration
4. Rate limiting applies to auth endpoints
5. All dates are in ISO 8601 format
6. Pagination defaults to 15 items per page, max 100
