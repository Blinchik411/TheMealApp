'use client';

import { cn } from '@/shared/lib';
import { Check, Laptop, type LucideIcon, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

export interface ThemeSwitcherProps {
  className?: string;
}

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: LucideIcon;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const t = useTranslations('Theme');
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside, Escape, Tab, and Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      } else if (event.key === 'Tab') {
        setIsOpen(false);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const menu = menuRef.current;
        if (!menu) return;
        const items = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
        const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
        if (event.key === 'ArrowDown') {
          const nextIndex = currentIndex + 1 < items.length ? currentIndex + 1 : 0;
          items[nextIndex]?.focus();
        } else {
          const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : items.length - 1;
          items[prevIndex]?.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const options: ThemeOption[] = [
    { mode: 'light', label: t('light'), icon: Sun },
    { mode: 'dark', label: t('dark'), icon: Moon },
    { mode: 'system', label: t('system'), icon: Laptop },
  ];

  // Current active trigger icon
  const TriggerIcon = !mounted ? Sun : theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('toggleTheme')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center justify-center size-9 rounded-xl border border-border/50 bg-muted/60 text-muted-foreground transition-all cursor-pointer',
          'hover:bg-muted hover:text-foreground hover:border-border',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isOpen && 'bg-muted text-foreground border-border ring-1 ring-border',
        )}
      >
        <TriggerIcon className="size-4.5 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          aria-label={t('toggleTheme')}
          className="absolute right-0 mt-2 w-36 rounded-2xl bg-popover/95 backdrop-blur-md border border-border p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = mounted && theme === option.mode;

            return (
              <button
                key={option.mode}
                role="menuitem"
                type="button"
                onClick={() => handleSelectTheme(option.mode)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/80',
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5" />
                  <span>{option.label}</span>
                </div>
                {isSelected && <Check className="size-3 text-primary stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
