import React from 'react';
import { Star, MapPin, ChefHat } from 'lucide-react';
import { Product } from '../../types';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  // Адаптация данных для отображения
  const image = product.image || product.images?.[0] || '/placeholder.jpg';
  const chef = product.chef || { name: product.seller?.name || 'Неизвестно' };
  const rating = product.rating || 0;
  const reviewsCount = product.reviewsCount || 0;
  const distance = product.distance || 'н/д';

  const displayProduct = {
    ...product,
    image,
    chef,
    rating,
    reviewsCount,
    distance,
  };
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <img src={displayProduct.image} alt={displayProduct.title} className={styles.image} />
        <div className={styles.category}>{displayProduct.category}</div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{displayProduct.title}</h3>
        <p className={styles.description}>{displayProduct.description}</p>

        <div className={styles.meta}>
          <div className={styles.rating}>
            <Star size={16} fill="currentColor" />
            <span>{displayProduct.rating}</span>
            <span className={styles.reviews}>({displayProduct.reviewsCount})</span>
          </div>
          <div className={styles.distance}>
            <MapPin size={14} />
            <span>{displayProduct.distance}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.chef}>
            <ChefHat size={16} />
            <span>{displayProduct.chef.name}</span>
          </div>
          <div className={styles.price}>{displayProduct.price} ₽</div>
        </div>
      </div>
    </div>
  );
}