'use client';

import { type RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  isActive: boolean;
  onClose?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>({
  isActive,
  onClose,
  initialFocusRef,
}: UseFocusTrapOptions): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isActive || typeof document === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    // Save previous active element to restore focus on unmount
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move initial focus only if focus is not already inside container
    if (!container.contains(document.activeElement)) {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
        if (focusable.length > 0) {
          focusable[0]?.focus();
        } else {
          container.focus();
        }
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR),
        ).filter((el) => {
          if (typeof el.checkVisibility === 'function') {
            return el.checkVisibility();
          }
          return true;
        });

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: if on first element or outside, cycle to last
          if (
            document.activeElement === firstElement ||
            !container.contains(document.activeElement)
          ) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: if on last element or outside, cycle to first
          if (
            document.activeElement === lastElement ||
            !container.contains(document.activeElement)
          ) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElement?.focus?.();
    };
  }, [isActive, initialFocusRef]);

  return containerRef;
}
