<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\ServiceRequest;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload a file attachment to a service request.
     */
    public function store(Request $request, ServiceRequest $serviceRequest): JsonResponse
    {
        // Check if user can view the service request (to add attachments)
        $this->authorize('view', $serviceRequest);

        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx,txt'], // Max 10MB
        ]);

        $user = Auth::user();
        $file = $request->file('file');
        $fileName = Str::random(40).'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('service-requests/'.$serviceRequest->id, $fileName, 'public');

        $media = Media::create([
            'name' => $file->getClientOriginalName(),
            'url' => Storage::url($path),
            'mediaable_id' => $serviceRequest->id,
            'mediaable_type' => ServiceRequest::class,
        ]);

        // Log activity
        ActivityLogService::logCreated($user, $media, [
            'service_request_id' => $serviceRequest->id,
            'file_name' => $file->getClientOriginalName(),
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'data' => [
                'id' => app(\App\Services\HashidsService::class)->encode($media->id),
                'name' => $media->name,
                'url' => $media->url,
            ],
        ], 201);
    }

    /**
     * Download/view a file attachment.
     */
    public function show(ServiceRequest $serviceRequest, Media $media)
    {
        // Verify media belongs to service request
        if ($media->mediaable_id !== $serviceRequest->id || $media->mediaable_type !== ServiceRequest::class) {
            abort(404, 'Media not found for this service request.');
        }

        $this->authorize('view', $media);

        $path = str_replace('/storage/', '', $media->url);
        $filePath = storage_path('app/public/'.$path);

        if (! file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $media->name);
    }

    /**
     * Delete a file attachment.
     */
    public function destroy(ServiceRequest $serviceRequest, Media $media): JsonResponse
    {
        // Verify media belongs to service request
        if ($media->mediaable_id !== $serviceRequest->id || $media->mediaable_type !== ServiceRequest::class) {
            abort(404, 'Media not found for this service request.');
        }

        $this->authorize('delete', $media);

        $user = Auth::user();

        // Delete file from storage
        $path = str_replace('/storage/', '', $media->url);
        Storage::disk('public')->delete($path);

        // Log activity before deletion
        ActivityLogService::logDeleted($user, $media, [
            'service_request_id' => $serviceRequest->id,
            'file_name' => $media->name,
        ]);

        $media->delete();

        return response()->json([
            'message' => 'File deleted successfully',
        ], 200);
    }
}
