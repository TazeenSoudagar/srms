# Support Engineer Testing Guide

## 🚀 Quick Start

### Step 1: Start Servers

**Backend (Laravel):**
```bash
cd srms-backend
php artisan serve
```
Backend will run at: http://localhost:8000

**Frontend (React):**
```bash
cd srms-frontend
npm run dev
```
Frontend will run at: http://localhost:5173

---

## 👤 Test Accounts

### Support Engineer Account
- **Email:** `engineer@srms.test`
- **Password:** `password123`
- **Role:** Support Engineer

### Create Support Engineer (If not exists)
```bash
cd srms-backend
php artisan tinker
```

Then in tinker:
```php
$supportRole = App\Models\Role::where('name', 'Support Engineer')->first();
$engineer = App\Models\User::create([
    'first_name' => 'John',
    'last_name' => 'Engineer',
    'email' => 'engineer@srms.test',
    'phone' => '9876543210',
    'role_id' => $supportRole->id,
    'password' => bcrypt('password123'),
    'is_active' => true,
]);
echo "Support Engineer created: engineer@srms.test / password123\n";
```

### Create Admin Account (For creating users via UI)
```php
$adminRole = App\Models\Role::where('name', 'Admin')->first();
$admin = App\Models\User::create([
    'first_name' => 'Admin',
    'last_name' => 'User',
    'email' => 'admin@srms.test',
    'phone' => '1234567890',
    'role_id' => $adminRole->id,
    'password' => bcrypt('password'),
    'is_active' => true,
]);
echo "Admin created: admin@srms.test / password\n";
```

### Create Test Service Requests
```php
// Create a service
$service = App\Models\Service::create([
    'name' => 'Technical Support',
    'description' => 'General technical support service',
    'is_active' => true,
]);

// Create a client
$clientRole = App\Models\Role::where('name', 'Client')->first();
$client = App\Models\User::create([
    'first_name' => 'Jane',
    'last_name' => 'Client',
    'email' => 'client@srms.test',
    'phone' => '5551234567',
    'role_id' => $clientRole->id,
    'is_active' => true,
]);

// Create service requests assigned to engineer
$engineer = App\Models\User::where('email', 'engineer@srms.test')->first();

// High priority overdue request
App\Models\ServiceRequest::create([
    'service_id' => $service->id,
    'created_by' => $client->id,
    'assigned_to' => $engineer->id,
    'title' => 'Critical Bug: Login not working',
    'description' => 'Users cannot log in to the system',
    'status' => 'open',
    'priority' => 'high',
    'due_date' => now()->subDays(2), // Overdue
    'is_active' => true,
]);

// Medium priority due soon
App\Models\ServiceRequest::create([
    'service_id' => $service->id,
    'created_by' => $client->id,
    'assigned_to' => $engineer->id,
    'title' => 'Feature Request: Dark Mode',
    'description' => 'Add dark mode to the application',
    'status' => 'in_progress',
    'priority' => 'medium',
    'due_date' => now()->addDays(3),
    'is_active' => true,
]);

// Low priority
App\Models\ServiceRequest::create([
    'service_id' => $service->id,
    'created_by' => $client->id,
    'assigned_to' => $engineer->id,
    'title' => 'Documentation Update',
    'description' => 'Update user documentation',
    'status' => 'open',
    'priority' => 'low',
    'due_date' => now()->addDays(10),
    'is_active' => true,
]);

// Closed request
App\Models\ServiceRequest::create([
    'service_id' => $service->id,
    'created_by' => $client->id,
    'assigned_to' => $engineer->id,
    'title' => 'Email Configuration',
    'description' => 'Configure email settings',
    'status' => 'closed',
    'priority' => 'medium',
    'closed_at' => now()->subDays(1),
    'is_active' => true,
]);

echo "Test data created!\n";
```

---

## ✅ Testing Checklist

### 1. Login with Password
- [ ] Open http://localhost:5173/login
- [ ] See two tabs: "Password Login" and "OTP Login"
- [ ] "Password Login" tab is selected by default
- [ ] Enter email: `engineer@srms.test`
- [ ] Enter password: `password123`
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard

