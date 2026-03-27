<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Allow public access for browsing, but check auth for admin filters
        $isAdmin = Auth::check() && Auth::user()->can('viewAny', Service::class);

        $query = Service::with(['category', 'media'])->where('is_active', true);

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

        // Filter by popular/trending
        if ($request->has('isPopular')) {
            $query->where('is_trending', filter_var($request->isPopular, FILTER_VALIDATE_BOOLEAN));
        }

        // Search functionality
        if ($request->has('search') || $request->has('q')) {
            $search = $request->search ?? $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Admin-only: filter by active status
        if ($isAdmin && $request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Sorting
        $sortBy = $request->input('sortBy', 'name');
        $sortOrder = $request->input('sortOrder', 'asc');

        switch ($sortBy) {
            case 'price':
                $query->orderBy('base_price', $sortOrder);
                break;
            case 'rating':
                $query->orderBy('popularity_score', $sortOrder);
                break;
            case 'popular':
                $query->orderBy('popularity_score', 'desc');
                break;
            default:
                $query->orderBy('name', $sortOrder);
        }

        // Pagination
        $perPage = min((int) ($request->perPage ?? $request->per_page ?? 12), 100);
        $services = $query->paginate($perPage);

        return ServiceResource::collection($services);
    }

    /**
     * Get featured/trending services.
     */
    public function featured(Request $request): AnonymousResourceCollection
    {
        $limit = min((int) ($request->limit ?? 6), 20);

        $services = Service::with(['category', 'media'])
            ->where('is_active', true)
            ->where('is_trending', true)
            ->orderBy('popularity_score', 'desc')
            ->limit($limit)
            ->get();

        return ServiceResource::collection($services);
    }

    /**
     * Search services by keyword.
     */
    public function search(Request $request): AnonymousResourceCollection
    {
        $query = $request->input('q', '');

        $services = Service::with(['category', 'media'])
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->orderBy('popularity_score', 'desc')
            ->limit(20)
            ->get();

        return ServiceResource::collection($services);
    }

    /**
     * Get trending services.
     */
    public function trending(): AnonymousResourceCollection
    {
        $services = Service::with(['category', 'media'])
            ->trending()
            ->limit(10)
            ->get();

        return ServiceResource::collection($services);
    }

    /**
     * Get popular services.
     */
    public function popular(): AnonymousResourceCollection
    {
        $services = Service::with(['category', 'media'])
            ->where('is_active', true)
            ->where('is_popular', true)
            ->orderBy('popularity_score', 'desc')
            ->limit(6)
            ->get();

        return ServiceResource::collection($services);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $this->authorize('create', Service::class);

        $user = Auth::user();
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;

        $service = Service::create($data);

        // Log activity
        ActivityLogService::logCreated($user, $service, [
            'name' => $service->name,
        ]);

        return (new ServiceResource($service))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service): ServiceResource
    {
        // Allow public access to view services
        $service->load(['category', 'media']);
        $service->increment('view_count');

        return new ServiceResource($service);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceRequest $request, Service $service): ServiceResource
    {
        $this->authorize('update', $service);

        $user = Auth::user();
        $oldData = $service->toArray();
        $data = $request->validated();

        // Calculate changed fields before update
        $changedFields = array_keys(array_diff_assoc($data, array_intersect_key($oldData, $data)));

        $service->update($data);

        // Log activity with changed fields
        ActivityLogService::logUpdated($user, $service, [
            'changed_fields' => $changedFields,
        ]);

        return new ServiceResource($service);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $user = Auth::user();

        // Log activity before deletion
        ActivityLogService::logDeleted($user, $service, [
            'name' => $service->name,
        ]);

        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully',
        ], 200);
    }
}
