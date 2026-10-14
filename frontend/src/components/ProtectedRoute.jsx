import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

// Wraps every PMS screen. Visitors who are not signed in are sent to the login page.
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
