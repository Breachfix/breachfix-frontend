// src/pages/Auth.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import api from '../utils/api'; // Our custom Axios instance
import { motion } from 'framer-motion';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login Logic
        const response = await api.post('/auth/login', {
          identifier: email, // Using email as identifier
          password,
          rememberMe,
          platform: 'media',
        });
        const { user, tokens } = response.data;
        login(user, tokens.accessToken, tokens.refreshToken);
        navigate('/'); // Redirect to home on successful login
      } else {
        // Signup Logic
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (!acceptTerms) {
          setError("You must accept the terms and conditions.");
          setLoading(false);
          return;
        }

        await api.post('/auth/signup', {
          username,
          email,
          password,
          confirmPassword,
          acceptTerms,
          platform: 'media',
        });
        // After successful signup, you might want to automatically log them in or redirect to login
        alert('Signup successful! Please log in.'); // Using alert for now, replace with custom modal
        setIsLogin(true); // Switch to login form
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-bridge-navy p-8 md:p-10 rounded-lg shadow-xl max-w-md w-full border border-bridge-gray"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-bridge-white mb-6 text-center">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>

        {error && (
          <div className="bg-red-700 text-bridge-white p-3 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {!isLogin && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 rounded-md bg-bridge-gray border border-transparent focus:border-bridge-gold focus:outline-none text-bridge-white placeholder-bridge-gray"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-md bg-bridge-gray border border-transparent focus:border-bridge-gold focus:outline-none text-bridge-white placeholder-bridge-gray"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-md bg-bridge-gray border border-transparent focus:border-bridge-gold focus:outline-none text-bridge-white placeholder-bridge-gray"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {!isLogin && (
          <>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-3 rounded-md bg-bridge-gray border border-transparent focus:border-bridge-gold focus:outline-none text-bridge-white placeholder-bridge-gray"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="acceptTerms"
                className="form-checkbox h-5 w-5 text-bridge-gold rounded border-bridge-gray focus:ring-0"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="acceptTerms" className="ml-2 text-bridge-gray text-sm">
                I accept the terms and conditions
              </label>
            </div>
          </>
        )}

        {isLogin && (
          <div className="mb-6 flex items-center justify-between">
            <label className="flex items-center text-bridge-gray text-sm">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-bridge-gold rounded border-bridge-gray focus:ring-0"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ml-2">Remember me</span>
            </label>
            <Link to="#" className="text-bridge-gray hover:underline text-sm">
              Need help?
            </Link>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-netflix-red hover:bg-red-700 text-bridge-white font-bold py-3 rounded-md transition-colors duration-200"
          disabled={loading}
        >
          {loading ? (isLogin ? 'Signing In...' : 'Signing Up...') : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>

        <div className="mt-6 text-center">
          <p className="text-bridge-gray text-sm">
            {isLogin ? "New to BreachFix? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-bridge-white hover:underline font-semibold"
            >
              {isLogin ? 'Sign up now.' : 'Sign in.'}
            </button>
          </p>
        </div>

        {/* OAuth Buttons (Simplified for example) */}
        <div className="mt-8">
          <div className="relative flex items-center justify-center py-4">
            <div className="flex-grow border-t border-bridge-gray"></div>
            <span className="flex-shrink mx-4 text-bridge-gray text-sm">OR</span>
            <div className="flex-grow border-t border-bridge-gray"></div>
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-bridge-white font-bold py-2.5 rounded-md transition-colors duration-200 mb-3"
            onClick={() => { /* Implement Google OAuth logic: window.location.href = `${API_BASE_URL}/auth/google/url`; */ }}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.27c0-.78-.07-1.54-.2-2.28H12v4.32h6.29c-.27 1.45-1.07 2.68-2.31 3.55l-.01.01 3.6 2.8c.08.05.27.05.35 0a9.92 9.92 0 003.04-7.4z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-1.05 7.29-2.88l-3.6-2.8c-.08-.05-.27-.05-.35 0-.75.52-1.74.83-2.92.83-2.29 0-4.24-1.55-4.95-3.6l-.01-.01-3.6 2.8c-.08.05-.27.05-.35 0A9.913 9.913 0 0012 23z" fill="#34A853"></path><path d="M7.05 13.91c-.02-.2-.03-.41-.03-.62s.01-.42.03-.62v-3.23l-3.6-2.8a9.913 9.913 0 000 9.26l3.6-2.8z" fill="#FBBC05"></path><path d="M12 4.19c1.62 0 3.07.56 4.22 1.63l3.22-3.13C17.46 1.15 14.97 0 12 0 8.01 0 4.4 2.22 2.72 5.56l3.6 2.8c.71-2.05 2.66-3.6 4.95-3.6z" fill="#EA4335"></path></svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-bridge-white font-bold py-2.5 rounded-md transition-colors duration-200"
            onClick={() => { /* Implement GitHub OAuth logic: window.location.href = `${API_BASE_URL}/auth/github/url`; */ }}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default Auth;
