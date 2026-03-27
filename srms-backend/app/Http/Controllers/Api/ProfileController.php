<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\Media;
use App\Services\HashidsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(Request $request): UserResource
    {
        return new UserResource($request->user()->load(['role', 'avatar']));
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());

        return new UserResource($user->load(['role', 'avatar']));
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        // Verify current password
        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
                'errors' => [
                    'current_password' => ['Current password is incorrect'],
                ],
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
        ], 200);
    }

    /**
     * Upload or update the authenticated user's profile picture.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:5120', // 5MB max
        ]);

        $user = $request->user();
        $hashidsService = app(HashidsService::class);

        // Delete existing avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar->url);
            $user->avatar->delete();
        }

        // Store new avatar
        $file = $request->file('avatar');
        $fileName = 'avatar_'.$user->id.'_'.time().'.'.$file->getClientOriginalExtension();
        $filePath = $file->storeAs('avatars', $fileName, 'public');

        // Create media record
        $media = new Media([
            'name' => $fileName,
            'url' => $filePath,
        ]);

        $user->avatar()->save($media);

        return response()->json([
            'message' => 'Profile picture uploaded successfully',
            'avatar' => [
                'id' => $hashidsService->encode($media->id),
                'name' => $media->name,
                'url' => config('app.url').Storage::url($media->url),
            ],
        ], 200);
    }

    /**
     * Delete the authenticated user's profile picture.
     */
    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->avatar) {
            return response()->json([
                'message' => 'No profile picture to delete',
            ], 404);
        }

        // Delete file from storage
        Storage::disk('public')->delete($user->avatar->url);

        // Delete media record
        $user->avatar->delete();

        return response()->json([
            'message' => 'Profile picture deleted successfully',
        ], 200);
    }
}
