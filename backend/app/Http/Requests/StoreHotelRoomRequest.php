<?php

namespace App\Http\Requests;

use App\Models\HotelRoom;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreHotelRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalise input before validating: "  204a " becomes "204A".
     * (Laravel already turns empty strings into null, so blank optional fields arrive as null.)
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->room_number)) {
            $this->merge(['room_number' => strtoupper(trim($this->room_number))]);
        }
    }

    public function rules(): array
    {
        return [
            'room_number' => ['required', 'string', 'max:10', 'regex:/^[A-Z0-9-]+$/', 'unique:hotel_rooms,room_number'],
            'room_type' => ['required', 'string', Rule::in(HotelRoom::ROOM_TYPES)],
            'nightly_rate' => ['required', 'numeric', 'gt:0', 'max:99999999.99', 'decimal:0,2'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:12'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'room_number.required' => 'Enter a room number.',
            'room_number.regex' => 'Use letters, numbers and dashes only.',
            'room_number.max' => 'Room numbers can be up to 10 characters.',
            'room_number.unique' => 'Room :input is already in the inventory.',
            'room_type.required' => 'Choose a room category.',
            'room_type.in' => 'Choose one of the listed room categories.',
            'nightly_rate.required' => 'Enter the nightly rate.',
            'nightly_rate.numeric' => 'The nightly rate must be a number.',
            'nightly_rate.gt' => 'The nightly rate must be more than zero.',
            'nightly_rate.max' => 'The nightly rate is too large.',
            'nightly_rate.decimal' => 'Use at most two decimal places.',
            'capacity.integer' => 'Capacity must be a whole number of guests.',
            'capacity.min' => 'Capacity must be at least 1 guest.',
            'capacity.max' => 'Capacity can be at most 12 guests.',
            'notes.max' => 'Notes can be up to 500 characters.',
        ];
    }
}
