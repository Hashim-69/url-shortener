import { Link, useNavigate } from 'react-router-dom';
import { clearAuth } from '../api/client';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          URL Shortener
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link to="/create" className="text-gray-600 hover:text-blue-600">
                New Link
              </Link>
              <span className="text-sm text-gray-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
