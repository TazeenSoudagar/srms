# SRMS Filament Admin Panel - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Clear All Caches
```bash
cd srms-backend
php artisan optimize:clear
```

### Step 2: Run Database Migrations
```bash
php artisan migrate
```

### Step 3: Start the Server
```bash
php artisan serve
```

### Step 4: Access Admin Panel
Open your browser and navigate to:
```
https://srms-backend.test/admin/login
```

**Login Credentials:**
- Email: `admin@gmail.com`
- Password: `test1234`

---

## 📱 Main Features Overview

### 1. Dashboard
- View real-time statistics
- Monitor service request trends
- See top-performing engineers
- Track overdue and pending requests

### 2. Categories & Services
- **Categories**: Create and manage service categories
- **Services**: Add services with images, pricing, and descriptions
- Link services to categories

### 3. Service Requests
- Create and assign service requests
- Track status (open, in progress, closed, cancelled)
- Set priorities (low, medium, high)
- Add comments and attachments
- View request history

### 4. Scheduling
- Create appointments for service requests
- Assign engineers to schedules
- Track appointment status
- Set reminders and notifications

### 5. Users & Roles
- Manage admin, engineers, and customers
- Set engineer profiles (bio, rates, experience)
- Track availability status
- View performance ratings

### 6. Ratings & Reviews
- View customer ratings
- See detailed feedback (professionalism, timeliness, quality)
- Track rating trends
- Monitor customer satisfaction

### 7. Activity Logs
- Audit trail of all system actions
- Track who did what and when
- Export logs for compliance

### 8. Settings
- Configure OTP settings
- Set application preferences
- Manage email configuration

---

## 🎯 Common Tasks

### Create a New Service Request
1. Navigate to **Requests > Service Requests**
2. Click **New Service Request**
3. Fill in:
   - Service
   - Title
   - Description
   - Priority
   - Due Date (optional)
4. Click **Create**

### Assign an Engineer to a Request
1. Open the service request
2. Click **Edit**
3. Select engineer from **Assigned To** dropdown
4. Click **Save**

### Schedule an Appointment
1. Open a service request
2. Go to **Schedules** tab
3. Click **Create**
4. Fill in:
   - Engineer
   - Date & Time
   - Location
   - Duration
5. Click **Create**

### View Customer Ratings
1. Navigate to **Feedback > Ratings & Reviews**
2. Use filters to narrow down:
   - By rating (1-5 stars)
   - By engineer
   - By service
   - By date range

### Export Data
1. Navigate to any list page (Users, Services, Requests, etc.)
2. Click the **Export** button
3. Wait for processing notification
4. Download the exported file

### Search Globally
1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
2. Type your search query
3. Click on result to navigate

---

## 🎨 Navigation Structure

```
Dashboard
└── Home (metrics and charts)

Service Management
├── Categories
└── Services

Requests
└── Service Requests (with badge showing open count)

Scheduling
└── Service Schedules

Users & Roles
└── Users

Feedback
└── Ratings & Reviews

System
├── Activity Logs
└── Settings
```

---

## 🔔 Notifications

- Bell icon in top-right corner
- Red badge shows unread count
- Click to see recent notifications
- Notifications link to relevant items
- Auto-refreshes every 30 seconds

---

## 📊 Dashboard Widgets Explained

### Row 1: Stats Overview
- **Total Requests**: All service requests with trend
- **Open Requests**: Clickable, filters to open requests
- **In Progress**: Currently being worked on
- **Completed This Month**: This month's closed requests
- **Cancelled**: Cancelled requests
- **Average Rating**: Overall customer satisfaction

### Row 2: Charts
- **Trends**: 30-day request history by status
- **Priority**: Distribution of low/medium/high priority
- **Top Engineers**: Best-rated engineers
- **Categories**: Request volume by category

### Row 3: Tables
- **Recent Requests**: Last 10 service requests
- **Overdue**: Past due date requests
- **Pending Assignments**: Unassigned open requests

