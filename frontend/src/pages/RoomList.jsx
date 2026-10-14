import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import RoomTag from '../components/RoomTag.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getRooms } from '../services/api.js';
import { formatCapacity, formatDate, formatRate } from '../services/rooms.js';

export default function RoomList() {
  useDocumentTitle('Room list');
  const location = useLocation();
  const navigate = useNavigate();
  const { data: rooms, error, loading, reload } = useApi((signal) => getRooms(signal), []);
  const [search, setSearch] = useState('');

  // The Add Room page passes the saved room along so it can be confirmed and highlighted here.
  const [addedRoom, setAddedRoom] = useState(location.state?.addedRoom ?? null);
  useEffect(() => {
    if (location.state?.addedRoom) {
      // Clear it from history so the confirmation does not reappear after a refresh.
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const query = search.trim().toLowerCase();
  const visibleRooms = (rooms ?? []).filter(
    (room) =>
      !query || room.room_number.toLowerCase().includes(query) || room.room_type.toLowerCase().includes(query),
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Room list</h1>
          {rooms && (
            <p className="page-subtitle">
              {rooms.length === 1 ? '1 room' : `${rooms.length} rooms`} in the inventory
            </p>
          )}
        </div>
        {rooms?.length > 0 && (
          <div className="search">
            <label htmlFor="room-search" className="search__label">
              Find a room
            </label>
            <input
              id="room-search"
              className="field__input search__input"
              type="search"
              placeholder="Number or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        )}
      </div>

      {addedRoom && (
        <Notice
          tone="success"
          title={`Room ${addedRoom.room_number} added to the inventory.`}
          actions={
            <button type="button" className="button button--quiet" onClick={() => setAddedRoom(null)}>
              Dismiss
            </button>
          }
        />
      )}

      {loading && !rooms && (
        <div className="ledger ledger--placeholder" role="status">
          <p className="ledger__loading">Loading rooms from the server…</p>
        </div>
      )}

      {error && (
        <Notice
          tone="error"
          title="The room list could not be loaded."
          actions={
            <button type="button" className="button" onClick={reload}>
              Try again
            </button>
          }
        >
          {error.message}
        </Notice>
      )}

      {rooms && rooms.length === 0 && (
        <Notice
          title="No rooms in the inventory yet."
          actions={
            <Link to="/rooms/add" className="button button--primary">
              Add the first room
            </Link>
          }
        >
          Rooms you add are saved to the database and listed here.
        </Notice>
      )}

      {rooms && rooms.length > 0 && (
        <div className="ledger">
          <div className="ledger__head" aria-hidden="true">
            <span>Room</span>
            <span>Category</span>
            <span>Capacity</span>
            <span className="ledger__num">Nightly rate</span>
            <span>Added</span>
          </div>

          {visibleRooms.length === 0 ? (
            <div className="ledger__nomatch">
              <p>No rooms match “{search.trim()}”.</p>
              <button type="button" className="button button--quiet" onClick={() => setSearch('')}>
                Clear search
              </button>
            </div>
          ) : (
            <ul className="ledger__rows">
              {visibleRooms.map((room) => (
                <li key={room.id}>
                  <Link
                    to={`/rooms/${room.id}`}
                    className={`ledger__row${addedRoom?.id === room.id ? ' ledger__row--new' : ''}`}
                  >
                    <span className="ledger__cell ledger__cell--tag">
                      <RoomTag number={room.room_number} />
                    </span>
                    <span className="ledger__cell ledger__cell--type">{room.room_type}</span>
                    <span className="ledger__cell ledger__cell--capacity">
                      {formatCapacity(room.capacity) ?? <span className="muted">Not set</span>}
                    </span>
                    <span className="ledger__cell ledger__num">
                      {formatRate(room.nightly_rate)}
                      <span className="ledger__per"> / night</span>
                    </span>
                    <span className="ledger__cell ledger__cell--date">{formatDate(room.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Link to="/rooms/add" className="fab" aria-label="Add room" title="Add room">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        </svg>
        <span className="fab__label">Add room</span>
      </Link>
    </>
  );
}
