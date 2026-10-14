// Inline message block used for errors, empty states and confirmations. Never a browser alert().
export default function Notice({ tone = 'neutral', title, children, actions }) {
  const isUrgent = tone === 'error';
  return (
    <div className={`notice notice--${tone}`} role={isUrgent ? 'alert' : 'status'}>
      {title && <p className="notice__title">{title}</p>}
      {children && <div className="notice__body">{children}</div>}
      {actions && <div className="notice__actions">{actions}</div>}
    </div>
  );
}
