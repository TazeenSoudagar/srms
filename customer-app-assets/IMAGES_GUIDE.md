# Service Images Guide for SRMS Customer App

## High-Resolution Service Images

Since Unsplash requires direct downloads from their website, I've prepared this guide with curated Unsplash image IDs that you can use in your Next.js application.

### How to Use These Images

#### Option 1: Use Unsplash Source API (Recommended for Development)
```typescript
// Direct URL format:
https://source.unsplash.com/{IMAGE_ID}/{WIDTH}x{HEIGHT}

// Example in Next.js Image component:
<Image
  src="https://source.unsplash.com/bvEF-ArVnw0/800x600"
  alt="Plumbing service"
  width={800}
  height={600}
/>
```

#### Option 2: Download from Unsplash (Recommended for Production)
1. Visit the URL: `https://unsplash.com/photos/{IMAGE_ID}`
2. Click the "Download free" button
3. Save to `public/images/services/` folder
4. Use local path in your app

---

## Curated Service Images

### 1. Plumbing Services

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| Professional plumber fixing kitchen sink | `bvEF-ArVnw0` | https://unsplash.com/photos/bvEF-ArVnw0 | Service card, hero |
| Two plumbers repairing pipes in lavatory | `XGeQd774yvU` | https://unsplash.com/photos/XGeQd774yvU | Service detail page |
| Young plumber repairing pipes | `9y3T0UG0yoY` | https://unsplash.com/photos/9y3T0UG0yoY | Category thumbnail |
| Plumber fixing toilet equipment | `4A5PsPkXAnw` | https://unsplash.com/photos/4A5PsPkXAnw | Service detail |

**Attribution:** Photos by Getty Images, Unsplash

---

### 2. Electrical Services

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| Electrician working on circuit box | `5siQcvSxCP8` | https://unsplash.com/photos/5siQcvSxCP8 | Service card |
| Electrical wiring installation | `EMPZ7yRZoGw` | https://unsplash.com/photos/EMPZ7yRZoGw | Service detail |
| Professional electrician with tools | `pMW4jzELQCw` | https://unsplash.com/photos/pMW4jzELQCw | Category thumbnail |

**Attribution:** Photos by Unsplash contributors

---

### 3. Cleaning Services

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| Professional cleaner mopping floor | `_KaMTEmJnxY` | https://unsplash.com/photos/_KaMTEmJnxY | Service card |
| Bathroom deep cleaning | `4V8JxijgZ_c` | https://unsplash.com/photos/4V8JxijgZ_c | Service detail |
| Kitchen cleaning service | `505eectW54k` | https://unsplash.com/photos/505eectW54k | Category thumbnail |
| Vacuum cleaning carpet | `376KN_ISplE` | https://unsplash.com/photos/376KN_ISplE | Service card |

**Attribution:** Photos by Unsplash contributors

---

### 4. Carpentry Services

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| Carpenter working on wood | `nApaSgkzaxg` | https://unsplash.com/photos/nApaSgkzaxg | Service card |
| Furniture assembly | `505eectW54k` | https://unsplash.com/photos/505eectW54k | Service detail |
| Woodworking professional | `FlHdnPO6dlw` | https://unsplash.com/photos/FlHdnPO6dlw | Category thumbnail |

**Attribution:** Photos by Unsplash contributors

---

### 5. Painting Services

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| Professional painter painting wall | `7JX0-bfiuxQ` | https://unsplash.com/photos/7JX0-bfiuxQ | Service card |
| Interior wall painting | `1K6IQsQbizI` | https://unsplash.com/photos/1K6IQsQbizI | Service detail |
| Paint roller on wall | `nBuSV8NY8Uk` | https://unsplash.com/photos/nBuSV8NY8Uk | Category thumbnail |

**Attribution:** Photos by Unsplash contributors

---

### 6. Appliance Repair (AC, Washing Machine, etc.)

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| AC technician servicing unit | `FlHdnPO6dlw` | https://unsplash.com/photos/FlHdnPO6dlw | Service card |
| Appliance repair professional | `rymh7EZPqRs` | https://unsplash.com/photos/rymh7EZPqRs | Service detail |
| Washing machine repair | `Zyx1bK9mqmA` | https://unsplash.com/photos/Zyx1bK9mqmA | Category thumbnail |

**Attribution:** Photos by Unsplash contributors

---

