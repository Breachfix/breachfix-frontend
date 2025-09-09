// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-breachfix-navy text-breachfix-white shadow-lg sticky top-0 z-50">
        {/* Logo */}
        <Link to="/" className="text-breachfix-gold text-heading-lg font-bold font-sans">
          BreachFix
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-breachfix-gold transition-colors duration-200">Home</Link>
          <Link to="/media" className="hover:text-breachfix-gold transition-colors duration-200">Media</Link>
          <Link to="/episodes" className="hover:text-breachfix-gold transition-colors duration-200">Episodes</Link>
          <Link to="/accounts" className="hover:text-breachfix-gold transition-colors duration-200">Accounts</Link>
          <Link to="/favorites" className="hover:text-breachfix-gold transition-colors duration-200">Favorites</Link>
          <Link to="/bible" className="hover:text-breachfix-gold transition-colors duration-200">Bible</Link>
        </nav>

        {/* Desktop User Actions / Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-full hover:bg-breachfix-gray transition-colors duration-200">
                <img
                  src={user?.profileUrl || `https://placehold.co/40x40/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-breachfix-gold"
                  onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`; }}
                />
                <span>{user?.username}</span>
              </Link>
              <button
                onClick={logout}
                className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy font-bold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu}
            className="text-breachfix-white text-heading-md hover:text-breachfix-gold transition-colors duration-200"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-breachfix-dark border-t border-breachfix-gray shadow-lg"
          >
            <nav className="flex flex-col p-4 space-y-4">
              <Link 
                to="/" 
                onClick={closeMobileMenu}
                className="text-breachfix-white hover:text-breachfix-gold transition-colors duration-200 py-2"
              >
                Home
              </Link>
              <Link 
                to="/media" 
                onClick={closeMobileMenu}
                className="text-breachfix-white hover:text-breachfix-gold transition-colors duration-200 py-2"
              >
                Media
              </Link>
              <Link 
                to="/episodes" 
                onClick={closeMobileMenu}
                className="text-breachfix-white hover:text-breachfix-gold transition-colors duration-200 py-2"
              >
                Episodes
              </Link>
              <Link 
                to="/accounts" 
                onClick={closeMobileMenu}
                className="text-breachfix-white hover:text-breachfix-gold transition-colors duration-200 py-2"
              >
                Accounts
              </Link>
              <Link 
                to="/favorites" 
                onClick={closeMobileMenu}
                className="text-breachfix-white hover:text-breachfix-gold transition-colors duration-200 py-2"
              >
                Favorites
              </Link>
              <Link 
                to="/bible" 
                onClick={closeMobileMenu}
                className="text-breachfix-white hover:text-breachfix-gold transition-colors duration-200 py-2"
              >
                Bible
              </Link>
              
              {/* Mobile Auth Section */}
              <div className="border-t border-breachfix-gray pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/profile" 
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-breachfix-gray transition-colors duration-200 mb-3"
                    >
                      <img
                        src={user?.profileUrl || `https://placehold.co/40x40/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full border border-breachfix-gold"
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/333333/ffffff?text=${user?.username?.charAt(0).toUpperCase() || 'U'}`; }}
                      />
                      <span className="text-breachfix-white">{user?.username}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="w-full bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full bg-breachfix-gold hover:bg-yellow-500 text-breachfix-navy font-bold py-2 px-4 rounded-md transition-colors duration-200 text-center block"
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

