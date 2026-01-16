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
        $this->authorize('viewAny', Service::class);

        $query = Service::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = min((int) ($request->per_page ?? 15), 100); // Max 100 per page
        $services = $query->latest()->paginate($perPage);

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
        $this->authorize('view', $service);

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
