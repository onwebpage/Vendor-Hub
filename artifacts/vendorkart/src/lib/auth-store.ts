import { create } from 'zustand';
import type { User } from '@workspace/api-client-react';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Check local storage initially
const storedUser = localStorage.getItem('vendorkart_user');
const storedToken = localStorage.getItem('vendorkart_token');

const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: storedToken,
  isAuthenticated: !!initialUser,
  
  login: (user, token) => {
    localStorage.setItem('vendorkart_user', JSON.stringify(user));
    localStorage.setItem('vendorkart_token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('vendorkart_user');
    localStorage.removeItem('vendorkart_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
