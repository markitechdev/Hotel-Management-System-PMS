import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRoomListArea = pathname.startsWith('/rooms') && pathname !== '/rooms/add';

  function handleSignOut() {
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/rooms" className="brand">
            <span className="brand__fob" aria-hidden="true" />
            Front Desk PMS
          </Link>

          <nav className="topnav" aria-label="Main">
            {/* Room details pages count as part of the room list */}
            <Link
              to="/rooms"
              className={`topnav__link${isRoomListArea ? ' active' : ''}`}
              aria-current={pathname === '/rooms' ? 'page' : undefined}
            >
              Room list
            </Link>
            <NavLink to="/rooms/add" className="topnav__link">
              Add room
            </NavLink>
          </nav>

          <div className="session">
            <span className="session__user">Signed in as {user}</span>
            <button type="button" className="session__signout" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
