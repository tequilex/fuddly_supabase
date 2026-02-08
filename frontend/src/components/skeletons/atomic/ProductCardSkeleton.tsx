import { BaseSkeleton } from '../BaseSkeleton';
import styles from './ProductCardSkeleton.module.scss';

export function ProductCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <BaseSkeleton width="100%" height="100%" />
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <BaseSkeleton width="45%" height={20} variant="text" />
          <BaseSkeleton width="22%" height={16} variant="text" />
        </div>

        <BaseSkeleton width="100%" height={20} variant="text" />
        <BaseSkeleton width="80%" height={20} variant="text" />

        <BaseSkeleton width="90%" height={16} variant="text" />

        <div className={styles.metaRow}>
          <BaseSkeleton width={70} height={16} variant="text" />
          <BaseSkeleton width={60} height={16} variant="text" />
        </div>
      </div>
    </div>
  );
}
