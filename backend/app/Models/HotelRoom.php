<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HotelRoom extends Model
{
    /**
     * Room categories the front desk can assign. The React form offers the same list.
     */
    public const ROOM_TYPES = [
        'Standard Single',
        'Deluxe Double',
        'Executive Suite',
        'Penthouse',
    ];

    protected $table = 'hotel_rooms';

    protected $fillable = [
        'room_number',
        'room_type',
        'nightly_rate',
        'capacity',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'nightly_rate' => 'decimal:2',
            'capacity' => 'integer',
        ];
    }
}
