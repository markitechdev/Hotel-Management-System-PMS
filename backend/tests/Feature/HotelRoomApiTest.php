<?php

namespace Tests\Feature;

use App\Models\HotelRoom;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelRoomApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_rooms_from_the_database(): void
    {
        HotelRoom::create(['room_number' => '1001', 'room_type' => 'Penthouse', 'nightly_rate' => 15000]);
        HotelRoom::create(['room_number' => '201', 'room_type' => 'Standard Single', 'nightly_rate' => 1800]);

        $this->getJson('/api/rooms')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.room_number', '201')
            ->assertJsonPath('data.1.room_number', '1001');
    }

    public function test_it_creates_a_room(): void
    {
        $this->postJson('/api/rooms', [
            'room_number' => ' 305b ',
            'room_type' => 'Deluxe Double',
            'nightly_rate' => 3250.5,
            'capacity' => 2,
        ])
            ->assertCreated()
            ->assertJsonPath('data.room_number', '305B')
            ->assertJsonPath('data.nightly_rate', 3250.5)
            ->assertJsonPath('data.capacity', 2);

        $this->assertDatabaseHas('hotel_rooms', ['room_number' => '305B', 'room_type' => 'Deluxe Double']);
    }

    public function test_it_rejects_invalid_rooms(): void
    {
        $this->postJson('/api/rooms', [
            'room_number' => '',
            'room_type' => 'Broom Closet',
            'nightly_rate' => -5,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['room_number', 'room_type', 'nightly_rate']);

        $this->assertDatabaseCount('hotel_rooms', 0);
    }

    public function test_it_rejects_a_duplicate_room_number(): void
    {
        HotelRoom::create(['room_number' => '101', 'room_type' => 'Standard Single', 'nightly_rate' => 1800]);

        $this->postJson('/api/rooms', [
            'room_number' => '101',
            'room_type' => 'Deluxe Double',
            'nightly_rate' => 2500,
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['room_number']);
    }

    public function test_it_shows_one_room(): void
    {
        $room = HotelRoom::create(['room_number' => '402', 'room_type' => 'Executive Suite', 'nightly_rate' => 7200]);

        $this->getJson("/api/rooms/{$room->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $room->id)
            ->assertJsonPath('data.room_type', 'Executive Suite');
    }

    public function test_it_returns_404_for_a_missing_room(): void
    {
        $this->getJson('/api/rooms/999')
            ->assertNotFound()
            ->assertJsonPath('message', 'Room not found.');

        $this->getJson('/api/rooms/abc')->assertNotFound();
    }

    public function test_the_health_check_reports_the_database(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('rooms_stored', 0);
    }
}
