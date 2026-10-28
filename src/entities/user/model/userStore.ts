'use client';

import { supabase } from '@/shared/api/supabase';
import { create } from 'zustand';
import { authApi } from '../api/authApi';
import type { UserProfile } from './types';

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,

  initAuth: async () => {
    try {
      const user = await authApi.getCurrentUser();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          user: { id: session.user.id, email: session.user.email ?? '' },
          isLoading: false,
        });
      } else {
        set({ user: null, isLoading: false });
      }
    });
  },

  signOut: async () => {
    await authApi.signOut();
    set({ user: null });
  },
}));
