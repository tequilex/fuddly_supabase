import { useEffect } from 'react';

/**
 * Hook для блокировки скролла body
 * Используется для модальных окон, боковых панелей и т.д.
 *
 * @param isLocked - флаг блокировки скролла
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * useScrollLock(isOpen);
 */
export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;

      // Блокируем скролл
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Восстанавливаем скролл
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Возвращаем позицию скролла
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isLocked]);
};
