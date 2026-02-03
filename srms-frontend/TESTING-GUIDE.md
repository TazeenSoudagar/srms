# SRMS Frontend Testing Guide

## Step-by-Step Testing Instructions

### Step 1: Verify the App is Running
1. Open browser DevTools (F12)
2. Check the Console tab for any errors
3. Check the Network tab to see if API calls are being made

### Step 2: Test Login Flow

#### 2.1 Navigate to Login Page
- If you see an empty page, manually go to: `http://localhost:5173/login`
- You should see a login form with:
  - Email input field
  - "Send OTP" button

#### 2.2 Send OTP
1. Enter a valid email (use a seeded user from your backend):
   - Admin: `admin@gmail.com`
   - Or any user email from your database
2. Click "Send OTP"
3. Check your email or Laravel logs for the OTP code
4. You should see a success message and the form should show an OTP input field

#### 2.3 Verify OTP
1. Enter the 6-digit OTP you received
2. Click "Verify OTP"
3. On success, you should be redirected to `/dashboard`

### Step 3: Test Dashboard
After successful login, you should see:
- Header with your name and role
- Sidebar navigation menu
- Dashboard with:
  - Stats cards (Total, Open, In Progress, Closed)
  - Recent Service Requests list

### Step 4: Test Service Requests

#### 4.1 Create a Service Request
1. Click "Create Service Request" button (top right)
2. Fill in the form:
   - Select a Service (dropdown)
   - Enter Title (required)
   - Enter Description
   - Select Priority (Low/Medium/High)
   - Optionally set Due Date
3. Click "Create"
4. You should be redirected to the service request detail page

#### 4.2 View Service Request List
1. Click "Service Requests" in the sidebar
2. You should see a table with all service requests
3. Test filters:
   - Search by title/description
   - Filter by Status
   - Filter by Priority
4. Click "View" on any request to see details

#### 4.3 View Service Request Details
1. Click on any service request from the list
2. You should see:
   - Request details (status, priority, assigned to, etc.)
   - Description
   - Comments section
   - Attachments section

#### 4.4 Edit Service Request
1. From the detail page, click "Edit"
2. Modify the fields
3. Click "Update"
4. You should see a success message and be redirected back

### Step 5: Test Comments
1. Go to any service request detail page
2. Scroll to the Comments section
3. Type a comment in the textarea
4. Click "Add Comment"
5. Your comment should appear in the list
6. Test deleting your own comment

### Step 6: Test File Attachments
1. Go to any service request detail page
2. Scroll to the Attachments section
3. Click "Upload File"
4. Select a file (max 10MB, allowed: jpg, jpeg, png, pdf, doc, docx, txt)
5. File should appear in the list
6. Test downloading the file
7. Test deleting the file (if you're Admin or Support Engineer)

### Step 7: Test User Management (Admin Only)
1. Login as Admin user
2. Click "Users" in the sidebar
3. You should see a list of all users
4. Test search functionality
5. Click "Create User" to add a new user
6. Fill in the form and create
7. Test editing a user
8. Test deleting a user

### Step 8: Test Role-Based Access
1. **As Client:**
   - Can create service requests
   - Can view own requests
   - Cannot see "Users" menu
   - Cannot close requests

2. **As Support Engineer:**
   - Can view assigned requests
   - Can update status
   - Can close requests
   - Cannot see "Users" menu

3. **As Admin:**
   - Can see all requests
   - Can assign requests
   - Can manage users
   - Full access to all features

## Troubleshooting

### Empty Page
- Check browser console for errors
- Verify backend is running at `https://srms-backend.test`
- Check Network tab for failed API calls

### Login Not Working
- Verify backend API is accessible
- Check CORS settings in Laravel
- Verify OTP is being sent (check email/logs)
- Check API base URL in `.env` file

### API Errors
- Verify `VITE_API_BASE_URL` in `.env` matches your backend URL
- Check Laravel logs for errors
- Verify Sanctum token is being sent in requests

### Styling Issues
- Verify Tailwind CSS is compiling correctly
- Check browser console for CSS errors
- Ensure `src/index.css` is imported in `main.tsx`

## Next Steps After Testing

1. Fix any bugs found during testing
2. Add loading states where needed
3. Improve error messages
4. Add success notifications
5. Test on different browsers
6. Test responsive design (mobile/tablet)
