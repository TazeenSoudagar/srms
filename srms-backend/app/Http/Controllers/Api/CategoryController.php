<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ServiceResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Display a listing of active categories.
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->active()
            ->ordered()
            ->withCount('services')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): CategoryResource
    {
        $category->loadCount('services');

        return new CategoryResource($category);
    }

    /**
     * Get all services for a specific category.
     */
    public function services(Category $category): AnonymousResourceCollection
    {
        $services = $category->services()
            ->with('category')
            ->active()
            ->orderBy('popularity_score', 'desc')
            ->get();

        return ServiceResource::collection($services);
    }
}
