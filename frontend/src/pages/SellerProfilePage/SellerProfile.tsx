import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Package, 
  MessageCircle,
  Award,
  TrendingUp,
  ThumbsUp
} from 'lucide-react';
import { Product, ProductStatus } from '../../types';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductGrid } from '../../components/ProductGrid/ProductGrid';
import styles from './SellerProfile.module.scss';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
}

const MOCK_SELLER = { id: 'seller-1', name: 'Мария Петрова' };

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Наполеон домашний',
    description: 'Классический торт с нежным кремом и тонкими коржами',
    price: 850,
    category: 'Торты',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop'],
    rating: 4.9,
    reviewsCount: 23,
    distance: '1.2 км',
    region: 'Москва',
    status: ProductStatus.APPROVED,
    seller_id: MOCK_SELLER.id,
    seller: MOCK_SELLER,
  },
  {
    id: '2',
    title: 'Борщ украинский с пампушками',
    description: 'Наваристый борщ на говяжьем бульоне со сметаной',
    price: 350,
    category: 'Супы',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop'],
    rating: 4.8,
    reviewsCount: 45,
    distance: '0.8 км',
    region: 'Москва',
    status: ProductStatus.APPROVED,
    seller_id: MOCK_SELLER.id,
    seller: MOCK_SELLER,
  },
  {
    id: '3',
    title: 'Пельмени домашние',
    description: 'Ручная лепка, сочная начинка из говядины и свинины',
    price: 450,
    category: 'Основные блюда',
    image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400&h=300&fit=crop'],
    rating: 5.0,
    reviewsCount: 38,
    distance: '2.1 км',
    region: 'Москва',
    status: ProductStatus.APPROVED,
    seller_id: MOCK_SELLER.id,
    seller: MOCK_SELLER,
  },
  {
    id: '4',
    title: 'Хачапури по-аджарски',
    description: 'Лодочка из теста с сыром, маслом и яйцом',
    price: 400,
    category: 'Выпечка',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'],
    rating: 4.7,
    reviewsCount: 19,
    distance: '1.5 км',
    region: 'Москва',
    status: ProductStatus.APPROVED,
    seller_id: MOCK_SELLER.id,
    seller: MOCK_SELLER,
  },
  {
    id: '5',
    title: 'Шарлотка яблочная',
    description: 'Нежный пирог с сочными яблоками и корицей',
    price: 300,
    category: 'Выпечка',
    image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop'],
    rating: 4.6,
    reviewsCount: 12,
    distance: '1.8 км',
    region: 'Москва',
    status: ProductStatus.APPROVED,
    seller_id: MOCK_SELLER.id,
    seller: MOCK_SELLER,
  },
  {
    id: '6',
    title: 'Медовик классический',
    description: 'Многослойный торт с медовыми коржами и кремом',
    price: 750,
    category: 'Торты',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'],
    rating: 4.9,
    reviewsCount: 31,
    distance: '0.9 км',
    region: 'Москва',
    status: ProductStatus.APPROVED,
    seller_id: MOCK_SELLER.id,
    seller: MOCK_SELLER,
  },
];

const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'Анна Соколова',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    date: '15 января 2024',
    comment: 'Потрясающий Наполеон! Очень нежный крем, тонкие коржи. Заказываю уже не первый раз, всегда свежий и вкусный. Гости были в восторге!',
    productName: 'Наполеон домашний'
  },
  {
    id: '2',
    userName: 'Дмитрий Волков',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    date: '12 января 2024',
    comment: 'Борщ как у бабушки! Насыщенный, ароматный, с отличными пампушками. Доставка вовремя, всё горячее. Очень рекомендую!',
    productName: 'Борщ украинский'
  },
  {
    id: '3',
    userName: 'Елена Петрова',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 4,
    date: '10 января 2024',
    comment: 'Пельмени очень вкусные, настоящие домашние. Тесто тонкое, начинка сочная. Единственное - хотелось бы побольше порцию :)',
    productName: 'Пельмени домашние'
  },
  {
    id: '4',
    userName: 'Иван Смирнов',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 5,
    date: '8 января 2024',
    comment: 'Хачапури просто огонь! Сыр тянется, тесто воздушное. Заказываю постоянно на завтрак.',
    productName: 'Хачапури по-аджарски'
  },
  {
    id: '5',
    userName: 'Мария Кузнецова',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    rating: 5,
    date: '5 января 2024',
    comment: 'Медовик - это что-то невероятное! Очень нежный, тает во рту. Лучший торт, который я пробовала!',
    productName: 'Медовик классический'
  }
];

interface SellerProfileProps {
  sellerId?: string;
  seller?: { id: string; name: string; company?: string; avatar?: string | null };
  products?: any[];
  onProductClick?: (id: string) => void;
  onBack?: () => void;
  onMessageClick?: () => void;
}

