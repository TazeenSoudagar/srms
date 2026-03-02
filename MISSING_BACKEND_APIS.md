# Missing Backend APIs & Database Gaps
## Based on Current Frontend Implementation (Phase 1)

**Analysis Date:** 2026-02-27
**Frontend Status:** Phase 1 Complete (using mock data)
**Backend Status:** Basic structure exists, critical endpoints missing

---

## 🔴 CRITICAL - Required for Current Frontend

### 1. **Category API Endpoints**
**Status:** ❌ COMPLETELY MISSING

**Frontend Expectation:**
- CategoryGrid component currently uses hardcoded data but links to `/services?category={slug}`
- API client has methods ready: `categoriesApi.getAll()`, `categoriesApi.getById()`

**Required Backend:**
```php
// Routes needed (PUBLIC ACCESS)
GET /api/categories                    // List all active categories
GET /api/categories/{id}               // Get single category
GET /api/categories/{id}/services      // Get services by category
```

**Missing Files:**
```
❌ app/Http/Controllers/Api/CategoryController.php
❌ app/Http/Resources/CategoryResource.php
❌ Routes in api.php
```

**Database Status:**
```
✅ categories table created
✅ Category model created
✅ CategorySeeder created
✅ Services.category_id foreign key added
```

**Response Format Needed:**
```json
{
  "data": [
    {
      "id": "xyz789",
      "name": "Home Cleaning",
      "slug": "home-cleaning",
      "description": "Professional home cleaning services...",
      "icon": "cleaning",
      "isActive": true,
      "serviceCount": 12
    }
  ]
}
```

---

### 2. **Services - Public Access**
**Status:** ❌ BLOCKED (endpoints exist but behind auth)

**Current Backend:**
```php
// All behind auth middleware - customers can't browse!
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('services', ServiceController::class);
});
```

**Required Change:**
```php
// Public endpoints (anyone can browse)
Route::get('services', [ServiceController::class, 'index']);
Route::get('services/{service}', [ServiceController::class, 'show']);

// Protected endpoints (admin only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('services', [ServiceController::class, 'store']);
    Route::put('services/{service}', [ServiceController::class, 'update']);
    Route::delete('services/{service}', [ServiceController::class, 'destroy']);
});
```

---

### 3. **Featured Services Endpoint**
**Status:** ❌ MISSING

**Frontend Current State:**
- FeaturedServices component uses mock data (line 17-68)
- Comment says: "Mock data - will be replaced with API call"
- API client has method: `servicesApi.getFeatured(limit)`

**Required Backend:**
```php
// Route needed (PUBLIC ACCESS)
GET /api/services/featured?limit=6

// Controller method needed in ServiceController
public function featured(Request $request)
{
    $limit = $request->input('limit', 6);

    $services = Service::with('category')
        ->where('is_active', true)
        ->where('is_trending', true)
        ->orderBy('popularity_score', 'desc')
        ->limit($limit)
        ->get();

    return ServiceResource::collection($services);
}
```

**Missing:**
```
❌ ServiceController@featured method
❌ Route definition
```

---

### 4. **Service Resource Transformer**
**Status:** ❌ MISSING

**Frontend Expects (from types/service.ts):**
```typescript
{
  id: string,              // Hashid, not integer
  name: string,
  description: string,
  basePrice: number,       // camelCase, not base_price
  category: {              // Nested object, not category_id
    id: string,
    name: string
  },
  rating?: number,         // Calculated from ratings
  reviewCount?: number,    // Count of reviews
  isPopular?: boolean,     // Mapped from is_trending
  image?: string,          // Service image path
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

**Backend Currently Returns:**
```json
{
  "id": 1,                    // ❌ Integer, not hashid
  "name": "Deep Home Cleaning",
  "description": "...",
  "category_id": 1,           // ❌ Just ID, not nested object
  "base_price": "1999.00",    // ❌ snake_case
  "is_active": true,
  "is_trending": false,       // ❌ Not mapped to isPopular
  // ❌ Missing: rating, reviewCount, image
}
```

**Missing File:**
```
❌ app/Http/Resources/ServiceResource.php
```

**Required Implementation:**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->hashid,
            'name' => $this->name,
            'description' => $this->description,
            'basePrice' => (float) $this->base_price,
            'category' => $this->category ? new CategoryResource($this->category) : null,
            'rating' => $this->calculateAverageRating(),
            'reviewCount' => $this->ratings_count ?? 0,
            'isPopular' => (bool) $this->is_trending,
            'image' => $this->icon ? "/images/services/{$this->icon}.jpg" : null,
            'isActive' => (bool) $this->is_active,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
```

---

### 5. **Auth - Logout Endpoint**
**Status:** ❌ MISSING

**Frontend Implementation:**
```typescript
// AuthContext.tsx calls this on logout
await authApi.logout();

// lib/api/auth.ts expects:
logout: async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  // Then clears localStorage
}
```

**Backend Current:**
```
❌ No logout endpoint exists
```

**Required:**
```php
// Route needed
Route::post('auth/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

// Method needed in AuthController
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logged out successfully'
    ]);
}
```

---

## 🟡 MEDIUM PRIORITY - Needed Soon

### 6. **Service Search Endpoint**
**Status:** ❌ MISSING (but not used in Phase 1)

**Frontend API Client Has:**
```typescript
servicesApi.search(query: string)
```