### 7. Beauty & Salon Services

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| Professional salon haircut | `OgvqXGL7XO4` | https://unsplash.com/photos/OgvqXGL7XO4 | Service card |
| Spa massage service | `KEDp3dxL3vE` | https://unsplash.com/photos/KEDp3dxL3vE | Service detail |
| Beauty treatment | `9UXQvNfRe-c` | https://unsplash.com/photos/9UXQvNfRe-c | Category thumbnail |

**Attribution:** Photos by Unsplash contributors

---

### 8. Pest Control Services

| Image Description | Unsplash ID | Direct View URL | Best For |
|-------------------|-------------|-----------------|----------|
| Pest control professional spraying | `NrZYYb6Hlyc` | https://unsplash.com/photos/NrZYYb6Hlyc | Service card |
| Pest control service | `8JG8G6l8HHE` | https://unsplash.com/photos/8JG8G6l8HHE | Service detail |

**Attribution:** Photos by Unsplash contributors

---

## Alternative Image Sources (Free & Commercial Use)

### 1. Pexels
- URL: https://www.pexels.com/
- License: Free for commercial use, no attribution required
- Search terms: "plumbing service", "electrician professional", "cleaning service", etc.

### 2. Pixabay
- URL: https://pixabay.com/
- License: Free for commercial use, no attribution required
- High-quality images with easy download

### 3. Freepik
- URL: https://www.freepik.com/
- License: Free with attribution, or Premium
- Great for illustrations and graphics

---

## Quick Download Script

For quick setup, run this PowerShell script to download images:

```powershell
# download-images.ps1
$images = @(
    @{id="bvEF-ArVnw0"; name="plumbing-1.jpg"},
    @{id="XGeQd774yvU"; name="plumbing-2.jpg"},
    @{id="5siQcvSxCP8"; name="electrical-1.jpg"},
    @{id="_KaMTEmJnxY"; name="cleaning-1.jpg"},
    @{id="nApaSgkzaxg"; name="carpentry-1.jpg"},
    @{id="7JX0-bfiuxQ"; name="painting-1.jpg"}
)

foreach ($img in $images) {
    $url = "https://source.unsplash.com/$($img.id)/1920x1080"
    $output = "customer-app-assets/images/services/$($img.name)"
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host "Downloaded: $($img.name)"
}
```

---

## Placeholder Images (For Development)

Use these placeholders while developing:

```typescript
// Service placeholder images
export const SERVICE_IMAGES = {
  plumbing: 'https://source.unsplash.com/bvEF-ArVnw0/800x600',
  electrical: 'https://source.unsplash.com/5siQcvSxCP8/800x600',
  cleaning: 'https://source.unsplash.com/_KaMTEmJnxY/800x600',
  carpentry: 'https://source.unsplash.com/nApaSgkzaxg/800x600',
  painting: 'https://source.unsplash.com/7JX0-bfiuxQ/800x600',
  appliance: 'https://source.unsplash.com/FlHdnPO6dlw/800x600',
  beauty: 'https://source.unsplash.com/OgvqXGL7XO4/800x600',
  pestControl: 'https://source.unsplash.com/NrZYYb6Hlyc/800x600',
};
```

---

## Image Optimization Tips

### For Next.js:
1. Always use the `next/image` component for automatic optimization
2. Specify width and height to prevent layout shift
3. Use `loading="lazy"` for below-the-fold images
4. Compress images before uploading (TinyPNG, ImageOptim)

### Recommended Image Specifications:
- **Service cards:** 800x600px (4:3 ratio)
- **Hero images:** 1920x1080px (16:9 ratio)
- **Category thumbnails:** 400x400px (1:1 ratio)
- **Format:** WebP for production, JPEG for fallback
- **Quality:** 80-85% for good balance

---

## Attribution Requirements

### Unsplash Images:
When using Unsplash images, you must credit the photographer:

```html
<!-- Example attribution -->
Photo by <a href="https://unsplash.com/@photographer">Photographer Name</a> on
<a href="https://unsplash.com">Unsplash</a>
```

Add this in your footer or on individual service pages.

---

## Next Steps

1. **Review the curated image IDs** above
2. **Visit the Unsplash URLs** to download your preferred images
3. **Save images** to `public/images/services/` folder
4. **Update the service data** in your backend/frontend to reference the correct images
5. **Add proper attribution** in your footer

---

**Sources for Image Discovery:**
- [Pexels - Plumbing Services](https://www.pexels.com/search/plumbing/)
- [Unsplash - Professional Services](https://unsplash.com/s/photos/professional-services)
- [Pixabay - Home Services](https://pixabay.com/images/search/home-services/)
- [Freepik - Service Illustrations](https://www.freepik.com/free-photos-vectors/service)

---

Last Updated: 2026-02-27
