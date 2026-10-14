<?php

use Illuminate\Support\Facades\Route;

// This service is API-only; the interface is the separate React app.
Route::get('/', fn () => response()->json([
    'service' => 'Hotel PMS API',
    'endpoints' => [
        'GET /api/rooms',
        'POST /api/rooms',
        'GET /api/rooms/{id}',
        'GET /api/health',
    ],
]));
