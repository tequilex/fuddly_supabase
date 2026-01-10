import { useEffect, useState } from 'react';

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
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Начало загрузки - запоминаем время и показываем skeleton
      setShowLoading(true);
      setLoadingStartTime(Date.now());
    } else if (loadingStartTime !== null) {
      // Загрузка завершена - проверяем прошло ли минимальное время
      const elapsed = Date.now() - loadingStartTime;
      const remaining = minimumDuration - elapsed;

      if (remaining > 0) {
        // Если прошло меньше минимального времени, ждем оставшееся время
        const timer = setTimeout(() => {
          setShowLoading(false);
          setLoadingStartTime(null);
        }, remaining);

        return () => clearTimeout(timer);
      } else {
        // Минимальное время уже прошло, сразу скрываем skeleton
        setShowLoading(false);
        setLoadingStartTime(null);
      }
    }
  }, [isLoading, loadingStartTime, minimumDuration]);

  return showLoading;
}
