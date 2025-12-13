import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  otpSent: boolean;
  otpEmail: string;
  login: (user: User) => void;
  logout: () => void;
  setOtpSent: (sent: boolean, email: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      otpSent: false,
      otpEmail: '',
      login: (user) => set({ isAuthenticated: true, user, otpSent: false }),
      logout: () => set({ isAuthenticated: false, user: null, otpSent: false, otpEmail: '' }),
      setOtpSent: (sent, email) => set({ otpSent: sent, otpEmail: email }),
    }),
    {
      name: 'astra-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
