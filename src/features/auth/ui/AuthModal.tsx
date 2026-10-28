'use client';

import { authApi } from '@/entities/user';
import { useFavoritesStore } from '@/features/favorite-meal';
import { Lock, Mail, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await authApi.signUp(email, password);
      } else {
        await authApi.signIn(email, password);
      }
      await loadFavorites();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          {isSignUp
            ? 'Sign up to sync your favorites across all devices'
            : 'Sign in to access your saved recipes'}
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
