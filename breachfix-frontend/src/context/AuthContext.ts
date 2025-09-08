// src/context/AuthContext.ts
import { create } from 'zustand';
import api from '../utils/api';

// Define the user shape (adjust based on your actual user object from /user/me)
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  profileUrl: string;
  // Add other user properties as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  // Add a method to initialize auth state from local storage
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (userData, accessToken, refreshToken) => {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user: userData, isAuthenticated: true });
  },
  logout: () => {
    localStorage.clear(); // Clear all auth tokens
    set({ user: null, isAuthenticated: false });
  },
  initializeAuth: async () => {
    const authToken = localStorage.getItem('authToken');
    // If an auth token exists, try to fetch user profile
    if (authToken) {
      try {
        // This direct API call is okay for initialization; useApi hook uses react-query which can be tricky for initial sync.
        const response = await api.get('/user/me');
        set({ user: response.data.user, isAuthenticated: true });
      } catch (error) {
        console.error("Failed to fetch user profile on app load:", error);
        localStorage.clear(); // Clear invalid tokens
        set({ user: null, isAuthenticated: false });
      }
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
}));