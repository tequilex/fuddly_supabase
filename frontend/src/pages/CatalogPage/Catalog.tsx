import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts } from '../../store/slices/productsSlice';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductCardSkeleton } from '../../components/skeletons';
import { Filters, FilterState } from '../../components/Filters/Filters';
import { CategoriesBar } from '../../components/CategoriesBar/CategoriesBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMinimumLoadingTime } from '../../hooks/useMinimumLoadingTime';
import styles from './Catalog.module.scss';

export default function Catalog() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const showSkeleton = useMinimumLoadingTime(loading && products.length === 0, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    cuisines: [],
    maxPrice: 100000000, // Большое значение по умолчанию чтобы показывать все товары
    minRating: 'all',
  });
  const itemsPerPage = 100;

  // Загрузка товаров при монтировании
  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch]);

  // Маппинг ID категорий из CategoriesBar к названиям категорий в продуктах
  const categoryMapping: Record<string, string> = {
    bakery: 'Выпечка',
    desserts: 'Десерты',
    snacks: 'Закуски',
    'hot-dishes': 'Основные блюда',
    soups: 'Супы',
    salads: 'Салаты',
    breakfast: 'Завтраки',
    drinks: 'Напитки',
    'semi-finished': 'Полуфабрикаты',
    preserves: 'Заготовки',
  };

  // Обработчик выбора категории из CategoriesBar
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply category filter from CategoriesBar
    if (selectedCategory) {
      const categoryName = categoryMapping[selectedCategory];
      // TODO: когда будет поле category в Product type, раскомментировать
      // result = result.filter(p => p.category === categoryName);
    }

    // Apply category filter from sidebar
    if (filters.categories.length > 0) {
      // TODO: когда будет поле category в Product type
      // result = result.filter(p => filters.categories.includes(p.category || ''));
    }

    // Apply price filter
    result = result.filter((p) => p.price <= filters.maxPrice);

    // Apply rating filter
    if (filters.minRating !== 'all') {
      const minRating = parseFloat(filters.minRating);
      // TODO: когда будет поле rating в Product type
      // result = result.filter(p => p.rating >= minRating);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        // TODO: когда будет rating
        // result.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        // TODO: когда будет distance
        // result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      default:
        // popular
        result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [filters, sortBy, selectedCategory, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className={styles.catalog}>
      {/* Панель категорий */}
      <CategoriesBar onCategorySelect={handleCategorySelect} activeCategory={selectedCategory} />

      <div className={styles.header}>
        <h1 className={styles.title}>Каталог домашней еды</h1>
        <p className={styles.subtitle}>Найдите вкусные домашние блюда рядом с вами</p>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <Filters onFilterChange={handleFilterChange} />
        </aside>

        <main className={styles.main}>
          <div className={styles.topBar}>
            <div className={styles.resultsCount}>
              {loading ? 'Загрузка...' : `Найдено ${filteredProducts.length} предложений`}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
              <option value="popular">Популярные</option>
              <option value="price-asc">Цена: по возрастанию</option>
              <option value="price-desc">Цена: по убыванию</option>
              <option value="rating">Высокий рейтинг</option>
              <option value="distance">Ближайшие</option>
            </select>
          </div>

          {showSkeleton ? (
            <div className={styles.grid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className={styles.grid}>
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product.id)} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить фильтры поиска</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
