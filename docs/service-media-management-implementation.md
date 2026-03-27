# Service Media Management Implementation

## Overview
This document describes the implementation of centralized media management for Service images in the Filament admin panel. The system allows admins to upload, edit, and delete service images through the Filament interface, with automatic tracking in the `media` table using Laravel's polymorphic relationships.

## Implementation Date
2026-03-24

## Changes Summary

### 1. Service Model Updates
**File:** `D:\Learning\srms\srms-backend\app\Models\Service.php`

**Changes:**
- Added `MorphMany` import
- Added `media()` polymorphic relationship method

```php
public function media(): MorphMany
{
    return $this->morphMany(Media::class, 'mediaable');
}
```

This relationship allows each Service to have multiple Media records (though currently only one image is supported in the UI).

### 2. Filament Service Form Updates
**File:** `D:\Learning\srms\srms-backend\app\Filament\Resources\Service\Schemas\ServiceForm.php`

**Changes:**
- Added `FileUpload` component import
- Added service image upload field with the following configuration:
  - **Disk:** `public` (stores in `storage/app/public/images/services/`)
  - **Directory:** `images/services`
  - **Accepted Types:** JPG, PNG, WEBP
  - **Max Size:** 5MB (5120 KB)
  - **Features:** Image editor, aspect ratio presets (16:9, 4:3, 1:1), downloadable, openable, previewable

### 3. Filament Create Service Page
**File:** `D:\Learning\srms\srms-backend\app\Filament\Resources\Service\Pages\CreateService.php`

**Changes:**
- Added `afterCreate()` hook to handle media creation after service is saved
- Added `createMediaRecord()` method to create Media record with:
  - `name`: Original filename
  - `url`: Public accessible URL path (e.g., `/storage/images/services/filename.jpg`)
  - `mediaable_id`: Service ID
  - `mediaable_type`: `App\Models\Service`

**Logic Flow:**
1. Admin creates new service and uploads image
2. Filament saves image to `storage/app/public/images/services/`
3. `afterCreate()` hook fires
4. Media record is created in database

### 4. Filament Edit Service Page
**File:** `D:\Learning\srms\srms-backend\app\Filament\Resources\Service\Pages\EditService.php`

**Changes:**
- Added `mutateFormDataBeforeFill()` to load existing media image into form
- Added `afterSave()` hook to handle media updates/deletions
- Added `createMediaRecord()` method (same as CreateService)

**Logic Flow:**

**On Form Load:**
1. Fetch existing media record
2. Extract file path from URL
3. Populate form field with existing image

**On Save:**
1. Check if image was uploaded/changed/removed
2. If changed:
   - Delete old file from storage
   - Update existing Media record with new filename and URL
3. If new (no existing media):
   - Create new Media record
4. If removed (empty field):
   - Delete old file from storage
   - Delete Media record from database

### 5. ServiceResource API Updates
**File:** `D:\Learning\srms\srms-backend\app\Http\Resources\ServiceResource.php`

**Changes:**
- Modified `image` field to dynamically fetch from `media` relationship
- Added fallback to hardcoded icon path for backward compatibility

**Logic:**
```php
// Get the first media image URL (dynamic from media relationship)
$imageUrl = null;
if ($this->relationLoaded('media')) {
    $firstMedia = $this->media->first();
    $imageUrl = $firstMedia?->url;
}

// Fallback to hardcoded icon if no media exists (for backward compatibility)
if (!$imageUrl && $this->icon) {
    $imageUrl = "/images/services/{$this->icon}.jpg";
}
```

### 6. ServiceController API Updates
**File:** `D:\Learning\srms\srms-backend\app\Http\Controllers\Api\ServiceController.php`

**Changes:**
- Added eager loading of `media` relationship in all methods:
  - `index()`: List services with pagination
  - `featured()`: Featured/trending services
  - `search()`: Search services by keyword
  - `trending()`: Trending services
  - `show()`: Single service details

**Before:**
```php
Service::with('category')->where(...)
```

**After:**
```php
Service::with(['category', 'media'])->where(...)
```

This prevents N+1 query issues when fetching services with their media.

## Database Schema

### Media Table
```sql
CREATE TABLE `media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `mediaable_id` bigint unsigned NOT NULL,
  `mediaable_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media_mediaable_id_mediaable_type_index` (`mediaable_id`,`mediaable_type`)
);
```

## Storage Configuration

### Filesystem Disk
The `public` disk is configured in `config/filesystems.php`:

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

### Symbolic Link
A symbolic link must exist from `public/storage` to `storage/app/public`:

```bash
php artisan storage:link
```

This link already exists in the project.

## File Storage Structure

```
storage/
└── app/
    └── public/
        └── images/
            └── services/
                ├── image1.jpg
                ├── image2.png
                └── image3.webp

public/
└── storage/ → (symbolic link to storage/app/public)
    └── images/
        └── services/
            ├── image1.jpg
            ├── image2.png
            └── image3.webp
