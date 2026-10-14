<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHotelRoomRequest;
use App\Http\Resources\HotelRoomResource;
use App\Models\HotelRoom;
use Illuminate\Http\JsonResponse;

class HotelRoomController extends Controller
{
    /**
     * GET /api/rooms — every room, ordered so "201" comes before "1001".
     */
    public function index(): JsonResponse
    {
        $rooms = HotelRoom::query()
            ->orderByRaw('LENGTH(room_number)')
            ->orderBy('room_number')
            ->get();

        return HotelRoomResource::collection($rooms)->response();
    }

    /**
     * POST /api/rooms — validate, save to the database, return the new room with 201 Created.
     */
    public function store(StoreHotelRoomRequest $request): JsonResponse
    {
        $room = HotelRoom::create($request->validated());

        return (new HotelRoomResource($room))
            ->additional(['message' => "Room {$room->room_number} was added."])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/rooms/{id} — one room, or 404 if it does not exist.
     */
    public function show(string $id): JsonResponse
    {
        // The route only matches digits; the length check keeps oversized ids away from the bigint column.
        $room = strlen($id) <= 18 ? HotelRoom::find($id) : null;

        if (! $room) {
            return response()->json(['message' => 'Room not found.'], 404);
        }

        return (new HotelRoomResource($room))->response();
    }
}
