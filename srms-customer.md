# SRMS Customer Web Application Enhancement Plan

## Context

The SRMS (Service Request Management System) currently provides basic service request management with three user roles (Admin, Support Engineer, Client). This plan transforms it into a modern, AI-powered customer platform with real-time communication, intelligent scheduling, and gamification features.

### Why This Enhancement?

**Problem:** The current system treats service requests as static tickets. Customers have limited visibility into engineer availability, service quality, or trending services. Communication is asynchronous, and there's no incentive system for loyalty.

**Solution:** Transform SRMS into a marketplace-style platform where customers can discover services, interact with AI assistants, schedule appointments in real-time, rate engineers, earn rewards, and communicate directly with service providers.

### Technical Decisions Made

Based on requirements clarification:

1. **AI Provider:** Ollama/LLaMA (self-hosted open-source)
   - Cost-effective, full data control, no API rate limits
   - Requires GPU server but eliminates ongoing API costs

2. **Real-time Communication:** Laravel Reverb (Laravel's official WebSocket server)
   - Native Laravel integration, simple setup, self-hosted
   - Supports in-app notifications, push notifications (PWA), and email

3. **Scheduling:** Simple date/time picker (no complex availability checking initially)
   - Customer picks date/time → Engineer accepts/rejects
   - Faster to implement, can enhance later with availability slots

4. **Additional Features:** Service packages, loyalty rewards, live chat, customer analytics
   - Gamification for customer retention
   - Direct communication channel between customers and engineers
   - Data-driven insights for both customers and engineers

5. **Frontend Development:** Use `frontend-design` skill for production-grade UI components
   - Creates distinctive, modern interfaces
   - Avoids generic AI aesthetics

---

## Implementation Approach

### Architecture Overview

**New Infrastructure:**
- **Laravel Reverb:** WebSocket server for real-time events (service request updates, chat, notifications)
- **Ollama Server:** Self-hosted LLaMA 3.2 model for AI chatbot with vector embeddings for semantic search
- **n8n Workflows:** Calendar invite automation (Google Calendar/Outlook) and reminder scheduling
- **Queue Workers:** Background processing for notifications, AI responses, loyalty points, analytics

**Database Additions:** 11 new migration files creating 20+ tables
- Scheduling system with acceptance workflow
- Rating/review system with aggregate caching
- Complaint tracking beyond basic comments
- Service packages and customer purchases
- Loyalty points, transactions, rewards, tiers
- Live chat rooms and messages
- AI chatbot conversations and knowledge base
- Real-time notifications

**API Expansion:** 50+ new endpoints across 10 feature domains
- Service discovery with location-based search
- Scheduling with accept/reject workflow
- Rating/review submission and display
- Complaint filing and resolution
- Package purchase and management
- Loyalty points and redemption
- Live chat messaging
- AI chatbot conversations
- Real-time notifications
- Customer and engineer analytics

**Frontend Modules:** 9 new feature modules with 100+ components
- Service discovery with maps and filters
- Scheduling interface with date/time picker
- Rating forms and review display
- Complaint submission
- Package catalog and purchase flow
- Loyalty dashboard with tier badges
- Live chat windows
- AI chatbot widget (floating button)
- Notification center

---

## Implementation Phases (12 Weeks)

### Phase 1: Foundation & Real-time Infrastructure (Weeks 1-2)

**Goal:** Establish WebSocket communication and basic scheduling system

#### Backend Tasks
1. **Install Laravel Reverb**
   ```bash
   composer require laravel/reverb
   php artisan reverb:install
   php artisan reverb:start
   ```
   - Configure in `config/broadcasting.php`
   - Set up channel authentication in `routes/channels.php`
   - Create `.env` variables (REVERB_APP_KEY, REVERB_APP_SECRET, etc.)

2. **Create Scheduling Database Tables**
   - Migration: `2026_02_10_000003_create_service_schedules_table.php`
   - Fields: service_request_id, scheduled_start_time, status, accepted_by, accepted_at, rejected_at, rejection_reason, calendar_event_id
   - Model: `app/Models/ServiceSchedule.php` with relationships

3. **Build Scheduling System**
   - Service: `app/Services/SchedulingService.php` (createSchedule, acceptSchedule, rejectSchedule, notifyEngineer)
   - Controller: `app/Http/Controllers/Api/ScheduleController.php`
   - Endpoints:
     - `POST /api/service-requests/{id}/schedule` - Create schedule
     - `PATCH /api/schedules/{id}/accept` - Engineer accepts
     - `PATCH /api/schedules/{id}/reject` - Engineer rejects
     - `GET /api/schedules/my-schedule` - Engineer's schedule
   - Policy: `app/Policies/ServiceSchedulePolicy.php` (only assigned engineer can accept/reject)

4. **Create Real-time Events**
   - Events: `app/Events/ScheduleCreated.php`, `ScheduleAccepted.php`, `ScheduleRejected.php`
   - Implement `ShouldBroadcast` interface
   - Broadcast to private user channels: `private-user.{userId}`
   - Event listeners: `app/Listeners/ScheduleEventSubscriber.php`

5. **Set Up Notifications**
   - Migration: `2026_02_10_000008_create_notifications_table.php`
   - Notification classes: `app/Notifications/ScheduleRequestNotification.php`, etc.
   - Service: `app/Services/NotificationService.php` (sendRealTimeNotification, sendEmailNotification)
   - Jobs: `app/Jobs/Notification/SendRealTimeNotificationJob.php`

#### Frontend Tasks
1. **Install WebSocket Dependencies**
   ```bash
   npm install laravel-echo pusher-js
   ```

2. **Create WebSocket Context**
   - File: `src/contexts/WebSocketContext.tsx`
   - Initialize Laravel Echo with Reverb configuration
   - Provide `subscribe`, `unsubscribe`, `isConnected` methods
   - Handle reconnection logic

3. **Create Notification Context**
   - File: `src/contexts/NotificationContext.tsx`
   - State: notifications array, unreadCount
   - Methods: addNotification, markAsRead, markAllAsRead, subscribeToNotifications
   - Subscribe to `private-user.{userId}` channel on mount

4. **Build Scheduling Components**
   - `src/features/scheduling/components/ScheduleForm.tsx`
     - Date picker (using react-datepicker)
     - Time picker
     - Location input with address autocomplete
     - Submit to `POST /api/service-requests/{id}/schedule`
   - `src/features/scheduling/components/ScheduleAcceptReject.tsx`
     - For engineers: Accept/Reject buttons
     - Rejection reason textarea
     - Calls `PATCH /api/schedules/{id}/accept` or `reject`
   - `src/features/scheduling/components/EngineerScheduleView.tsx`
     - Calendar view of accepted schedules
     - Uses a calendar library (react-big-calendar or react-calendar)

5. **Build Notification Components**
   - `src/features/notifications/components/NotificationBell.tsx`
     - Bell icon in header with unread badge
     - Dropdown on click showing recent notifications
   - `src/features/notifications/components/NotificationItem.tsx`
     - Display notification with icon, message, timestamp
     - Mark as read on click
   - Real-time subscription in NotificationContext

#### Testing Phase 1
- ✅ WebSocket connection established on login
- ✅ Customer creates schedule → Engineer receives real-time notification
- ✅ Engineer accepts schedule → Customer receives notification
- ✅ Engineer rejects schedule with reason → Customer notified
- ✅ Notification bell badge updates in real-time

#### Critical Files
- `d:\Learning\srms\srms-backend\config\broadcasting.php`
- `d:\Learning\srms\srms-backend\routes\channels.php`
- `d:\Learning\srms\srms-backend\app\Services\SchedulingService.php`
- `d:\Learning\srms\srms-frontend\src\contexts\WebSocketContext.tsx`
- `d:\Learning\srms\srms-frontend\src\contexts\NotificationContext.tsx`

---

### Phase 2: Service Discovery & Engineer Profiles (Weeks 3-4)

**Goal:** Enable customers to browse services, find engineers by location/rating, view trending services

#### Backend Tasks
1. **Enhance Database Schema**
   - Migration: `2026_02_10_000002_enhance_services_table.php`
     - Add: category, average_duration_minutes, base_price, icon, popularity_score, is_trending, view_count
   - Migration: `2026_02_10_000001_add_engineer_profile_fields.php`
     - Add to users: latitude, longitude, address, city, state, country, bio, hourly_rate, years_of_experience, specializations (JSON), availability_status
   - Migration: `2026_02_10_000004_create_ratings_reviews_table.php`
     - Tables: ratings, engineer_ratings_aggregate

2. **Create Rating System**
   - Model: `app/Models/Rating.php` with relationships (serviceRequest, user, engineer, service)
   - Model: `app/Models/EngineerRatingAggregate.php` for cached average ratings
   - Service: `app/Services/RatingService.php`
     - `createRating()` - Validates request completion, creates rating
     - `updateEngineerAggregate()` - Recalculates average_rating, rating_distribution
     - `getEngineerRatingSummary()` - Returns cached aggregate data

3. **Implement GeoService**
   - Service: `app/Services/GeoService.php`
     - `calculateDistance()` - Haversine formula for distance between coordinates
     - `findNearbyEngineers()` - Returns engineers within radius, sorted by distance
     - `geocodeAddress()` - Optional: Use Google Maps API for address → lat/lng

4. **Build Service Discovery API**
   - Controller: `app/Http/Controllers/Api/ServiceDiscoveryController.php`
   - Endpoints:
     - `GET /api/services/search` - Query params: q, category, min_price, max_price, location[lat], location[lng], radius_km
     - `GET /api/services/trending` - Top 10 services by popularity_score
     - `GET /api/services/{id}/engineers` - Engineers for service with filters (location, min_rating, max_hourly_rate)
     - `GET /api/engineers/{id}` - Full engineer profile with ratings, reviews, specializations

5. **Implement Trending Algorithm**
   - Job: `app/Jobs/Analytics/UpdateServicePopularityJob.php`
   - Runs daily via cron
   - Calculates popularity_score based on: recent bookings, views, completion rate
   - Updates is_trending flag for top 10 services

#### Frontend Tasks
1. **Create Service Discovery Module**
   - `src/features/serviceDiscovery/components/ServiceGrid.tsx`
     - Grid layout of ServiceCard components
     - Pagination support
   - `src/features/serviceDiscovery/components/ServiceCard.tsx`
     - Display: service name, icon, category, base price, trending badge
     - Click → opens service details or engineers list
   - `src/features/serviceDiscovery/components/ServiceFilters.tsx`
     - Category dropdown, price range sliders, location input
     - Updates query params for ServiceGrid
   - `src/features/serviceDiscovery/components/TrendingServices.tsx`
     - Carousel or grid of trending services
     - Featured on homepage/dashboard

2. **Build Engineer Components**
   - `src/features/serviceDiscovery/components/EngineerList.tsx`
     - List of engineers for selected service
     - Filters: distance, rating, hourly rate
     - Sort by: rating, distance, price
   - `src/features/serviceDiscovery/components/EngineerCard.tsx`
     - Display: avatar, name, rating stars, years_of_experience, hourly_rate, distance
     - Badge: availability_status (available, busy, offline)
     - Click → opens EngineerProfileModal
   - `src/features/serviceDiscovery/components/EngineerProfileModal.tsx`
     - Full profile: bio, specializations, rating summary, recent reviews
     - Button: "Book Service" → creates service request with this engineer

3. **Create Common Components**
   - `src/components/common/LocationInput.tsx`
     - Input with autocomplete (using Google Places Autocomplete API or similar)
     - Returns { lat, lng, address }
   - `src/components/common/StarRating.tsx`
     - Display-only star rating (for engineer cards)
     - Interactive star rating (for rating forms in Phase 4)

4. **Add New Routes**
   - `/services/discover` - Main service discovery page
   - `/services/trending` - Trending services page
   - `/engineers/:id` - Engineer profile page

#### Testing Phase 2
- ✅ Service search with category and price filters
- ✅ Location-based engineer search (nearest engineers shown first)
- ✅ Trending services displayed correctly
- ✅ Engineer profile shows ratings, reviews, and distance
- ✅ Clicking "Book Service" creates service request

#### Critical Files
- `d:\Learning\srms\srms-backend\app\Services\GeoService.php`
- `d:\Learning\srms\srms-backend\app\Services\RatingService.php`
- `d:\Learning\srms\srms-backend\app\Http\Controllers\Api\ServiceDiscoveryController.php`
- `d:\Learning\srms\srms-frontend\src\features\serviceDiscovery\`

---

### Phase 3: AI Chatbot Integration (Weeks 5-6)

**Goal:** Conversational AI assistant for service discovery, engineer finding, and booking

#### Backend Tasks
1. **Install Ollama**
   ```bash
   # On server
   curl https://ollama.ai/install.sh | sh
   ollama pull llama3.2
   ollama serve # Runs on http://localhost:11434
   ```

2. **Create Chatbot Database Tables**
   - Migration: `2026_02_10_000010_create_chatbot_tables.php`
   - Tables: chatbot_conversations, chatbot_messages, chatbot_intents, chatbot_knowledge_base
   - chatbot_knowledge_base includes `embedding` JSON field for vector search

3. **Implement OllamaClient**
   - Service: `app/Services/OllamaClient.php`
   - Config: `config/ollama.php` (URL, model, temperature, max_tokens)
   - Methods:
     - `chat(array $messages, ?array $context)` - Send messages, get response
     - `generateEmbedding(string $text)` - Generate vector embedding for knowledge base
     - `streamChat(array $messages)` - Streaming response (optional)

4. **Build ChatbotService**
   - Service: `app/Services/ChatbotService.php`
   - Methods:
     - `processMessage()` - Main entry point, detects intent, generates response
     - `detectIntent()` - Classifies user intent (find_service, find_engineer, book_service, ask_question)
     - `extractEntities()` - Extracts entities (service name, location, date, etc.)
     - `searchKnowledgeBase()` - Semantic search using embeddings
     - `findServices()` - Search services based on criteria
     - `findEngineers()` - Search engineers based on criteria
     - `createServiceRequest()` - Book service on user's behalf
     - `sanitizeInput()` - Security: Remove injection attempts

5. **Create Chatbot API**
   - Controller: `app/Http/Controllers/Api/ChatbotController.php`
   - Endpoints:
     - `POST /api/chatbot/conversations` - Create new conversation
     - `POST /api/chatbot/conversations/{id}/message` - Send message
     - `GET /api/chatbot/conversations/{id}` - Get conversation history
     - `DELETE /api/chatbot/conversations/{id}` - Clear conversation
   - Rate limit: 30 requests per minute per user

6. **Seed Knowledge Base**
   - Seeder: `database/seeders/ChatbotKnowledgeBaseSeeder.php`
   - Content: FAQs, service descriptions, booking process, pricing info
   - Generate embeddings for each entry using OllamaClient

7. **Queue AI Processing**
   - Job: `app/Jobs/Chatbot/ProcessChatbotMessageJob.php`
   - Async processing of chatbot messages to avoid timeouts
   - Returns response via WebSocket or polling

#### Frontend Tasks
1. **Create Chatbot Module**
   - `src/features/chatbot/components/ChatbotWidget.tsx`
     - Floating button (bottom-right corner) with badge
     - Opens/closes ChatbotWindow
     - Persists across pages (rendered in App.tsx)
   - `src/features/chatbot/components/ChatbotWindow.tsx`
     - Chat interface: header with minimize/close buttons
     - Messages area (scrollable)
     - Input area with send button
   - `src/features/chatbot/components/ChatbotMessage.tsx`
     - User message: right-aligned, blue background
     - AI message: left-aligned, gray background
     - Timestamp, typing indicator
   - `src/features/chatbot/components/ChatbotInput.tsx`
     - Textarea with auto-expand
     - Send button (disabled while waiting for response)
   - `src/features/chatbot/components/QuickReplies.tsx`
     - Suggested quick replies from AI (e.g., "Find a plumber", "Show trending services")
     - Chips/buttons that populate input on click

2. **Implement Chatbot Logic**
   - Hook: `src/features/chatbot/hooks/useChatbot.ts`
     - State: messages, isLoading, conversationId
     - Methods: sendMessage, clearConversation
     - API calls to chatbot endpoints
   - Service: `src/services/chatbotService.ts`
     - `createConversation()`, `sendMessage()`, `getHistory()`, `clearConversation()`

3. **Add Chatbot to App**
   - Import ChatbotWidget in `src/App.tsx`
   - Render outside main layout (fixed position)
   - Only show when user is authenticated

#### Testing Phase 3
- ✅ Chatbot responds to "Find me a plumber"
- ✅ Intent detection: find_service returns relevant services
- ✅ Chatbot understands location queries: "Find engineers near downtown"
- ✅ Knowledge base search: "How do I book a service?"
- ✅ Booking assistance: "Book a plumber for tomorrow at 2pm"
- ✅ Conversation context maintained across messages

#### Critical Files
- `d:\Learning\srms\srms-backend\app\Services\OllamaClient.php`
- `d:\Learning\srms\srms-backend\app\Services\ChatbotService.php`
- `d:\Learning\srms\srms-backend\config\ollama.php`
- `d:\Learning\srms\srms-frontend\src\features\chatbot\`

---

### Phase 4: Ratings, Complaints & Post-Service Features (Weeks 7-8)

**Goal:** Complete service lifecycle with ratings, reviews, and complaint handling

#### Backend Tasks
1. **Create Complaint System**
   - Migration: `2026_02_10_000005_create_complaints_table.php`
   - Model: `app/Models/Complaint.php`
   - Service: `app/Services/ComplaintService.php`
     - `fileComplaint()` - Create complaint after service completion
     - `assignComplaint()` - Admin assigns to another admin
     - `resolveComplaint()` - Mark as resolved with resolution text
     - `generateComplaintNumber()` - "COMP-YYYYMMDD-XXXX"

2. **Build Rating API**
   - Controller: `app/Http/Controllers/Api/RatingController.php`
   - Endpoints:
     - `POST /api/service-requests/{id}/rating` - Submit rating after service completion
     - `GET /api/engineers/{id}/ratings` - Get engineer's reviews (paginated)
     - `GET /api/engineers/{id}/rating-summary` - Get aggregate rating data
     - `GET /api/my-ratings` - Customer's submitted ratings
   - Validation: Only completed services can be rated, one rating per request per user

3. **Build Complaint API**
   - Controller: `app/Http/Controllers/Api/ComplaintController.php`
   - Endpoints:
     - `POST /api/service-requests/{id}/complaint` - File complaint
     - `GET /api/my-complaints` - Customer's complaints
     - `GET /api/complaints` - Admin: All complaints with filters
     - `PATCH /api/complaints/{id}/assign` - Admin: Assign complaint
     - `PATCH /api/complaints/{id}/resolve` - Admin: Resolve complaint
   - Policy: Only completed services can have complaints, customer can't edit after filing

4. **Update Service Request Completion Flow**
   - When service request status changes to "closed":
     - Send notification to customer: "Rate your service"
     - Add link to rating form in email/push notification
     - After 7 days, send reminder if not rated

#### Frontend Tasks
1. **Create Rating Module**
   - `src/features/ratings/components/RatingForm.tsx`
     - Star rating (1-5 stars, interactive)
     - Review textarea (optional)
     - Rating breakdown: professionalism, timeliness, quality (each 1-5 stars)
     - Anonymous checkbox
     - Submit to `POST /api/service-requests/{id}/rating`
   - `src/features/ratings/components/RatingDisplay.tsx`
     - Display average rating with star visualization
     - Rating distribution bar chart (5★: 10, 4★: 5, 3★: 2, etc.)
   - `src/features/ratings/components/ReviewList.tsx`
     - List of reviews with pagination
     - Filters: rating value, date range
   - `src/features/ratings/components/ReviewCard.tsx`
     - Display: reviewer name (or "Anonymous"), rating, review text, date
     - Verified badge for completed services

2. **Create Complaint Module**
   - `src/features/complaints/components/ComplaintForm.tsx`
     - Category dropdown: poor_service, unprofessional, delayed, billing, other
     - Severity: low, medium, high, critical
     - Description textarea
     - Submit to `POST /api/service-requests/{id}/complaint`
   - `src/features/complaints/components/ComplaintList.tsx`
     - Customer: View own complaints
     - Admin: View all complaints with filters (status, severity, engineer)
   - `src/features/complaints/components/ComplaintCard.tsx`
     - Display: complaint_number, category, severity badge, status badge, filed date
     - Click → ComplaintDetails
   - `src/features/complaints/components/ComplaintDetails.tsx`
     - Full complaint info: description, service request details, engineer info
     - Admin actions: Assign dropdown, Resolve button with resolution textarea

3. **Add Rating Prompt After Service Completion**
   - In ServiceRequestDetail component:
     - If status is "closed" and not rated: Show prominent "Rate this service" button
     - Opens RatingForm modal
   - In NotificationItem component:
     - "Service completed" notification includes "Rate Service" button

4. **Update Engineer Profile to Show Ratings**
   - In EngineerProfileModal:
     - Display RatingDisplay component (average rating, distribution)
     - Display ReviewList component (recent reviews)

#### Testing Phase 4
- ✅ Customer can rate completed service request
- ✅ Rating updates engineer's aggregate rating immediately
- ✅ Reviews appear on engineer profile
- ✅ Customer can file complaint on completed service
- ✅ Admin can view, assign, and resolve complaints
- ✅ Rating form appears automatically after service completion

#### Critical Files
- `d:\Learning\srms\srms-backend\app\Services\RatingService.php`
- `d:\Learning\srms\srms-backend\app\Services\ComplaintService.php`
- `d:\Learning\srms\srms-frontend\src\features\ratings\`
- `d:\Learning\srms\srms-frontend\src\features\complaints\`

---

### Phase 5: Advanced Features (Weeks 9-12)

**Goal:** Service packages, loyalty program, live chat, analytics, n8n integration, PWA notifications

#### Backend Tasks
1. **Create Service Packages**
   - Migration: `2026_02_10_000006_create_service_packages_table.php`
   - Models: ServicePackage, PackageService (pivot), CustomerPackagePurchase
   - Controller: `app/Http/Controllers/Api/PackageController.php`
   - Endpoints:
     - `GET /api/packages` - List active packages
     - `GET /api/packages/{id}` - Package details
     - `POST /api/packages/{id}/purchase` - Purchase package
     - `GET /api/my-packages` - Customer's purchased packages with remaining services

2. **Implement Loyalty Program**
   - Migration: `2026_02_10_000007_create_loyalty_program_tables.php`
   - Models: LoyaltyPoint, LoyaltyTransaction, LoyaltyReward
   - Service: `app/Services/LoyaltyService.php`
     - `awardPoints()` - Award points for actions (service completion, review, referral)
     - `redeemReward()` - Deduct points, grant reward (discount, free service)
     - `updateTier()` - Calculate tier based on lifetime_points (bronze/silver/gold/platinum)
     - `calculatePointsForService()` - Points based on service price
   - Controller: `app/Http/Controllers/Api/LoyaltyController.php`
   - Endpoints:
     - `GET /api/loyalty/points` - Current points, tier, lifetime points
     - `GET /api/loyalty/transactions` - Transaction history
     - `GET /api/loyalty/rewards` - Available rewards catalog
     - `POST /api/loyalty/redeem/{id}` - Redeem reward
   - Event listener: Award points automatically on service completion

3. **Build Live Chat System**
   - Migration: `2026_02_10_000009_create_chat_system_tables.php`
   - Models: ChatRoom, ChatMessage
   - Controller: `app/Http/Controllers/Api/ChatController.php`
   - Endpoints:
     - `GET /api/chat/rooms` - User's chat rooms
     - `GET /api/chat/rooms/{id}/messages` - Chat history
     - `POST /api/chat/rooms/{id}/messages` - Send message (broadcasts via WebSocket)
     - `PATCH /api/chat/rooms/{id}/read` - Mark messages as read
   - Event: `app/Events/ChatMessageSent.php` (broadcasts to chat.{roomId} channel)
   - Auto-create chat room when service request is assigned to engineer

4. **Install n8n and Create Workflows**
   ```bash
   docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
   ```
   - **Workflow 1: Calendar Invite on Schedule Acceptance**
     - Trigger: Webhook from Laravel (`POST /webhook/calendar-invite`)
     - Get schedule details via HTTP request to Laravel API
     - Create Google Calendar event (or Outlook)
     - Add customer and engineer as attendees
     - HTTP request back to Laravel with event ID
     - Send confirmation email via Email node
   - **Workflow 2: Schedule Reminders**
     - Trigger: Cron (every hour)
     - HTTP request: Get schedules due in next 24 hours
     - Loop through schedules
     - HTTP request to Laravel webhook for reminder notification

5. **Set Up n8n Integration**
   - Service: `app/Services/N8nWebhookService.php`
     - `sendCalendarInvite()` - POST to n8n calendar workflow
     - `sendReminder()` - POST to n8n reminder workflow
     - `validateWebhookSignature()` - HMAC validation for incoming webhooks
   - Controller: `app/Http/Controllers/Api/N8nWebhookController.php`
   - Endpoints (protected by signature validation):
     - `POST /api/webhooks/n8n/calendar-event` - Receive event ID from n8n
     - `POST /api/webhooks/n8n/calendar-reminder` - Trigger reminder notification
   - Config: `config/n8n.php` (webhook URLs, secret)
   - Update SchedulingService: Call n8n webhook on schedule acceptance

6. **Implement PWA Push Notifications**
   ```bash
   composer require minishlink/web-push
   ```
   - Migration: `2026_02_10_000012_create_push_subscriptions_table.php`
   - Model: PushSubscription
   - Service: `app/Services/PushNotificationService.php`
     - Uses Web Push library
     - `sendPushNotification()` - Send notification to user's subscribed devices
   - Generate VAPID keys:
     ```bash
     vendor/bin/web-push generate-vapid-keys
     ```
   - Endpoints:
     - `POST /api/push-subscriptions` - Register device for push notifications
     - `DELETE /api/push-subscriptions/{id}` - Unregister device

7. **Build Analytics System**
   - Controller: `app/Http/Controllers/Api/AnalyticsController.php`
   - Endpoints:
     - `GET /api/analytics/customer-insights` - total_spent, total_requests, favorite_engineers, favorite_services, spending_by_month, completion_rate
     - `GET /api/analytics/engineer-insights` - total_earnings, completed_requests, average_rating, earnings_by_month, top_services
   - Uses aggregation queries with caching (1 hour TTL)

#### Frontend Tasks
1. **Create Packages Module**
   - `src/features/packages/components/PackageGrid.tsx` - Grid of PackageCard
   - `src/features/packages/components/PackageCard.tsx` - Package name, price, discount badge, services included
   - `src/features/packages/components/PackageDetails.tsx` - Full details modal
   - `src/features/packages/components/MyPackages.tsx` - Purchased packages with remaining services counter
   - `src/features/packages/components/PackagePurchaseModal.tsx` - Confirmation modal before purchase

2. **Create Loyalty Module**
   - `src/features/loyalty/components/LoyaltyDashboard.tsx`
     - Display: current points, tier badge, progress to next tier, lifetime points
     - Sections: Transaction history, Rewards catalog
   - `src/features/loyalty/components/PointsDisplay.tsx` - Animated points counter
   - `src/features/loyalty/components/TierBadge.tsx` - Visual badge (bronze/silver/gold/platinum) with icon
   - `src/features/loyalty/components/TransactionHistory.tsx` - List of earned/redeemed/expired points
   - `src/features/loyalty/components/RewardsCatalog.tsx` - Grid of available rewards
   - `src/features/loyalty/components/RedeemRewardModal.tsx` - Confirm redemption

3. **Create Chat Module**
   - `src/features/chat/components/ChatWindow.tsx`
     - Full-screen chat interface
     - Header: Engineer/customer name, avatar, online status
     - Messages area: scrollable, auto-scroll to bottom on new message
     - Input: MessageInput component at bottom
   - `src/features/chat/components/ChatList.tsx`
     - List of active chat rooms
     - Each room: ChatRoomItem component
   - `src/features/chat/components/ChatRoomItem.tsx`
     - Display: other user's name, avatar, last message preview, unread badge, timestamp
     - Click → navigate to /chat/{roomId}
   - `src/features/chat/components/MessageBubble.tsx`
     - Sent message: right-aligned, blue background
     - Received message: left-aligned, gray background
     - Timestamp, read status (checkmarks)
   - `src/features/chat/components/MessageInput.tsx`
     - Textarea with send button
     - File attachment button (optional)
   - Context: `src/contexts/ChatContext.tsx`
     - Subscribe to `private-chat.{roomId}` WebSocket channel
     - Real-time message reception

4. **Create Analytics Module**
   - `src/features/analytics/components/CustomerInsightsDashboard.tsx`
     - Customer view: Total spent, total requests, favorite engineers, spending trends chart
   - `src/features/analytics/components/SpendingChart.tsx`
     - Line/bar chart of spending by month (using Chart.js or Recharts)
   - `src/features/analytics/components/ServiceUsageChart.tsx`
     - Pie chart of service usage distribution
   - `src/features/analytics/components/FavoriteEngineersList.tsx`
     - List of most-used engineers with stats

5. **Implement PWA**
   - `public/manifest.json` - PWA manifest
   - `public/sw.js` - Service worker
     - Handle push events
     - Cache assets for offline
     - Show notifications
   - `src/utils/pwa.ts`
     - `registerServiceWorker()` - Register SW on app load
     - `subscribeToPushNotifications()` - Request permission, subscribe, send subscription to backend
   - Add notification permission prompt in App.tsx

6. **Add New Routes**
   - `/packages` - Package list
   - `/my-packages` - Purchased packages
   - `/loyalty` - Loyalty dashboard
   - `/analytics` - Customer analytics
   - `/chat` - Chat list
   - `/chat/:roomId` - Chat window

#### Testing Phase 5
- ✅ Customer can purchase service package
- ✅ Package services are tracked and deducted on use
- ✅ Loyalty points awarded on service completion and review submission
- ✅ Customer can redeem rewards with points
- ✅ Live chat messages sent and received in real-time
- ✅ Calendar invite sent via n8n on schedule acceptance
- ✅ Push notifications received on mobile/desktop
- ✅ Analytics dashboard displays accurate data

#### Critical Files
- `d:\Learning\srms\srms-backend\app\Services\LoyaltyService.php`
- `d:\Learning\srms\srms-backend\app\Services\N8nWebhookService.php`
- `d:\Learning\srms\srms-backend\app\Services\PushNotificationService.php`
- `d:\Learning\srms\srms-frontend\src\features\packages\`
- `d:\Learning\srms\srms-frontend\src\features\loyalty\`
- `d:\Learning\srms\srms-frontend\src\features\chat\`
- `d:\Learning\srms\srms-frontend\src\features\analytics\`
- `d:\Learning\srms\srms-frontend\public\sw.js`

---

## Critical Files Reference

### Backend (Must Read Before Implementation)
- `d:\Learning\srms\srms-backend\routes\api.php` - Add all new API routes here
- `d:\Learning\srms\srms-backend\app\Models\ServiceRequest.php` - Extend with scheduling/rating relationships
- `d:\Learning\srms\srms-backend\app\Services\ActivityLogService.php` - Pattern for new service classes
- `d:\Learning\srms\srms-backend\app\Policies\ServiceRequestPolicy.php` - Pattern for authorization policies
- `d:\Learning\srms\srms-backend\config\broadcasting.php` - Configure Reverb here

### Frontend (Must Read Before Implementation)
- `d:\Learning\srms\srms-frontend\src\contexts\AuthContext.tsx` - Pattern for new contexts (NotificationContext, ChatContext)
- `d:\Learning\srms\srms-frontend\src\services\api.ts` - Base API client for all new services
- `d:\Learning\srms\srms-frontend\src\routes\index.tsx` - Add all new routes here
- `d:\Learning\srms\srms-frontend\src\features\serviceRequests\` - Pattern for new feature modules
- `d:\Learning\srms\srms-frontend\src\components\common\Button.tsx` - CVA pattern for styled components

---

## Verification & Testing

### End-to-End User Flows to Test

1. **Service Discovery & Booking Flow**
   - Customer opens app → sees trending services
   - Uses chatbot: "Find me a plumber near downtown"
   - Chatbot returns service list with nearby engineers
   - Customer clicks engineer → views profile with ratings
   - Clicks "Book Service" → fills schedule form
   - Engineer receives real-time notification
   - Engineer accepts → Customer receives notification
   - Calendar invite sent to both via n8n

2. **Service Completion Flow**
   - Engineer completes service → marks as "closed"
   - Customer receives "Rate your service" notification
   - Customer submits 5-star rating with review
   - Loyalty points awarded automatically (100 points + 50 bonus for review)
   - Engineer's average rating updates in real-time
   - Rating appears on engineer's profile

3. **Complaint Flow**
   - Customer files complaint on completed service
   - Admin receives notification
   - Admin assigns complaint to themselves
   - Admin contacts engineer, resolves issue
   - Customer receives resolution notification

4. **Live Chat Flow**
   - Customer schedules service
   - Chat room auto-created between customer and engineer
   - Customer sends message: "Can you arrive 30 minutes early?"
   - Engineer receives real-time notification and push notification
   - Engineer replies: "Sure, no problem!"
   - Messages appear instantly with read receipts

5. **Loyalty Redemption Flow**
   - Customer accumulates 500 points
   - Opens loyalty dashboard → sees "Gold" tier badge
   - Browses rewards catalog
   - Redeems "10% discount" reward (300 points)
   - Points deducted, discount applied to next service

### Performance Benchmarks

- WebSocket connection: < 100ms
- AI chatbot response: < 3 seconds
- Location-based search: < 500ms
- Real-time notification delivery: < 200ms
- Rating aggregate update: < 100ms
- Calendar invite via n8n: < 5 seconds

### Security Checklist

- ✅ Rate limiting on AI chatbot (30 req/min)
- ✅ WebSocket channel authentication
- ✅ n8n webhook signature validation
- ✅ AI input sanitization (max 500 chars, strip tags)
- ✅ Location privacy (rounded to 2 decimal places)
- ✅ Rating validation (only completed services, one per request)
- ✅ Complaint validation (only completed services)
- ✅ Policy checks on all mutations

---

## Environment Variables Summary

### Backend `.env` Additions
```env
# Laravel Reverb
BROADCAST_DRIVER=reverb
REVERB_APP_ID=srms-app
REVERB_APP_KEY=your-app-key-here
REVERB_APP_SECRET=your-app-secret-here
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Ollama AI
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=500

# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_WEBHOOK_SECRET=your-webhook-secret
N8N_CALENDAR_WORKFLOW_URL=http://localhost:5678/webhook/calendar-invite
N8N_REMINDER_WORKFLOW_URL=http://localhost:5678/webhook/reminder

# Web Push
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Loyalty
LOYALTY_POINTS_PER_SERVICE=100
LOYALTY_REVIEW_BONUS_POINTS=50
```

### Frontend `.env` Additions
```env
# WebSocket
VITE_REVERB_APP_KEY=your-app-key-here
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key

# Feature Flags
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_LIVE_CHAT=true
VITE_ENABLE_LOYALTY=true
```

---

## Additional Recommendations

### Quick Wins for Phase 1
- Start with Phase 1 to establish real-time foundation early
- Test WebSocket thoroughly before moving to Phase 2
- Use existing email notification infrastructure for fallback

### UI/UX Considerations
- Use `frontend-design` skill for creating distinctive UI components (chatbot widget, engineer cards, loyalty dashboard)
- Implement skeleton loaders for async operations (AI responses, location search)
- Add empty states for lists (no notifications, no chat rooms, no packages)
- Toast notifications for success/error feedback (react-hot-toast already in use)

### Future Enhancements (Post-Phase 5)
- Video consultation feature (WebRTC integration)
- In-app payment gateway (Stripe/PayPal)
- Advanced engineer availability calendar sync (Google/Outlook calendar integration)
- Multi-language support (i18n)
- Dark mode theme
- Mobile apps (React Native code sharing)
- Engineer mobile app for on-the-go management

### Team Collaboration Notes
- Use this plan as a living document - update as you implement
- Each phase can be worked on by different team members in parallel after Phase 1
- Frontend and backend for each phase can be developed concurrently
- Use feature flags (env vars) to enable/disable features in production

---

**Ready to start implementation? Begin with Phase 1 and we'll work through each phase systematically using the `frontend-design` skill for UI components!**
