import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateLink from './pages/CreateLink';
import LinkDetail from './pages/LinkDetail';
import { getToken } from './api/client';

function Home() {
  const token = getToken();
  if (token) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateLink />
              </ProtectedRoute>
            }
          />
          <Route
            path="/link/:id"
            element={
              <ProtectedRoute>
                <LinkDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
