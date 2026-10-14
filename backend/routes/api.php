<?php

use App\Http\Controllers\HotelRoomController;
use App\Models\HotelRoom;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/rooms', [HotelRoomController::class, 'index']);
Route::post('/rooms', [HotelRoomController::class, 'store']);
Route::get('/rooms/{id}', [HotelRoomController::class, 'show'])->whereNumber('id');

// Confirms the API can reach the cloud database. Used for deployment checks and persistence evidence.
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();

        return response()->json([
            'status' => 'ok',
            'database' => DB::connection()->getDriverName(),
            'rooms_stored' => HotelRoom::count(),
            'checked_at' => now()->toIso8601String(),
        ]);
    } catch (Throwable $e) {
        report($e);

        return response()->json([
            'status' => 'error',
            'message' => 'The API is running but cannot reach the database.',
        ], 503);
    }
});

Route::fallback(fn () => response()->json(['message' => 'Endpoint not found.'], 404));
