import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  ChefHat, 
  Heart, 
  Share2, 
  Plus, 
  Minus,
  ShoppingCart,
  CheckCircle,
  Award,
  MessageCircle
} from 'lucide-react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Product } from '../../types';
import styles from './ProductDetail.module.css';
import './ProductDetailLightbox.module.css';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onProductClick: (productId: string) => void;
  onSellerClick?: () => void;
  product?: Product; // Товар из Redux
  similarProducts?: Product[]; // Похожие товары из Redux
}

// Extended product type with more details
interface DetailedProduct extends Product {
  images: string[];
  chef: { name: string; rating?: number }; // Переопределяем как обязательное
  rating: number; // Переопределяем как обязательное
  reviewsCount: number; // Переопределяем как обязательное
  fullDescription: string;
  weight: string;
  prepTime: string;
  ingredients: string[];
  allergens?: string[];
  chefBio: string;
  chefImage: string;
  chefRating: number;
  chefOrders: number;
  reviews: Review[];
  portionSizes?: { label: string; price: number }[];
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar?: string;
}

// Mock data from catalog
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Домашняя паста Карбонара',
    description: 'Классическая итальянская паста с беконом, яйцом и сыром пармезан',
    price: 450,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGRpc2h8ZW58MXx8fHwxNzY3NzkzOTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Мария Петрова' },
    rating: 4.8,
    reviewsCount: 24,
    distance: '1.2 км',
    category: 'Основные блюда',
  },
  {
    id: '2',
    title: 'Свежие круассаны',
    description: 'Слоёные круассаны на французском масле, готовятся каждое утро',
    price: 150,
    image: 'https://images.unsplash.com/photo-1724879703317-a2686a97f767?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlZCUyMGdvb2RzJTIwcGFzdHJ5fGVufDF8fHx8MTc2NzgyMTIxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Анна Смирнова' },
    rating: 5.0,
    reviewsCount: 42,
    distance: '0.8 км',
    category: 'Выпечка',
  },
  {
    id: '3',
    title: 'Борщ ��о-домашнему',
    description: 'Наваристый борщ на говяжьем бульоне со сметаной и пампушками',
    price: 320,
    image: 'https://images.unsplash.com/photo-1701109876066-7fc0c08da447?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VwJTIwYm93bHxlbnwxfHx8fDE3Njc3NDgxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Елена Кузнецова' },
    rating: 4.9,
    reviewsCount: 38,
    distance: '2.1 км',
    category: 'Супы',
  },
  {
    id: '4',
    title: 'Греческий салат',
    description: 'Свежие овощи с сыром фета, оливками и оливковым маслом',
    price: 280,
    image: 'https://images.unsplash.com/photo-1692780941266-96892bb6c9df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHl8ZW58MXx8fHwxNjc3NzU2NDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Дмитрий Волков' },
    rating: 4.7,
    reviewsCount: 19,
    distance: '1.5 км',
    category: 'Салаты',
  },
  {
    id: '5',
    title: 'Тирамису',
    description: 'Нежный итальянский десерт с маскарпоне и кофейной пропиткой',
    price: 380,
    image: 'https://images.unsplash.com/photo-1679942262057-d5732f732841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwY2FrZXxlbnwxfHx8fDE3Njc3MjQxODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Ольга Соколова' },
    rating: 4.9,
    reviewsCount: 31,
    distance: '1.8 км',
    category: 'Десерты',
  },
  {
    id: '6',
    title: 'Маргарита на тонком тесте',
    description: 'Пицца с томатами, моцареллой и свежим базиликом',
    price: 520,
    image: 'https://images.unsplash.com/photo-1614442316719-1e38c661c29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGhvbWVtYWRlfGVufDF8fHx8MTc2Nzc4NzY5MHww&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Иван Морозов' },
    rating: 4.8,
    reviewsCount: 27,
    distance: '0.9 км',
    category: 'Основные блюда',
  },
  {
    id: '7',
    title: 'Клаб-сэндвич',
    description: 'Многослойный сэндвич с курицей, беконом, овощами и соусом',
    price: 340,
    image: 'https://images.unsplash.com/photo-1763647814142-b1eb054d42f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGZyZXNofGVufDF8fHx8MTc2Nzc3NTA2MXww&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Светлана Попова' },
    rating: 4.6,
    reviewsCount: 15,
    distance: '1.3 км',
    category: 'Основные блюда',
  },
  {
    id: '8',
    title: 'Рамен с курицей',
    description: 'Японский суп с лапшой, курицей, яйцом и овощами',
    price: 420,
    image: 'https://images.unsplash.com/photo-1707814200474-0ef16da97304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYW1lbiUyMGJvd2x8ZW58MXx8fHwxNjc3NzU2NDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    chef: { name: 'Андрей Новиков' },
    rating: 4.9,
    reviewsCount: 33,
    distance: '2.0 км',
    category: 'Супы',
  },
];

