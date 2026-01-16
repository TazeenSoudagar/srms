# Postman Collection Setup Guide

## Quick Setup

### 1. Create Environment

1. Open Postman
2. Click **Environments** in the left sidebar
3. Click **+** to create new environment
4. Name it: `SRMS Local`
5. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://srms-backend.test/api` | `https://srms-backend.test/api` |
| `auth_token` | (leave empty) | (will be auto-filled) |

6. Click **Save**

### 2. Set Active Environment

- Select `SRMS Local` from the environment dropdown (top right)

### 3. Create Collection

1. Click **Collections** in the left sidebar
2. Click **+** to create new collection
3. Name it: `SRMS API`
4. Click on the collection name
5. Go to **Variables** tab
6. Add the same variables as environment (optional, for collection-level variables)

### 4. Create Request Folders

Create these folders in your collection:
- `01. Authentication`
- `02. Users`
- `03. Service Requests`
- `04. Comments`
- `05. Media`

### 5. Configure Collection Pre-request Script

1. Click on collection name
2. Go to **Pre-request Script** tab
3. Add this script to set base URL:

```javascript
// Set base URL from environment
pm.collectionVariables.set("base_url", pm.environment.get("base_url"));
```

### 6. Configure Collection Tests

1. Go to **Tests** tab
2. Add this script to log responses:

```javascript
// Log response for debugging
console.log("Status:", pm.response.code);
console.log("Response:", pm.response.json());
```

---

## Request Templates

### Authentication Request Template

#### Send OTP
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/send-otp`
- **Body (raw JSON):**
```json
{
  "email": "admin@gmail.com"
}
```

#### Verify OTP
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/verify-otp`
- **Body (raw JSON):**
```json
{
  "email": "admin@gmail.com",
  "otp": "123456"
}
```

- **Tests Tab:** Add the script from `verify-otp-test-script.js`

### Authenticated Request Template

For all authenticated requests:
- **Authorization Tab:**
  - Type: `Bearer Token`
  - Token: `{{auth_token}}`

- **Headers Tab:**
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`

---

## Example Requests

### List Service Requests
- **Method:** `GET`
- **URL:** `{{base_url}}/service-requests?status=open&priority=high&page=1&per_page=15`
- **Authorization:** Bearer Token `{{auth_token}}`

### Create Service Request
- **Method:** `POST`
- **URL:** `{{base_url}}/service-requests`
- **Authorization:** Bearer Token `{{auth_token}}`
- **Body (raw JSON):**
```json
{
  "service_id": 1,
  "title": "Test Service Request",
  "description": "This is a test request",
  "priority": "medium",
  "due_date": "2025-01-30"
}
```

### Upload Media
- **Method:** `POST`
- **URL:** `{{base_url}}/service-requests/{serviceRequestId}/media`
- **Authorization:** Bearer Token `{{auth_token}}`
- **Body (form-data):**
  - `file`: (Select File)
  - `name`: (optional) Custom name

---

## Test Scripts

### Auto-save Token Script
Add this to the **Tests** tab of `Verify OTP` request:

```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    if (responseJson.token) {
        pm.environment.set("auth_token", responseJson.token);
        console.log("Token saved:", responseJson.token);
    }
}
```

### Response Validation Script
Add this to authenticated requests to validate responses:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has data", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});
```

---

## Tips

1. **Use Variables:** Always use `{{base_url}}` and `{{auth_token}}` variables
2. **Save Responses:** Use Postman's "Save Response" feature to keep examples
3. **Use Examples:** Create examples for each request with different scenarios
4. **Test Scripts:** Add test scripts to validate responses automatically
5. **Organize:** Keep requests organized in folders by feature
6. **Document:** Add descriptions to each request explaining what it does

---

## Troubleshooting

### Token Not Saving
- Check environment is selected
- Verify test script syntax
- Check console for errors

### 401 Unauthorized
- Verify token is set in environment
- Check token hasn't expired
- Re-authenticate if needed

### 403 Forbidden
- Check user role has required permissions
- Verify you're using the correct user account
- Check policy rules

### 422 Validation Error
- Check request body matches expected format
- Verify all required fields are present
- Check field types and formats
