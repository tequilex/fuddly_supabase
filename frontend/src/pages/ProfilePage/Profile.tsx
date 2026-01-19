import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Star, 
  Package, 
  Archive, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Settings,
  Camera,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Heart,
  MessageSquare
} from 'lucide-react';
import { Product as ReduxProduct } from '../../types';
import styles from './Profile.module.scss';

interface ProfileProduct {
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

const mockProducts: ProfileProduct[] = [
  {
    id: '1',
    name: 'Наполеон домашний',
    price: 850,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
    category: 'Торты',
    views: 245,
    likes: 18,
    orders: 12,
    createdAt: '2024-01-05',
    status: 'active'
  },
  {
    id: '2',
    name: 'Борщ украинский с пампушками',
    price: 350,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    category: 'Супы',
    views: 189,
    likes: 23,
    orders: 34,
    createdAt: '2024-01-03',
    status: 'active'
  },
  {
    id: '3',
    name: 'Пельмени домашние',
    price: 450,
    image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&h=300&fit=crop',
    category: 'сновные блюда',
    views: 312,
    likes: 41,
    orders: 28,
    createdAt: '2024-01-01',
    status: 'active'
  },
  {
    id: '4',
    name: 'Хачапури по-аджарски',
    price: 400,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    category: 'Выпечка',
    views: 156,
    likes: 15,
    orders: 19,
    createdAt: '2023-12-28',
    status: 'active'
  },
  {
    id: '5',
    name: 'Шарлотка яблочная',
    price: 300,
    image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop',
    category: 'Выпечка',
    views: 98,
    likes: 8,
    orders: 5,
    createdAt: '2023-12-20',
    status: 'archived'
  },
  {
    id: '6',
    name: 'Медовик классический',
    price: 750,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    category: 'Торты',
    views: 67,
    likes: 4,
    orders: 2,
    createdAt: '2023-12-15',
    status: 'archived'
  },
];

interface ProfileProps {
  user: { name: string; role?: string } | null;
  products?: ReduxProduct[];
  onProductClick?: (id: string) => void;
  onCreateProduct?: () => void;
}

// Адаптер для преобразования ReduxProduct в ProfileProduct
const adaptProduct = (p: ReduxProduct): ProfileProduct => ({
  id: p.id,
  name: p.title, // title -> name
  price: p.price,
  image: p.image || p.images?.[0] || '/placeholder.jpg',
  category: p.category || 'Другое',
  views: 0, // TODO: добавить в backend
  likes: 0, // TODO: добавить в backend
  orders: 0, // TODO: добавить в backend
  createdAt: p.created_at || new Date().toISOString(),
  status: (p.status === 'APPROVED' ? 'active' : 'archived') as 'active' | 'archived',
});

export function Profile({ user, products: productsFromProps, onProductClick, onCreateProduct }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'myProducts' | 'myOrders' | 'favorites' | 'reviews'>('myProducts');
  const [productsFilter, setProductsFilter] = useState<'active' | 'archived'>('active');

  // Адаптируем товары из Redux к формату ProfileProduct
  const products: ProfileProduct[] = productsFromProps
    ? productsFromProps.map(adaptProduct)
    : mockProducts;

  const activeProducts = products.filter(p => p.status === 'active');
  const archivedProducts = products.filter(p => p.status === 'archived');
  const displayProducts = productsFilter === 'active' ? activeProducts : archivedProducts;

  // TODO: эти данные должны приходить из backend (views, orders, likes)
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalOrders = products.reduce((sum, p) => sum + (p.orders || 0), 0);
  const totalLikes = products.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        {/* Шапка профиля */}
        <div className={styles.profileHeader}>
          <div className={styles.profileCover}></div>
          
          <div className={styles.profileInfo}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" 
                  alt={user?.name || 'Пользователь'}
                  className={styles.avatar}
                />
                <button className={styles.avatarEditButton}>
                  <Camera size={18} />
                </button>
              </div>

              <div className={styles.userInfo}>
                <div className={styles.userNameRow}>
                  <h1>{user?.name || 'Пользователь'}</h1>
                </div>

                <div className={styles.userMeta}>
                  <span className={styles.metaItem}>
                    <MapPin size={16} />
                    Москва, Россия
                  </span>
                  <span className={styles.metaItem}>
                    <Calendar size={16} />
                    На Fuddly с января 2024
                  </span>
                </div>

                <div className={styles.userContacts}>
                  <a href="tel:+79001234567" className={styles.contactLink}>
                    <Phone size={16} />
                    +7 (900) 123-45-67
                  </a>
                  <a href="mailto:user@example.com" className={styles.contactLink}>
                    <Mail size={16} />
                    user@example.com
                  </a>
                </div>
              </div>

              <button className={styles.settingsButton}>
                <Settings size={20} />
                Настройки
              </button>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Package size={24} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{mockProducts.length}</div>
                  <div className={styles.statLabel}>Всего объявлений</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Eye size={24} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{totalViews}</div>
                  <div className={styles.statLabel}>Просмотров</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <ShoppingBag size={24} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{totalOrders}</div>
                  <div className={styles.statLabel}>Продано</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Star size={24} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>4.8</div>
                  <div className={styles.statLabel}>Рейтинг</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Контент профиля */}
        <div className={styles.profileContent}>
          {/* Главные табы */}
          <div className={styles.mainTabs}>
            <button
              className={`${styles.mainTab} ${activeTab === 'myProducts' ? styles.mainTabActive : ''}`}
              onClick={() => setActiveTab('myProducts')}
            >
              <Package size={18} />
              Мои объявления
            </button>
            <button
              className={`${styles.mainTab} ${activeTab === 'myOrders' ? styles.mainTabActive : ''}`}
              onClick={() => setActiveTab('myOrders')}
            >
              <ShoppingBag size={18} />
              Мои заказы
            </button>
            <button
              className={`${styles.mainTab} ${activeTab === 'favorites' ? styles.mainTabActive : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <Heart size={18} />
              Избранное
            </button>
            <button
              className={`${styles.mainTab} ${activeTab === 'reviews' ? styles.mainTabActive : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={18} />
              Отзывы
            </button>
          </div>

          {/* Контент вкладок */}
          {activeTab === 'myProducts' && (
            <div className={styles.tabContent}>
              <div className={styles.contentHeader}>
                <h2>Мои объявления</h2>
                <button className={styles.addButton} onClick={onCreateProduct}>
                  + Добавить объявление
                </button>
              </div>

              {/* Подтабы для активных/архивных */}
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${productsFilter === 'active' ? styles.tabActive : ''}`}
                  onClick={() => setProductsFilter('active')}
                >
                  <Package size={18} />
                  Активные ({activeProducts.length})
                </button>
                <button
                  className={`${styles.tab} ${productsFilter === 'archived' ? styles.tabActive : ''}`}
                  onClick={() => setProductsFilter('archived')}
                >
                  <Archive size={18} />
                  Архив ({archivedProducts.length})
                </button>
              </div>

              {/* Список объявлений */}
              {displayProducts.length > 0 ? (
                <div className={styles.productsGrid}>
                  {displayProducts.map(product => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productImage}>
                        <img src={product.image} alt={product.name} />
                        {productsFilter === 'archived' && (
                          <div className={styles.archivedBadge}>В архиве</div>
                        )}
                      </div>

                      <div className={styles.productContent}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <div className={styles.productPrice}>{product.price} ₽</div>
                        <div className={styles.productCategory}>{product.category}</div>

                        <div className={styles.productStats}>
                          <span className={styles.productStat}>
                            <Eye size={14} />
                            {product.views}
                          </span>
                          <span className={styles.productStat}>
                            <Star size={14} />
                            {product.likes}
                          </span>
                          <span className={styles.productStat}>
                            <Package size={14} />
                            {product.orders}
                          </span>
                        </div>

                        <div className={styles.productActions}>
                          {productsFilter === 'active' ? (
                            <>
                              <button 
                                className={styles.actionButton}
                                title="Скрыть объявление"
                              >
                                <EyeOff size={16} />
                              </button>
                              <button 
                                className={styles.actionButton}
                                title="Редактировать"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className={styles.actionButton}
                                title="В архив"
                              >
                                <Archive size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className={styles.actionButton}
                                title="Восстановить"
                              >
                                <Package size={16} />
                              </button>
                              <button 
                                className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                                title="Удалить"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    {productsFilter === 'active' ? <Package size={64} /> : <Archive size={64} />}
                  </div>
                  <h3>
                    {productsFilter === 'active' 
                      ? 'Нет активных объявлений' 
                      : 'Архив пуст'}
                  </h3>
                  <p>
                    {productsFilter === 'active'
                      ? 'Создайте своё первое объявление, чтобы начать продавать'
                      : 'Здесь будут отображаться архивные объявления'}
                  </p>
                  {productsFilter === 'active' && (
                    <button className={styles.emptyButton} onClick={onCreateProduct}>
                      + Добавить объявление
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'myOrders' && (
            <div className={styles.tabContent}>
              <div className={styles.contentHeader}>
                <h2>Мои заказы</h2>
              </div>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <ShoppingBag size={64} />
                </div>
                <h3>У вас пока нет заказов</h3>
                <p>Здесь будут отображаться блюда, которые вы заказали</p>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className={styles.tabContent}>
              <div className={styles.contentHeader}>
                <h2>Избранное</h2>
              </div>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Heart size={64} />
                </div>
                <h3>В избранном пока ничего нет</h3>
                <p>Добавляйте понравившиеся блюда в избранное</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.tabContent}>
              <div className={styles.contentHeader}>
                <h2>Отзывы</h2>
              </div>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <MessageSquare size={64} />
                </div>
                <h3>Отзывов пока нет</h3>
                <p>Здесь будут отображаться отзывы покупателей о ваших блюдах</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}