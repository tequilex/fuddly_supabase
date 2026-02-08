import React, { useState } from 'react';
import { Star, Heart, MessageCircle } from 'lucide-react';
import { Product } from '../../types';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  // Адаптация данных для отображения
  const image = product.image || product.images?.[0] || '/placeholder.jpg';
  const rating = product.rating || 5;
  const reviewsCount = product.reviewsCount || 10;
  const displayProduct = {
    ...product,
    image,
    rating,
    reviewsCount,
  };
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <img src={displayProduct.image} alt={displayProduct.title} className={styles.image} />
        <div className={styles.category}>{displayProduct.category}</div>
        <button
          className={`${styles.likeButton} ${liked ? styles.likeButtonActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setLiked((prev) => !prev);
          }}
          aria-label={liked ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <Heart size={18} strokeWidth={2.25} />
        </button>
      </div>

      <div className={`${styles.content} ${styles.variantPriceFirst}`}>
        <div className={styles.topRow}>
          <div className={styles.price}>{displayProduct.price} ₽</div>
        </div>
        <h3 className={styles.title}>{displayProduct.title}</h3>
        <p className={styles.description}>{displayProduct.description}</p>

        <div className={styles.metaRow}>
          <div className={styles.rating}>
            <Star size={16} fill="currentColor" />
            <span>{displayProduct.rating}</span>
          </div>
          <div className={styles.reviews}>
            <MessageCircle size={14} />
            <span>{displayProduct.reviewsCount} отзывов</span>
          </div>
        </div>
      </div>
    </div>
  );
}
