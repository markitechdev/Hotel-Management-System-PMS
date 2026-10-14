// A room number drawn as a hotel key fob: the identifier used across the whole interface.
export default function RoomTag({ number, size = 'regular' }) {
  const isEmpty = !number;
  return (
    <span className={`room-tag room-tag--${size}${isEmpty ? ' room-tag--empty' : ''}`}>
      <span className="room-tag__hole" aria-hidden="true" />
      <span className="room-tag__number">{isEmpty ? '—' : number}</span>
    </span>
  );
}
