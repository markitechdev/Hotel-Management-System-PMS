// Room categories accepted by the API (kept in step with HotelRoom::ROOM_TYPES in Laravel).
export const ROOM_TYPES = ['Standard Single', 'Deluxe Double', 'Executive Suite', 'Penthouse'];

const pesoFormat = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatRate(value) {
  return pesoFormat.format(Number(value));
}

export function formatDate(iso) {
  return iso ? dateFormat.format(new Date(iso)) : '—';
}

export function formatDateTime(iso) {
  return iso ? dateTimeFormat.format(new Date(iso)) : '—';
}

export function formatCapacity(capacity) {
  if (!capacity) return null;
  return capacity === 1 ? '1 guest' : `${capacity} guests`;
}
