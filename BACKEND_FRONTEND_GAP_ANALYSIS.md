# Backend-Frontend Gap Analysis
## SRMS Customer Web App vs Backend API

**Date:** 2026-02-27
**Status:** 🔴 Critical Gaps Identified

---

## 🔴 Critical Gaps (Blocking Customer App)

### 1. **Missing Category API Endpoints**
**Impact:** HIGH - Customer app cannot display category grid on homepage

**Customer App Expects:**
```typescript
GET /api/categories
GET /api/categories/{id}
GET /api/categories/{id}/services
```

**Backend Status:** ❌ **MISSING**
- No `CategoryController` exists
- Routes not defined in `api.php`

**Required Actions:**
- [ ] Create `app/Http/Controllers/Api/CategoryController.php`
- [ ] Create `app/Http/Resources/CategoryResource.php`
- [ ] Add routes to `api.php`:
  ```php
  Route::get('categories', [CategoryController::class, 'index']);
  Route::get('categories/{category}', [CategoryController::class, 'show']);
  Route::get('categories/{category}/services', [CategoryController::class, 'services']);
  ```

---

### 2. **Missing Service Discovery Endpoints**
**Impact:** HIGH - Featured services and search won't work

**Customer App Expects:**
```typescript
GET /api/services/featured?limit=6
GET /api/services/search?q={query}
```

**Backend Status:** ❌ **MISSING**
- `/services` exists but missing `featured` and `search` endpoints
- No trending services endpoint

**Required Actions:**
- [ ] Add to `ServiceController`:
  ```php
  public function featured(Request $request)
  public function search(Request $request)
  public function trending()
  ```
- [ ] Add routes:
  ```php
  Route::get('services/featured', [ServiceController::class, 'featured']);
  Route::get('services/search', [ServiceController::class, 'search']);
  Route::get('services/trending', [ServiceController::class, 'trending']);
  ```

---

### 3. **Service Endpoints Behind Authentication**
**Impact:** CRITICAL - Public users can't browse services

**Current Backend:**
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('services', ServiceController::class);
});
```

**Customer App Needs:** Public access to browse services (GET only)

**Required Changes:**
```php
// Public routes (outside auth middleware)
Route::get('services', [ServiceController::class, 'index']);
Route::get('services/featured', [ServiceController::class, 'featured']);
Route::get('services/search', [ServiceController::class, 'search']);
Route::get('services/trending', [ServiceController::class, 'trending']);
Route::get('services/{service}', [ServiceController::class, 'show']);

// Protected routes (inside auth middleware)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('services', [ServiceController::class, 'store']);
    Route::put('services/{service}', [ServiceController::class, 'update']);
    Route::delete('services/{service}', [ServiceController::class, 'destroy']);
});
```

---

### 4. **Missing Service Response Structure**
**Impact:** MEDIUM - Frontend won't display category info correctly

**Customer App Expects:**
```json
{
  "id": "abc123",
  "name": "Deep Home Cleaning",
  "description": "...",
  "basePrice": 1999.00,
  "category": {
    "id": "xyz789",
    "name": "Home Cleaning"
  },
  "rating": 4.5,
  "reviewCount": 42,
  "isPopular": true,
  "image": "/images/services/cleaning.jpg"
}
```

**Backend Currently Returns:**
```json
{
  "id": 1,
  "name": "Deep Home Cleaning",
  "description": "...",
  "category_id": 1,
  "base_price": "1999.00",
  // Missing: category object, rating, reviewCount, isPopular, image
}
```

**Required Actions:**
- [ ] Create/Update `ServiceResource` to:
  - Include nested `category` object (via `CategoryResource`)
  - Calculate `rating` and `reviewCount` from ratings table
  - Map `is_trending` to `isPopular`
  - Add `image` field (service icon or default image)
  - Use camelCase for frontend (basePrice not base_price)

---

## 🟡 Medium Priority Gaps

### 5. **Service Request Status Mismatch**
**Customer App Uses:**
```typescript
type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
```

**Backend Status:** ✅ **Matches** (verify enum values in ServiceRequest model)

---

### 6. **Missing Logout Endpoint**
**Impact:** MEDIUM - Customer can't logout properly

**Customer App Expects:**
```typescript
POST /api/auth/logout
```

**Backend Status:** ❌ **MISSING**

**Required Actions:**
- [ ] Add to `AuthController`:
  ```php
  public function logout(Request $request)
  {
      $request->user()->currentAccessToken()->delete();
      return response()->json(['message' => 'Logged out successfully']);
  }
  ```
- [ ] Add route:
  ```php
  Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
  ```

---

### 7. **Missing /auth/me Endpoint**
**Impact:** LOW - Used for token validation and refreshing user data

**Customer App Expects:**
```typescript
GET /api/auth/me
```

**Backend Has:** `/api/user` (equivalent)

**Recommended:** Add alias or update customer app to use `/api/user`

---

## 🟢 Low Priority / Nice to Have

### 8. **Pagination Format**
**Customer App Expects:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "perPage": 12,
    "currentPage": 1,
    "lastPage": 9
  }
}
```

**Backend:** Verify Laravel pagination format matches

---

### 9. **Error Response Format**
**Ensure consistency:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

---

## 📋 Summary Checklist

### Must-Have for Customer App to Function:
- [ ] Create CategoryController with index, show, services methods
- [ ] Create CategoryResource for API responses
- [ ] Add category routes (public access)
- [ ] Move service GET endpoints outside auth middleware
- [ ] Add ServiceController@featured method
- [ ] Add ServiceController@search method
- [ ] Add ServiceController@trending method
- [ ] Update ServiceResource to include:
  - Nested category object
  - rating and reviewCount (calculated)
  - isPopular field
  - image field
  - camelCase properties
- [ ] Add AuthController@logout method
- [ ] Add logout route

### Database Changes:
- [x] Create categories table migration
- [x] Update services table to use category_id
- [x] Create Category model
- [x] Update Service model with category relationship
- [x] Create CategorySeeder
- [x] Update ServiceSeeder with categories
- [x] Update DatabaseSeeder order

### Frontend Dependencies:
None - Customer app is correctly structured and waiting for backend endpoints

---

## 🎯 Recommended Implementation Order

### Phase 1: Critical (Blocking)
1. Create Category API (Controller, Resource, Routes)
2. Make services public (move routes outside auth)
3. Add featured, search, trending to ServiceController
4. Update ServiceResource with nested category

### Phase 2: Important
5. Add logout endpoint
6. Add rating/review aggregation to ServiceResource

### Phase 3: Polish
7. Verify pagination format
8. Standardize error responses
9. Add API documentation

---

## 🔗 Related Files to Create/Modify

**New Files:**
- `app/Http/Controllers/Api/CategoryController.php`
- `app/Http/Resources/CategoryResource.php`
- `app/Http/Resources/ServiceResource.php`

**Files to Modify:**
- `routes/api.php` (restructure auth/public routes)
- `app/Http/Controllers/Api/ServiceController.php` (add methods)
- `app/Http/Controllers/Auth/AuthController.php` (add logout)

---

## 📝 Notes

1. **Authentication Flow:** Currently working correctly with OTP-based login
2. **Service Request Flow:** Backend structure exists but customer app Phase 2 not yet built
3. **WebSocket:** Backend ready, customer app Phase 3 not yet built
4. **File Uploads:** Backend supports media attachments, customer app Phase 2 needs implementation

---

**Next Steps:** Implement Phase 1 changes to unblock customer app development.
