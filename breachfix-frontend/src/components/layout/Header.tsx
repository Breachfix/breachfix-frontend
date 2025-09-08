// src/components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="flex items-center justify-between p-4 bg-netflix-black text-netflix-white shadow-lg sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-netflix-red text-3xl font-bold font-sans">
        BreachFix
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/" className="hover:text-netflix-red transition-colors duration-200">Home</Link>
        <Link to="/media" className="hover:text-netflix-red transition-colors duration-200">Media</Link>
        <Link to="/episodes" className="hover:text-netflix-red transition-colors duration-200">Episodes</Link>
        <Link to="/accounts" className="hover:text-netflix-red transition-colors duration-200">Accounts</Link>
        <Link to="/favorites" className="hover:text-netflix-red transition-colors duration-200">Favorites</Link>
        <Link to="/bible" className="hover:text-netflix-red transition-colors duration-200">Bible</Link>
      </nav>

      {/* User Actions / Auth */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-full hover:bg-netflix-gray transition-colors duration-200">
              <img
                src={user?.profileUrl || `https://placehold.co/40x40/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border border-netflix-red"
                onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`; }} // Fallback
              />
              <span className="hidden md:block">{user?.username}</span>
            </Link>
            <button
              onClick={logout}
              className="bg-netflix-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-netflix-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu Button (you can implement a dropdown/sidebar for this) */}
      <div className="md:hidden">
        <button className="text-netflix-white text-2xl">☰</button>
      </div>
    </header>
  );
};

export default Header;