export function SellerProfile({ sellerId, onProductClick, onBack }: SellerProfileProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  const sellerInfo = {
    name: MOCK_SELLER.name,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    rating: 4.8,
    reviewsCount: 168,
    location: 'Москва, район Хамовники',
    memberSince: 'Январь 2023',
    totalOrders: 342,
    responseRate: 98,
    responseTime: '~2 часа',
    description: 'Профессиональный повар с 15-летним стажем. Специализируюсь на традиционной русской и грузинской кухне. Все блюда готовлю из свежих продуктов, без полуфабрикатов. Работаю по всем санитарным нормам. Возможна доставка по Москве.'
  };

  const totalRating =
    mockProducts.reduce((sum, p) => sum + (p.rating ?? 0), 0) / (mockProducts.length || 1);

  return (
    <div className={styles.sellerProfilePage}>
      <div className={styles.container}>
        {/* Шапка профиля продавца */}
        <div className={styles.profileHeader}>
          <div className={styles.profileCover}></div>
          
          <div className={styles.profileContent}>
            <div className={styles.profileMain}>
              <div className={styles.avatarSection}>
                <img 
                  src={sellerInfo.avatar} 
                  alt={sellerInfo.name}
                  className={styles.avatar}
                />
                <div className={styles.verifiedBadge}>
                  <Award size={16} />
                </div>
              </div>

              <div className={styles.sellerInfo}>
                <div className={styles.nameRow}>
                  <h1>{sellerInfo.name}</h1>
                  <span className={styles.sellerBadge}>
                    <Star size={14} fill="currentColor" />
                    Проверенный продавец
                  </span>
                </div>

                <div className={styles.ratingRow}>
                  <div className={styles.rating}>
                    <Star size={20} fill="#FF6B35" color="#FF6B35" />
                    <span className={styles.ratingValue}>{sellerInfo.rating}</span>
                    <span className={styles.ratingCount}>({sellerInfo.reviewsCount} отзывов)</span>
                  </div>
                  <span className={styles.separator}>•</span>
                  <span className={styles.orders}>{sellerInfo.totalOrders} заказов</span>
                </div>

                <div className={styles.metaInfo}>
                  <span className={styles.metaItem}>
                    <MapPin size={16} />
                    {sellerInfo.location}
                  </span>
                  <span className={styles.metaItem}>
                    <Calendar size={16} />
                    На Fuddly с {sellerInfo.memberSince}
                  </span>
                </div>

                <p className={styles.description}>{sellerInfo.description}</p>
              </div>

              <div className={styles.actions}>
                <button className={styles.messageButton}>
                  <MessageCircle size={20} />
                  Написать
                </button>
              </div>
            </div>

            <div className={styles.statsCards}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <ThumbsUp size={20} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{sellerInfo.responseRate}%</div>
                  <div className={styles.statLabel}>Процент ответов</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={20} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{sellerInfo.responseTime}</div>
                  <div className={styles.statLabel}>Время ответа</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Package size={20} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{mockProducts.length}</div>
                  <div className={styles.statLabel}>Активных блюд</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Star size={20} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{totalRating.toFixed(1)}</div>
                  <div className={styles.statLabel}>Рейтинг блюд</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            Блюда ({mockProducts.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={18} />
            Отзывы ({mockReviews.length})
          </button>
        </div>

        {/* Контент табов */}
        {activeTab === 'products' ? (
          <div className={styles.productsSection}>
            <div className={styles.gridWrap}>
              <ProductGrid className={styles.productsGrid}>
                {mockProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onProductClick?.(product.id)}
                  />
                ))}
              </ProductGrid>
            </div>
          </div>
        ) : (
          <div className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <h2>Отзывы покупателей</h2>
              <div className={styles.reviewsSummary}>
                <div className={styles.overallRating}>
                  <div className={styles.overallRatingValue}>{sellerInfo.rating}</div>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={20} 
                        fill={star <= Math.round(sellerInfo.rating) ? '#FF6B35' : 'none'}
                        color="#FF6B35"
                      />
                    ))}
                  </div>
                  <div className={styles.reviewsTotal}>На основе {sellerInfo.reviewsCount} отзывов</div>
                </div>
              </div>
            </div>

            <div className={styles.reviewsList}>
              {mockReviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <img src={review.userAvatar} alt={review.userName} className={styles.reviewAvatar} />
                    <div className={styles.reviewUserInfo}>
                      <div className={styles.reviewUserName}>{review.userName}</div>
                      <div className={styles.reviewMeta}>
                        <div className={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={14} 
                              fill={star <= review.rating ? '#FF6B35' : 'none'}
                              color="#FF6B35"
                            />
                          ))}
                        </div>
                        <span className={styles.reviewDate}>{review.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reviewProduct}>
                    <Package size={14} />
                    {review.productName}
                  </div>

                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
