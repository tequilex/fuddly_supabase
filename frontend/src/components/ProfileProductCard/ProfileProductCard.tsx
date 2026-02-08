import { Archive, Edit, Eye, EyeOff, Package, Star, Trash2 } from 'lucide-react';
import styles from './ProfileProductCard.module.scss';

export interface ProfileProductCardData {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  views: number;
  likes: number;
  orders: number;
  createdAt: string;
  status: 'active' | 'archived';
}

interface ProfileProductCardProps {
  product: ProfileProductCardData;
  onHide?: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProfileProductCard({
  product,
  onHide,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ProfileProductCardProps) {
  const isArchived = product.status === 'archived';

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={product.image} alt={product.name} className={styles.image} />
        {isArchived && <div className={styles.archivedBadge}>В архиве</div>}
        <div className={styles.category}>{product.category}</div>
        <div className={styles.actions}>
          {isArchived ? (
            <>
              <button
                type="button"
                className={styles.actionButton}
                title="Восстановить"
                onClick={() => onRestore?.(product.id)}
              >
                <Package size={16} />
              </button>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                title="Удалить"
                onClick={() => onDelete?.(product.id)}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.actionButton}
                title="Скрыть объявление"
                onClick={() => onHide?.(product.id)}
              >
                <EyeOff size={16} />
              </button>
              <button
                type="button"
                className={styles.actionButton}
                title="Редактировать"
                onClick={() => onEdit?.(product.id)}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className={styles.actionButton}
                title="В архив"
                onClick={() => onArchive?.(product.id)}
              >
                <Archive size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        <div className={styles.price}>{product.price} ₽</div>

        <div className={styles.stats}>
          <span className={styles.stat}>
            <Eye size={14} />
            {product.views}
          </span>
          <span className={styles.stat}>
            <Star size={14} />
            {product.likes}
          </span>
          <span className={styles.stat}>
            <Package size={14} />
            {product.orders}
          </span>
        </div>
      </div>
    </div>
  );
}
