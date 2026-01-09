import React, { useState } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Product } from '../../types';
import styles from './Favorites.module.css';

const mockFavorites: Product[] = [
  {
    id: '1',
    title: 'Наполеон домашний',
    description: 'Классический торт с нежным кремом и тонкими коржами',
    price: 850,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
    category: 'Торты',
    rating: 4.9,
    reviewsCount: 23,
    distance: '1.2 км',
    chef: { name: 'Мария Петрова' }
  },
  {
    id: '2',
    title: 'Борщ украинский с пампушками',
    description: 'Наваристый борщ на говяжьем бульоне со сметаной',
    price: 350,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    category: 'Супы',
    rating: 4.8,
    reviewsCount: 45,
    distance: '0.8 км',
    chef: { name: 'Анна Смирнова' }
  },
  {
    id: '3',
    title: 'Пельмени домашние',
    description: 'Ручная лепка, сочная начинка из говядины и свинины',
    price: 450,
    image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&h=300&fit=crop',
    category: 'Основные блюда',
    rating: 5.0,
    reviewsCount: 38,
    distance: '2.1 км',
    chef: { name: 'Елена Васильева' }
  },
  {
    id: '4',
    title: 'Хачапури по-аджарски',
    description: 'Лодочка из теста с сыром, маслом и яйцом',
    price: 400,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    category: 'Выпечка',
    rating: 4.7,
    reviewsCount: 19,
    distance: '1.5 км',
    chef: { name: 'Георгий Давидян' }
  },
  {
    id: '5',
    title: 'Шарлотка яблочная',
    description: 'Нежный пирог с сочными яблоками и корицей',
    price: 300,
    image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop',
    category: 'Выпечка',
    rating: 4.6,
    reviewsCount: 12,
    distance: '1.8 км',
    chef: { name: 'Ольга Николаева' }
  },
  {
    id: '6',
    title: 'Медовик классический',
    description: 'Многослойный торт с медовыми коржами и кремом',
    price: 750,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    category: 'Торты',
    rating: 4.9,
    reviewsCount: 31,
    distance: '0.9 км',
    chef: { name: 'Мария Петрова' }
  },
];

interface FavoritesProps {
  onProductClick?: (id: string) => void;
  onBrowseCatalog?: () => void;
  onBack?: () => void;
}

export function Favorites({ onProductClick, onBrowseCatalog }: FavoritesProps) {
  const [favorites, setFavorites] = useState<Product[]>(mockFavorites);

  const handleRemove = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Вы уверены, что хотите очистить все избранное?')) {
      setFavorites([]);
    }
  };

  const totalPrice = favorites.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={styles.favoritesPage}>
      <div className={styles.container}>
        {/* Шапка страницы */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <Heart size={32} fill="currentColor" className={styles.heartIcon} />
              <div>
                <h1>Избранное</h1>
                <p className={styles.subtitle}>
                  {favorites.length > 0 
                    ? `${favorites.length} ${favorites.length === 1 ? 'блюдо' : favorites.length < 5 ? 'блюда' : 'блюд'}`
                    : 'Пусто'}
                </p>
              </div>
            </div>

            {favorites.length > 0 && (
              <button className={styles.clearButton} onClick={handleClearAll}>
                <Trash2 size={18} />
                Очистить всё
              </button>
            )}
          </div>

          {favorites.length > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Всего блюд:</span>
                <span className={styles.summaryValue}>{favorites.length}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Общая стоимость:</span>
                <span className={styles.summaryValue}>{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          )}
        </div>

        {/* Список избранных товаров */}
        {favorites.length > 0 ? (
          <div className={styles.productsGrid}>
            {favorites.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick?.(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Heart size={80} />
            </div>
            <h2>В избранном пока ничего нет</h2>
            <p>
              Добавляйте понравившиеся блюда в избранное,<br />
              чтобы не потерять их и заказать позже
            </p>
            <button className={styles.browseButton} onClick={onBrowseCatalog}>
              Перейти к каталогу
            </button>
          </div>
        )}
      </div>
    </div>
  );
}