**Required Backend:**
```php
GET /api/services/search?q={query}

public function search(Request $request)
{
    $query = $request->input('q');

    $services = Service::with('category')
        ->where('is_active', true)
        ->where(function($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('description', 'like', "%{$query}%");
        })
        ->get();

    return ServiceResource::collection($services);
}
```

---

### 7. **Service Filtering**
**Status:** ❌ MISSING

**Frontend Expects (from types/service.ts):**
```typescript
interface ServiceFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isPopular?: boolean;
  sortBy?: 'name' | 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
}
```

**Required Backend:**
```php
// Enhance ServiceController@index to accept filters
GET /api/services?categoryId=xyz&minPrice=500&maxPrice=2000&sortBy=price&sortOrder=asc

public function index(Request $request)
{
    $query = Service::with('category')->where('is_active', true);

    // Filter by category
    if ($request->has('categoryId')) {
        $query->where('category_id', $request->categoryId);
    }

    // Filter by price range
    if ($request->has('minPrice')) {
        $query->where('base_price', '>=', $request->minPrice);
    }
    if ($request->has('maxPrice')) {
        $query->where('base_price', '<=', $request->maxPrice);
    }

    // Filter by popular
    if ($request->has('isPopular')) {
        $query->where('is_trending', $request->boolean('isPopular'));
    }

    // Sorting
    $sortBy = $request->input('sortBy', 'name');
    $sortOrder = $request->input('sortOrder', 'asc');

    if ($sortBy === 'price') {
        $query->orderBy('base_price', $sortOrder);
    } elseif ($sortBy === 'rating') {
        // TODO: Add ratings table and join
        $query->orderBy('popularity_score', $sortOrder);
    } else {
        $query->orderBy('name', $sortOrder);
    }

    $services = $query->paginate($request->input('perPage', 12));

    return ServiceResource::collection($services);
}
```

---

## 🟢 LOW PRIORITY - Future Phases

### 8. **Ratings & Reviews System**
**Status:** ❌ NOT IMPLEMENTED

**Frontend Expects:**
- `rating` and `reviewCount` in service response
- These fields exist in types but not used in Phase 1

**Required:**
```
❌ ratings table migration
❌ Rating model
❌ Relationship in Service model
❌ Calculation methods for average rating
```

---

### 9. **Service Request Endpoints**
**Status:** ✅ EXISTS (but Phase 2 frontend not built yet)

**Backend Has:**
```php
✅ Route::apiResource('service-requests', ServiceRequestController::class);
✅ Comments endpoints
✅ Media upload endpoints
```

**Frontend Status:**
```
⏳ Phase 2 not yet implemented
⏳ API client methods defined but not used
```

---

### 10. **Profile Management**
**Status:** ✅ EXISTS (but Phase 2 frontend not built yet)

**Backend Has:**
```php
✅ ProfileController with show, update, uploadAvatar
```

**Frontend Status:**
```
⏳ Phase 2 not yet implemented
⏳ API client methods defined
```

---

## 📊 Database Gaps

### ✅ COMPLETE
- [x] categories table
- [x] services.category_id foreign key
- [x] Category model
- [x] Service-Category relationship
- [x] CategorySeeder with 8 categories
- [x] ServiceSeeder with 14 services

### ❌ MISSING (for future features)
- [ ] ratings table (for rating/review system)
- [ ] Rating model
- [ ] Service image storage strategy (currently just icon field)

---

## 🎯 Implementation Priority

### **IMMEDIATE (Blocking Current Frontend)**
1. ✅ Create CategoryController
2. ✅ Create CategoryResource
3. ✅ Add category routes (public)
4. ✅ Move service GET routes to public
5. ✅ Add ServiceController@featured
6. ✅ Create ServiceResource with proper transformation
7. ✅ Add logout endpoint

### **SOON (Phase 1 Enhancement)**
8. ⏳ Add service search endpoint
9. ⏳ Enhance service filtering in index method

### **LATER (Phase 2+)**
10. ⏳ Ratings system (when needed for Phase 2)
11. ⏳ Service request flow (backend exists, awaiting frontend)

---

## 📝 Summary

### Working Currently:
- ✅ Authentication (OTP login/verify)
- ✅ User management
- ✅ Service requests backend (unused)
- ✅ Comments/Media (unused)

### Broken/Missing:
- ❌ Category browsing (no API)
- ❌ Service browsing (behind auth wall)
- ❌ Featured services (no endpoint)
- ❌ Proper service response format (no Resource)
- ❌ Logout (no endpoint)

### Impact:
**Without fixing the critical issues, the customer web app homepage will:**
- Show hardcoded categories (stale data)
- Show mock featured services (wrong data)
- Users can't browse actual services
- Users can't logout properly
- Categories don't link to real services

---

## 🔧 Files to Create

```
New Files Needed:
├── app/Http/Controllers/Api/CategoryController.php
├── app/Http/Resources/CategoryResource.php
├── app/Http/Resources/ServiceResource.php
└── routes/api.php (modifications)

Existing Files to Modify:
├── app/Http/Controllers/Api/ServiceController.php (add featured method)
├── app/Http/Controllers/Auth/AuthController.php (add logout method)
└── app/Models/Service.php (add rating calculation methods)
```

---

**Next Action:** Implement all critical items to make the current frontend fully functional.
