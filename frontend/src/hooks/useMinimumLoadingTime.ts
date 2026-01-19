import { useEffect, useState, useRef } from 'react';

/**
 * Хук для обеспечения минимальной длительности показа loading состояния
 * Предотвращает быстрое мигание skeleton при быстрой загрузке данных
 *
 * @param isLoading - реальное состояние загрузки из API/Redux
 * @param minimumDuration - минимальное время показа skeleton в миллисекундах (по умолчанию 500ms)
 * @returns boolean - должен ли показываться skeleton
 *
 * @example
 * const { loading } = useAppSelector((state) => state.products);
 * const showSkeleton = useMinimumLoadingTime(loading, 500);
 *
 * if (showSkeleton) {
 *   return <ProductCardSkeleton />;
 * }
 */
export function useMinimumLoadingTime(
  isLoading: boolean,
  minimumDuration: number = 500
): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isLoading) {
      // Начало загрузки
      startTimeRef.current = Date.now();
      setShowLoading(true);
    } else if (startTimeRef.current > 0) {
      // Загрузка завершена
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minimumDuration - elapsed);

      const timer = setTimeout(() => {
        setShowLoading(false);
        startTimeRef.current = 0;
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minimumDuration]);

  return showLoading;
}
