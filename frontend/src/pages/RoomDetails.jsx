import { Link, useParams } from 'react-router-dom';
import Notice from '../components/Notice.jsx';
import RoomTag from '../components/RoomTag.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getRoom } from '../services/api.js';
import { formatCapacity, formatDateTime, formatRate } from '../services/rooms.js';

function BackButton() {
  return (
    <Link to="/rooms" className="button back-button">
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back to room list
    </Link>
  );
}

export default function RoomDetails() {
  const { id } = useParams();
  const { data: room, error, loading, reload } = useApi((signal) => getRoom(id, signal), [id]);
  useDocumentTitle(room ? `Room ${room.room_number}` : 'Room details');

  const notFound = error?.status === 404;

  return (
    <>
      <div className="details-nav">
        <BackButton />
      </div>

      {loading && (
        <div className="sheet sheet--placeholder" role="status">
          <p className="ledger__loading">Loading room details…</p>
        </div>
      )}

      {notFound && (
        <Notice tone="error" title="Room not found.">
          No room with record ID {id} exists in the inventory. It may never have been added, or the link is incorrect.
        </Notice>
      )}

      {error && !notFound && (
        <Notice
          tone="error"
          title="The room details could not be loaded."
          actions={
            <button type="button" className="button" onClick={reload}>
              Try again
            </button>
          }
        >
          {error.message}
        </Notice>
      )}

      {room && !loading && (
        <article className="sheet">
          <header className="sheet__head">
            <RoomTag number={room.room_number} size="large" />
            <div>
              <h1 className="sheet__title">{room.room_type}</h1>
              <p className="sheet__rate">
                {formatRate(room.nightly_rate)} <span className="muted">per night</span>
              </p>
            </div>
          </header>

          <dl className="facts">
            <div className="facts__row">
              <dt>Room number</dt>
              <dd className="mono">{room.room_number}</dd>
            </div>
            <div className="facts__row">
              <dt>Category</dt>
              <dd>{room.room_type}</dd>
            </div>
            <div className="facts__row">
              <dt>Nightly rate</dt>
              <dd>{formatRate(room.nightly_rate)}</dd>
            </div>
            <div className="facts__row">
              <dt>Capacity</dt>
              <dd>{formatCapacity(room.capacity) ?? <span className="muted">Not recorded</span>}</dd>
            </div>
            <div className="facts__row">
              <dt>Notes</dt>
              <dd className="facts__notes">{room.notes || <span className="muted">No notes</span>}</dd>
            </div>
            <div className="facts__row">
              <dt>Record ID</dt>
              <dd>{room.id}</dd>
            </div>
            <div className="facts__row">
              <dt>Added</dt>
              <dd>{formatDateTime(room.created_at)}</dd>
            </div>
            <div className="facts__row">
              <dt>Last updated</dt>
              <dd>{formatDateTime(room.updated_at)}</dd>
            </div>
          </dl>
        </article>
      )}
    </>
  );
}