### Row 4: Additional
- **Engineer Workload**: Active requests per engineer
- **Popular Services**: Top 5 most requested services
- **Activity Feed**: Recent system activities

---

## ⚡ Keyboard Shortcuts

- `Cmd/Ctrl + K`: Open global search
- `Tab`: Navigate through form fields
- `Enter`: Submit forms
- `Esc`: Close modals

---

## 🎨 Status Badge Colors

### Request Status
- 🔵 **Open**: Info (blue)
- 🟡 **In Progress**: Warning (amber)
- 🟢 **Resolved/Closed**: Success (green)
- 🔴 **Cancelled**: Danger (red)

### Priority
- 🟢 **Low**: Success (green)
- 🟡 **Medium**: Warning (amber)
- 🔴 **High**: Danger (red)

### Schedule Status
- 🟡 **Pending**: Warning
- 🔵 **Confirmed**: Info
- 🔵 **In Progress**: Primary
- 🟢 **Completed**: Success
- 🔴 **Cancelled**: Danger

### Availability
- 🟢 **Available**: Success
- 🟡 **Busy**: Warning
- 🔴 **Offline**: Danger

---

## 🛠️ Troubleshooting

### Can't Log In
- Verify credentials
- Check database connection
- Run: `php artisan migrate`

### Dashboard Not Loading
- Clear caches: `php artisan optimize:clear`
- Check server logs: `tail -f storage/logs/laravel.log`

### Charts Not Showing Data
- Ensure database has data
- Seed sample data: `php artisan db:seed`
- Refresh page

### Export Not Working
- Start queue worker: `php artisan queue:work`
- Or set `.env`: `QUEUE_CONNECTION=sync`

### Notifications Not Showing
- Run migration: `php artisan migrate`
- Check if notifications table exists
- Verify polling is enabled

---

## 📚 Documentation

For detailed information, see:

1. **FILAMENT_ADMIN_IMPLEMENTATION.md** - Complete feature list
2. **TESTING_AND_DEPLOYMENT_CHECKLIST.md** - Testing guide
3. **EXPORT_INSTRUCTIONS.md** - Export setup
4. **FILAMENT_ADMIN_FINAL_SUMMARY.md** - Executive summary

---

## 💡 Tips for Success

### For Administrators
- Review dashboard daily for insights
- Monitor activity logs for security
- Keep categories and services up to date
- Assign requests promptly
- Export data regularly for backups

### For Support Engineers
- Update request status regularly
- Add meaningful comments
- Schedule appointments in advance
- Keep availability status current
- Respond to customer feedback

### For System Maintenance
- Run queue worker in production
- Monitor error logs weekly
- Update dependencies monthly
- Back up database daily
- Test before deploying updates

---

## 🎯 Best Practices

1. **Assign Requests Quickly**: Don't let requests sit unassigned
2. **Use Priorities Wisely**: Not everything is high priority
3. **Add Comments**: Keep stakeholders informed
4. **Schedule Proactively**: Book appointments early
5. **Monitor Ratings**: Address low ratings promptly
6. **Keep Data Clean**: Archive old completed requests
7. **Export Regularly**: For reporting and backups
8. **Review Analytics**: Use data to improve service

---

## 📞 Need Help?

- Check documentation files in project root
- Review error logs: `storage/logs/laravel.log`
- Run diagnostics: `php artisan about`
- Check Filament docs: https://filamentphp.com/docs
- Review Laravel docs: https://laravel.com/docs

---

## ✅ Quick Checklist

Before going live:
- [ ] Run all migrations
- [ ] Clear all caches
- [ ] Test login
- [ ] Verify dashboard loads
- [ ] Test creating a request
- [ ] Test assigning an engineer
- [ ] Test scheduling
- [ ] Verify notifications work
- [ ] Test export functionality
- [ ] Review activity logs
- [ ] Backup database
- [ ] Set proper environment variables
- [ ] Enable queue worker
- [ ] Set up SSL certificate

---

**You're all set!** 🎉

Start exploring the admin panel and enjoy managing your service requests efficiently!

*For questions or issues, refer to the comprehensive documentation files.*
