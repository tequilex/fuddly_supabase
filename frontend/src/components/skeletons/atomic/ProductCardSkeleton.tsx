import { BaseSkeleton } from '../BaseSkeleton';
import styles from './ProductCardSkeleton.module.scss';

export function ProductCardSkeleton() {
  return (
    <div className={styles.card}>
      {/* Изображение товара */}
      <div className={styles.imageContainer}>
        <BaseSkeleton width="100%" height="100%" />
      </div>

      <div className={styles.content}>
        {/* Заголовок (2 строки) */}
        <BaseSkeleton width="100%" height={20} variant="text" />
        <BaseSkeleton width="80%" height={20} variant="text" />

        {/* Описание (1 строка) */}
        <BaseSkeleton width="90%" height={16} variant="text" />

        {/* Мета: рейтинг и расстояние */}
        <div className={styles.meta}>
          <BaseSkeleton width={80} height={16} variant="text" />
          <BaseSkeleton width={60} height={16} variant="text" />
        </div>

        {/* Footer: имя повара и цена */}
        <div className={styles.footer}>
          <BaseSkeleton width={100} height={16} variant="text" />
          <BaseSkeleton width={70} height={24} variant="text" />
        </div>
      </div>
    </div>
  );
}
