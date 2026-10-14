import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import AddRoom from './pages/AddRoom.jsx';
import Login from './pages/Login.jsx';
import RoomDetails from './pages/RoomDetails.jsx';
import RoomList from './pages/RoomList.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/add" element={<AddRoom />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/rooms" replace />} />
    </Routes>
  );
}
