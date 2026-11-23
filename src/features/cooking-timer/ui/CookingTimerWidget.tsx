'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { initTimerEffects } from '../model/timerAudioListener';
import { useTimerUiStore } from '../model/timerUiStore';
import { TimerDialog } from './TimerDialog';
import { TimerFloatingButton } from './TimerFloatingButton';

export const CookingTimerWidget = () => {
  const t = useTranslations('CookingTimer');

  const isOpen = useTimerUiStore((state) => state.isOpen);
  const setOpen = useTimerUiStore((state) => state.setOpen);

  useEffect(() => {
    return initTimerEffects();
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      {/* Оверлей-бекдроп для закрытия по клику вне модального окна */}
      {isOpen && (
        <button
          type="button"
          tabIndex={-1}
          data-testid="timer-modal-backdrop"
          onClick={handleClose}
          aria-label={t('overlayAria')}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default border-none outline-none z-40"
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 print:hidden flex flex-col items-end">
        {/* Раскрытая модальная карточка таймера */}
        {isOpen && <TimerDialog onClose={handleClose} />}

        {/* Плавающая кнопка-триггер (FAB) */}
        <TimerFloatingButton />
      </div>
    </>
  );
};