// Generate detailed product data
function generateDetailedProduct(baseProduct: Product): DetailedProduct {
  const ingredientsMap: { [key: string]: string[] } = {
    '1': ['Спагетти 200г', 'Бекон гуанчале 100г', 'Яйца фермерские 3 шт', 'Пармезан Reggiano 80г', 'Черный перец', 'Соль'],
    '2': ['Мука пшеничная 300г', 'Французское масло 200г', 'Дрожжи 10г', 'Молоко 100мл', 'Сахар 30г', 'Соль 8г'],
    '3': ['Говядина 400г', 'Свекла 300г', 'Капуста 200г', 'Морковь 100г', 'Картофель 300г', 'Томатная паста 50г', 'Сметана', 'Пампушки'],
    '4': ['Помидоры 200г', '��гурцы 150г', 'Сыр фета 100г', 'Оливки 50г', 'Красный лук 50г', 'Оливковое масло', 'Орегано'],
    '5': ['Маскарпоне 250г', 'Савоярди печенье 200г', 'Эспрессо 100мл', 'Яйца 3 шт', 'Сахар 80г', 'Какао-порошок'],
    '6': ['Тесто для пиццы 300г', 'Томатный соус 100г', 'Моцарелла 200г', 'Свежий базилик', 'Оливковое масло', 'Соль'],
    '7': ['Куриное филе 150г', 'Бекон 50г', 'Хлеб тостовый 3 листа', 'Помидоры', 'Салат', 'Майонез', 'Горчица'],
    '8': ['Лапша рамен 150г', 'Куриное филе 200г', 'Яйцо 1 шт', 'Зеленый лук', 'Нори', 'Кунжут', 'Бульон 400мл'],
  };

  const allergensMap: { [key: string]: string[] } = {
    '1': ['Яйца', 'Глютен', 'Молочные продукты'],
    '2': ['Глютен', 'Молочные продукты'],
    '3': ['Глютен'],
    '4': ['Молочные продукты'],
    '5': ['Яйца', 'Глютен', 'Молочные продукты'],
    '6': ['Глютен', 'Молочные продукты'],
    '7': ['Глютен', 'Яйца'],
    '8': ['Глютен', 'Яйца', 'Соя'],
  };

  const chefBios: { [key: string]: string } = {
    'Мария Петрова': 'Профессиональный шеф-повар с 10-летним опытом работы в итальянских ресторанах. Специализируюсь на традиционной пасте и ризотто.',
    'Анна Смирнова': 'Кондитер с французским образованием. Готовлю свежую выпечку каждое утро по классическим рецептам.',
    'Елена Кузнецова': 'Домашний повар с 15-летним опытом. Готовлю традиционные русские блюда по семейным рецептам.',
    'Дмитрий Волков': 'Специалист по здоровому питанию. Использую только свежие фермерские продукты.',
    'Ольга Соколова': 'Кондитер-профессионал. Специализируюсь на итальянских десертах и тортах на заказ.',
    'Иван Морозов': 'Пиццайоло с опытом работы в Неаполе. Готовлю настоящую итальянскую пиццу на дровах.',
    'Светлана Попова': 'Повар европейской кухни. Люблю экспериментировать с классическими рецептами.',
    'Андрей Новиков': 'Специалист по азиатской кухне. Обучался в Токио, готовлю аутентичный рамен.',
  };

  // Значения по умолчанию для опциональных полей
  const image = baseProduct.image || '/placeholder.jpg';
  const chef = baseProduct.chef || { name: 'Неизвестно' };
  const rating = baseProduct.rating || 4.5;
  const reviewsCount = baseProduct.reviewsCount || 10;

  return {
    ...baseProduct,
    chef, // Явно указываем обязательные поля
    rating,
    reviewsCount,
    images: [image, image, image],
    fullDescription: `${baseProduct.description}. Готовлю с любовью и использую только свежие качественные ингредиенты. Каждое блюдо готовится индивидуально под заказ, что гарантирует максимальную свежесть и вкус.`,
    weight: '350 г',
    prepTime: '30-40 минут',
    ingredients: ingredientsMap[baseProduct.id] || ['Свежие продукты', 'Специи', 'Любовь'],
    allergens: allergensMap[baseProduct.id],
    chefBio: chefBios[chef.name] || 'Опытный домашний повар. Готовлю с душой и использую проверенные рецепты.',
    chefImage: 'https://images.unsplash.com/photo-1609248419815-e9ba18851962?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY29va2luZyUyMGtpdGNoZW58ZW58MXx8fHwxNzY3ODIzNTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    chefRating: Math.min(rating + 0.1, 5.0),
    chefOrders: reviewsCount * 6 + Math.floor(Math.random() * 50),
    portionSizes: [
      { label: 'Стандарт (350г)', price: baseProduct.price },
      { label: 'Большая (500г)', price: Math.round(baseProduct.price * 1.4) },
    ],
    reviews: [
      {
        id: '1',
        author: 'Дмитрий К.',
        rating: 5,
        date: '2 дня назад',
        comment: 'Очень вкусно! Заказываю не первый раз, всегда на высшем уровне. Рекомендую всем!',
      },
      {
        id: '2',
        author: 'Анна М.',
        rating: rating >= 4.8 ? 5 : 4,
        date: '1 неделя назад',
        comment: 'Отличное блюдо! Свежие ингредиенты, большие порции. Обязательно закажу еще.',
      },
      {
        id: '3',
        author: 'Сергей П.',
        rating: Math.floor(rating),
        date: '2 недели назад',
        comment: 'Хорошо приготовлено, вкусно. Доставка была быстрой, все упаковано аккуратно.',
      },
    ],
  };
}

