// All communication with the Laravel REST API goes through this file.

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function messageForStatus(status) {
  if (status === 404) return 'The requested record was not found.';
  if (status === 422) return 'Some details need correcting.';
  if (status >= 500) return 'The server ran into a problem. Try again in a moment.';
  return `The request failed (HTTP ${status}).`;
}

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError('The API address is not configured. Set VITE_API_BASE_URL and rebuild the app.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      'Could not reach the room service. Check your connection, or wait a minute if the server is waking up.',
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON body (for example an HTML error page from the host). The status code still tells us enough.
  }

  if (!response.ok) {
    const fieldErrors = {};
    for (const [field, messages] of Object.entries(payload?.errors ?? {})) {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
    }
    throw new ApiError(payload?.message || messageForStatus(response.status), response.status, fieldErrors);
  }

  return payload;
}

export async function getRooms(signal) {
  const payload = await request('/rooms', { signal });
  return payload.data;
}

export async function getRoom(id, signal) {
  const payload = await request(`/rooms/${encodeURIComponent(id)}`, { signal });
  return payload.data;
}

export async function createRoom(room) {
  const payload = await request('/rooms', { method: 'POST', body: room });
  return payload.data;
}