### 2. Dashboard - Support Engineer View
- [ ] Title shows: "Dashboard - Support Engineer"
- [ ] See 7 stat cards:
  1. **Assigned Requests** - Shows total assigned (not "Total Requests")
  2. **Open** - Count of open requests
  3. **In Progress** - Count of in-progress requests
  4. **Closed** - Count of closed requests
  5. **High Priority** - Count of high priority open/in-progress requests
  6. **Overdue** - Count of past-due requests (red badge)
  7. **Due Within 7 Days** - Count of upcoming deadlines

### 3. Recent Assigned Requests Section
- [ ] Title shows: "Recent Assigned Requests"
- [ ] Each request shows:
  - Title
  - Request number
  - Priority badge (Red/Yellow/Green)
  - Status badge (Blue/Yellow/Green)
  - Due date with overdue warning
  - Created date

### 4. Service Requests List
- [ ] Click on "Service Requests" in sidebar
- [ ] Should only see requests assigned to you
- [ ] Can filter by status, priority
- [ ] Can search by title/description

### 5. OTP Login Still Works
- [ ] Logout
- [ ] Go to login page
- [ ] Click "OTP Login" tab
- [ ] Enter email and get OTP
- [ ] Should work as before

---

## 🔍 What to Verify

### Password Login Features:
✅ Login form has tabs for "Password Login" and "OTP Login"
✅ Password field has show/hide toggle (👁️/🙈)
✅ Form validates password (min 8 characters)
✅ Invalid credentials show error message
✅ Successful login redirects to dashboard
✅ Token is stored and subsequent requests are authenticated

### Dashboard Features:
✅ Role-specific title for Support Engineers
✅ Stats show only assigned requests (not all requests)
✅ High Priority card shows urgent items
✅ Overdue card highlights past-due requests with warning
✅ Due Within 7 Days card shows upcoming deadlines
✅ Recent requests show priority and status badges
✅ Due dates display with "Overdue" warning for late items
✅ Clicking on request navigates to detail page

### Authorization:
✅ Support Engineer can only see assigned requests
✅ Cannot see requests assigned to other engineers
✅ Cannot access admin-only features (Users, Services, Activity Logs)

---

## 📊 API Endpoints to Test

### Password Login
```bash
curl -X POST http://localhost:8000/api/auth/login-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "engineer@srms.test",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "xxx",
    "first_name": "John",
    "last_name": "Engineer",
    "email": "engineer@srms.test",
    "role": {
      "id": 2,
      "name": "Support Engineer"
    },
    "avatar": null
  },
  "token": "xxx|xxxxxx"
}
```

### Dashboard Stats
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "total": 4,
  "open": 2,
  "in_progress": 1,
  "closed": 1,
  "high_priority": 1,
  "overdue": 1,
  "due_within_7_days": 1
}
```

---

## 🐛 Troubleshooting

### Issue: "Invalid credentials"
- Verify Support Engineer exists in database
- Check password is correct: `password123`
- Ensure `is_active` is true

### Issue: "Dashboard shows 0 requests"
- Create service requests assigned to the engineer
- Check `assigned_to` field matches engineer's user ID
- Verify `is_active` is true on requests

### Issue: Backend/Frontend not starting
**Backend:**
```bash
cd srms-backend
php artisan serve --port=8001  # Try different port
```

**Frontend:**
```bash
cd srms-frontend
npm install  # Reinstall dependencies if needed
npm run dev -- --port 5174  # Try different port
```

### Issue: Database connection error
- Check `.env` file in `srms-backend/`
- Ensure database is running
- Run migrations: `php artisan migrate:fresh --seed`

---

## 📝 Notes

- **Do NOT push to GitHub yet** - This is local testing only
- All password-based features are new to this branch
- OTP login still works for other user types
- Backend rate limits: 10 login attempts per minute
- Existing change password feature still works in profile