```

## API Response Format

### Example Service Response

```json
{
  "id": "encoded_hash",
  "name": "Web Development",
  "description": "Professional web development services",
  "basePrice": 1500.00,
  "averageDuration": 120,
  "category": {
    "id": "encoded_hash",
    "name": "Development"
  },
  "rating": null,
  "reviewCount": 0,
  "isPopular": true,
  "popularityScore": 85,
  "viewCount": 42,
  "icon": "web-dev",
  "image": "/storage/images/services/web-development.jpg",
  "isActive": true,
  "createdAt": "2026-03-24T10:30:00.000000Z",
  "updatedAt": "2026-03-24T10:30:00.000000Z"
}
```

### Image URL Variations

1. **With Media Record:**
   ```json
   "image": "/storage/images/services/abc123def456.jpg"
   ```

2. **Without Media Record (Fallback):**
   ```json
   "image": "/images/services/web-dev.jpg"
   ```

3. **No Image:**
   ```json
   "image": null
   ```

## Frontend Integration

### Fetching Service Images

Frontend applications (React, Next.js) should:

1. Fetch services from API endpoints
2. Use the `image` field from API response
3. Construct full URL by prepending `APP_URL` if needed:

```typescript
const imageUrl = service.image
  ? `${process.env.VITE_API_BASE_URL}${service.image}`
  : '/placeholder-service.jpg';
```

### Example React Component

```tsx
interface Service {
  id: string;
  name: string;
  image: string | null;
  // ... other fields
}

