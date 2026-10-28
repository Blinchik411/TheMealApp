import { supabase } from '@/shared/api/supabase';
import type { UserProfile } from '../model/types';

export const authApi = {
  async signUp(email: string, password: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? '',
    };
  },

  async signIn(email: string, password: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email ?? '',
    };
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email ?? '',
    };
  },
};