export function ProductDetail({ productId, onBack, onProductClick, onSellerClick, product: productFromProps, similarProducts: similarProductsFromProps }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPortion, setSelectedPortion] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Используем переданный товар или ищем в моках (для обратной совместимости)
  const baseProduct = productFromProps || mockProducts.find((product) => product.id === productId);

  if (!baseProduct) {
    return (
      <div className={styles.notFound}>
        <h2>Товар не найден</h2>
        <button onClick={onBack} className={styles.backButton}>
          Вернуться к каталогу
        </button>
      </div>
    );
  }

  const product = generateDetailedProduct(baseProduct);

  const currentPrice = product.portionSizes
    ? product.portionSizes[selectedPortion].price
    : product.price;
  const totalPrice = currentPrice * quantity;

  // Используем переданные похожие товары или ищем в моках
  const similarProducts = similarProductsFromProps || mockProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className={styles.productDetail}>
      <div className={styles.container}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <button onClick={onBack} className={styles.breadcrumbLink}>
            Каталог
          </button>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.category}</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.title}</span>
        </div>

        {/* Top section: Images + Chef/Order */}
        <div className={styles.topSection}>
          {/* Left column - Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img 
                src={product.images[selectedImage]} 
                alt={product.title}
                className={styles.image}
                onClick={() => setLightboxOpen(true)}
              />
              <div className={styles.imageActions}>
                <button 
                  className={`${styles.iconButton} ${isFavorite ? styles.favorite : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button className={styles.iconButton}>
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            <div className={styles.thumbnails}>
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right column - Chef info & Order */}
          <div className={styles.sideSection}>
            {/* Chef Card - Detailed */}
            <div className={styles.chefCard}>
              <div className={styles.chefCardHeader}>
                <h3 className={styles.sectionTitleSmall}>О продавце</h3>
              </div>
              
              <div className={styles.chefProfile}>
                <div className={styles.chefImageLarge}>
                  <img src={product.chefImage} alt={product.chef.name} />
                </div>
                <div className={styles.chefInfo}>
                  <h3 className={styles.chefName}>{product.chef.name}</h3>
                  <div className={styles.chefBadge}>
                    <ChefHat size={14} />
                    Проверенный повар
                  </div>
                  <div className={styles.chefStats}>
                    <div className={styles.chefStat}>
                      <Star size={16} fill="currentColor" />
                      <span>{product.chefRating}</span>
                    </div>
                    <div className={styles.chefStat}>
                      <ShoppingCart size={16} />
                      <span>{product.chefOrders} заказов</span>
                    </div>
                    <div className={styles.chefStat}>
                      <MapPin size={16} />
                      <span>{product.distance}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className={styles.chefBio}>{product.chefBio}</p>

              <button className={styles.viewChefButton} onClick={onSellerClick}>
                Все блюда повара
              </button>
            </div>

            {/* Order Card */}
            <div className={styles.orderCard}>
              <div className={styles.orderCardHeader}>
                <h3 className={styles.sectionTitleSmall}>Оформить заказ</h3>
              </div>

              {/* Portion sizes */}
              {product.portionSizes && (
                <div className={styles.portionSizes}>
                  <div className={styles.portionLabel}>Размер порции</div>
                  <div className={styles.portionButtons}>
                    {product.portionSizes.map((portion, index) => (
                      <button
                        key={index}
                        className={`${styles.portionButton} ${selectedPortion === index ? styles.active : ''}`}
                        onClick={() => setSelectedPortion(index)}
                      >
                        <span>{portion.label}</span>
                        <span className={styles.portionPrice}>{portion.price} ₽</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price and quantity */}
              <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Цена за порцию</span>
                  <span className={styles.price}>{currentPrice} ₽</span>
                </div>
                
                <div className={styles.quantityRow}>
                  <span className={styles.quantityLabel}>Количество</span>
                  <div className={styles.quantitySelector}>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={18} />
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Итого</span>
                  <span className={styles.totalPrice}>{totalPrice} ₽</span>
                </div>
              </div>

              <button className={styles.addToCartButton}>
                <ShoppingCart size={20} />
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section: Product details full width */}
        <div className={styles.productInfoSection}>
          {/* Product header */}
          <div className={styles.productMainInfo}>
            <div className={styles.categoryBadge}>{product.category}</div>
            <h1 className={styles.productTitle}>{product.title}</h1>
            <div className={styles.productMeta}>
              <div className={styles.rating}>
                <Star size={20} fill="currentColor" />
                <span className={styles.ratingValue}>{product.rating}</span>
                <span className={styles.reviewsCount}>({product.reviewsCount} отзывов)</span>
              </div>
              <div className={styles.productDetails}>
                <span className={styles.detailItem}>
                  <Clock size={18} />
                  {product.prepTime}
                </span>
                <span className={styles.detailItem}>
                  <Award size={18} />
                  {product.weight}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={styles.descriptionBlock}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <p className={styles.description}>{product.fullDescription}</p>
          </div>

          {/* Ingredients */}
          <div className={styles.ingredientsBlock}>
            <h2 className={styles.sectionTitle}>Состав</h2>
            <ul className={styles.ingredientsList}>
              {product.ingredients.map((ingredient, index) => (
                <li key={index} className={styles.ingredient}>
                  <CheckCircle size={16} />
                  {ingredient}
                </li>
              ))}
            </ul>
            {/* Allergens */}
            {product.allergens && product.allergens.length > 0 && (
              <div className={styles.allergens}>
                <strong>⚠️ Аллергены:</strong> {product.allergens.join(', ')}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className={styles.reviewsBlock}>
            <div className={styles.reviewsHeader}>
              <h2 className={styles.sectionTitle}>Отзывы покупателей</h2>
              <div className={styles.overallRating}>
                <div className={styles.ratingNumber}>{product.rating}</div>
                <div>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <div className={styles.reviewsCountText}>{product.reviewsCount} отзывов</div>
                </div>
              </div>
            </div>

            <div className={styles.reviewsList}>
              {product.reviews.map((review) => (
                <div key={review.id} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAuthor}>
                      <div className={styles.reviewAvatar}>
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.reviewAuthorName}>{review.author}</div>
                        <div className={styles.reviewDate}>{review.date}</div>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))}
            </div>

            <button className={styles.writeReviewButton}>
              <MessageCircle size={20} />
              Написать отзыв
            </button>
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className={styles.similarSection}>
            <h2 className={styles.sectionTitle}>Похожие блюда</h2>
            <div className={styles.similarGrid}>
              {similarProducts.map((similarProduct) => (
                <ProductCard
                  key={similarProduct.id}
                  product={similarProduct}
                  onClick={() => {
                    onProductClick(similarProduct.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for images */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={product.images.map((image) => ({ src: image }))}
        index={selectedImage}
        plugins={[Zoom, Fullscreen, Thumbnails]}
      />
    </div>
  );
}