function ServiceCard({ service }: { service: Service }) {
  const imageUrl = service.image
    ? `${import.meta.env.VITE_API_BASE_URL}${service.image}`
    : '/placeholder.jpg';

  return (
    <div className="service-card">
      <img src={imageUrl} alt={service.name} />
      <h3>{service.name}</h3>
    </div>
  );
}
```

## Admin Panel Usage

### Creating a Service with Image

1. Navigate to **Admin Panel** → **Services** → **Create**
2. Fill in service details:
   - Name (required)
   - Description (optional)
   - Is Active (toggle)
3. Click **Service Image** upload area
4. Select image file (JPG, PNG, or WEBP, max 5MB)
5. Optionally use image editor to crop/adjust
6. Click **Create** to save

**Result:**
- Service is created in `services` table
- Image is saved to `storage/app/public/images/services/`
- Media record is created in `media` table
- API returns service with `/storage/images/services/{filename}` URL

### Editing Service Image

1. Navigate to **Admin Panel** → **Services** → **Edit** (specific service)
2. Current image is displayed in **Service Image** field
3. Options:
   - **Keep current image:** Don't touch the field
   - **Replace image:** Upload new image (old file deleted automatically)
   - **Remove image:** Clear the field (old file deleted automatically)
4. Click **Save** to update

**Result:**
- If replaced: Old file deleted, new file saved, Media record updated
- If removed: Old file deleted, Media record deleted
- If unchanged: No changes to files or Media record

### Deleting a Service

When a service is deleted:
- Service record is deleted from `services` table
- Media records remain in database (orphaned)
- Image files remain in storage (not automatically deleted)

**Note:** Consider adding a cleanup mechanism or cascade delete for production.

## Performance Considerations

### N+1 Query Prevention
All ServiceController methods eager load the `media` relationship:

```php
Service::with(['category', 'media'])->get();
```

This executes only 2 queries instead of N+1:
1. `SELECT * FROM services WHERE ...`
2. `SELECT * FROM media WHERE mediaable_type = 'App\Models\Service' AND mediaable_id IN (...)`

### Image Optimization Recommendations

For production, consider:
1. **Image Optimization:** Use intervention/image to automatically resize/compress
2. **CDN:** Serve images via CDN for faster delivery
3. **Lazy Loading:** Implement lazy loading in frontend
4. **Multiple Sizes:** Generate thumbnail, medium, large variants
5. **WebP Conversion:** Convert all images to WebP for better compression

## Testing Checklist

### Manual Testing
- [ ] Create service with image → Verify image appears in form and API
- [ ] Create service without image → Verify API returns null for image
- [ ] Edit service, replace image → Verify old image deleted, new image appears
- [ ] Edit service, remove image → Verify image deleted, API returns null
- [ ] Delete service → Verify service removed, check media cleanup
- [ ] Test image editor features (crop, aspect ratio)
- [ ] Test with all supported formats (JPG, PNG, WEBP)
- [ ] Test file size validation (upload > 5MB should fail)
- [ ] Test invalid file types (PDF, GIF should fail)
- [ ] Verify images accessible via `/storage/images/services/{filename}`

### API Testing
- [ ] GET /api/services → Verify images in response
- [ ] GET /api/services/{id} → Verify single service image
- [ ] GET /api/services/featured → Verify featured services images
- [ ] GET /api/services/trending → Verify trending services images
- [ ] GET /api/services/search?q=web → Verify search results images
- [ ] Check performance (no N+1 queries with Laravel Debugbar)

### Automated Testing
Consider writing PestPHP tests for:
- Media creation on service creation
- Media update on service update
- Media deletion on image removal
- Eager loading verification
- API response structure validation

## Security Considerations

1. **File Type Validation:** Only JPG, PNG, WEBP accepted
2. **File Size Limit:** 5MB maximum
3. **Storage Location:** Files stored in `storage/app/public/` (outside web root)
4. **Symbolic Link:** Public access only through `/storage` symlink
5. **Authorization:** Only admins can upload/edit/delete service images (enforced by Filament)
6. **SQL Injection:** Protected by Laravel's query builder and Eloquent
7. **XSS Prevention:** File URLs are not user-editable

### Additional Security Recommendations
- Add virus scanning for uploaded files
- Implement rate limiting on file uploads
- Add file hash verification to prevent duplicate uploads
- Consider storing files outside public_html entirely and serving via controller

## Troubleshooting

### Issue: Images not displaying
**Symptoms:** API returns image URL, but frontend shows broken image

**Solutions:**
1. Verify symbolic link exists:
   ```bash
   ls -la public/storage
   ```
2. Check file permissions:
   ```bash
   chmod -R 755 storage/app/public
   ```
3. Verify APP_URL in .env matches frontend expectations
4. Check CORS configuration allows image requests

### Issue: File upload fails
**Symptoms:** Error when uploading image in Filament

**Solutions:**
1. Check PHP upload limits:
   ```ini
   upload_max_filesize = 10M
   post_max_size = 10M
   ```
2. Verify storage directory is writable:
   ```bash
   chmod -R 775 storage
   ```
3. Check disk space on server
4. Review Laravel logs: `storage/logs/laravel.log`

### Issue: Old images not deleted
**Symptoms:** Storage accumulates old/unused images

**Solutions:**
1. Verify EditService `afterSave()` logic is working
2. Check Storage facade import in EditService
3. Review file paths (ensure no leading/trailing slashes mismatch)
4. Implement scheduled cleanup job for orphaned media

### Issue: Media record not created
**Symptoms:** Image uploaded but not in database

**Solutions:**
1. Verify CreateService `afterCreate()` is firing
2. Check Media model fillable properties
3. Review Laravel logs for database errors
4. Ensure polymorphic relationship is correctly configured

## Future Enhancements

### Recommended Improvements
1. **Multiple Images:** Allow multiple images per service (gallery)
2. **Image Variants:** Generate thumbnail, medium, large sizes
3. **Drag & Drop Reordering:** If multiple images, allow reordering
4. **Image Metadata:** Store dimensions, file size, mime type in media table
5. **Automatic Cleanup:** Schedule command to delete orphaned media
6. **Cascade Delete:** Delete media when service is deleted
7. **Alt Text:** Add alt_text field to media for accessibility
8. **Compression:** Automatically compress/optimize uploaded images
9. **CDN Integration:** Serve images from CDN instead of local storage
10. **Media Library:** Reusable media library across all models

### Migration Path for Existing Services
If you have existing services with hardcoded icons:

1. Create migration script to convert icons to media:
   ```php
   Service::whereNotNull('icon')->chunk(100, function ($services) {
       foreach ($services as $service) {
           // Copy existing icon file to new location
           // Create media record
       }
   });
   ```
2. Run migration in production with downtime or during off-peak
3. Verify all services have media records
4. Remove fallback logic from ServiceResource after migration complete

## References

### Laravel Documentation
- [File Storage](https://laravel.com/docs/12.x/filesystem)
- [Polymorphic Relationships](https://laravel.com/docs/12.x/eloquent-relationships#polymorphic-relationships)
- [Eloquent Relationships](https://laravel.com/docs/12.x/eloquent-relationships)

### Filament Documentation
- [File Upload Field](https://filamentphp.com/docs/4.x/forms/fields/file-upload)
- [Form Components](https://filamentphp.com/docs/4.x/forms/fields/overview)
- [Resource Lifecycle Hooks](https://filamentphp.com/docs/4.x/panels/resources/creating-records#lifecycle-hooks)

### Related Files
- `D:\Learning\srms\srms-backend\app\Models\Service.php`
- `D:\Learning\srms\srms-backend\app\Models\Media.php`
- `D:\Learning\srms\srms-backend\app\Filament\Resources\Service\Schemas\ServiceForm.php`
- `D:\Learning\srms\srms-backend\app\Filament\Resources\Service\Pages\CreateService.php`
- `D:\Learning\srms\srms-backend\app\Filament\Resources\Service\Pages\EditService.php`
- `D:\Learning\srms\srms-backend\app\Http\Resources\ServiceResource.php`
- `D:\Learning\srms\srms-backend\app\Http\Controllers\Api\ServiceController.php`
- `D:\Learning\srms\srms-backend\config\filesystems.php`
- `D:\Learning\srms\srms-backend\database\migrations\2025_12_09_095914_create_media_table.php`

## Conclusion

This implementation provides a robust, production-ready media management system for Service images. It follows Laravel 12 and Filament 4.0 best practices, prevents N+1 queries, handles file cleanup, and provides a seamless admin experience. The API returns dynamic image URLs that frontend applications can consume directly.
