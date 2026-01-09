import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import styles from './Filters.module.css';

export interface FilterState {
  categories: string[];
  cuisines: string[];
  maxPrice: number;
  minRating: string;
}

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [priceRange, setPriceRange] = useState(100000000); // Большое значение по умолчанию
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    'Супы',
    'Основные блюда',
    'Салаты',
    'Выпечка',
    'Десерты',
    'Напитки',
  ];

  const cuisines = [
    'Русская',
    'Итальянская',
    'Азиатская',
    'Грузинская',
    'Европейская',
    'Вегетарианская',
  ];

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    notifyFilterChange(newCategories, selectedCuisines, priceRange, minRating);
  };

  const handleCuisineToggle = (cuisine: string) => {
    const newCuisines = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter(c => c !== cuisine)
      : [...selectedCuisines, cuisine];
    
    setSelectedCuisines(newCuisines);
    notifyFilterChange(selectedCategories, newCuisines, priceRange, minRating);
  };

  const handlePriceChange = (newPrice: number) => {
    setPriceRange(newPrice);
    notifyFilterChange(selectedCategories, selectedCuisines, newPrice, minRating);
  };

  const handleRatingChange = (newRating: string) => {
    setMinRating(newRating);
    notifyFilterChange(selectedCategories, selectedCuisines, priceRange, newRating);
  };

  const notifyFilterChange = (categories: string[], cuisines: string[], maxPrice: number, rating: string) => {
    if (onFilterChange) {
      onFilterChange({
        categories,
        cuisines,
        maxPrice,
        minRating: rating,
      });
    }
  };

  const handleReset = () => {
    setPriceRange(2000);
    setSelectedCategories([]);
    setSelectedCuisines([]);
    setMinRating('all');
    notifyFilterChange([], [], 2000, 'all');
  };

  const activeFiltersCount = selectedCategories.length + selectedCuisines.length + 
    (minRating !== 'all' ? 1 : 0);

  const filtersContent = (
    <>
      <h3 className={styles.title}>Фильтры</h3>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Категория</div>
        <div className={styles.checkboxGroup}>
          {categories.map(category => (
            <label key={category} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Кухня</div>
        <div className={styles.checkboxGroup}>
          {cuisines.map(cuisine => (
            <label key={cuisine} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedCuisines.includes(cuisine)}
                onChange={() => handleCuisineToggle(cuisine)}
              />
              <span>{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Цена за порцию</div>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          value={priceRange}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className={styles.rangeInput}
        />
        <div className={styles.rangeLabel}>
          <span>0 ₽</span>
          <span>{priceRange} ₽</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Минимальный рейтинг</div>
        <select
          value={minRating}
          onChange={(e) => handleRatingChange(e.target.value)}
          className={styles.select}
        >
          <option value="all">Все</option>
          <option value="4.5">4.5+ звёзд</option>
          <option value="4.0">4.0+ звёзд</option>
          <option value="3.5">3.5+ звёзд</option>
          <option value="3.0">3.0+ звёзд</option>
        </select>
      </div>

      <button onClick={handleReset} className={styles.resetButton}>
        Сбросить фильтры
      </button>
    </>
  );

  return (
    <>
      <button
        className={styles.mobileFiltersButton}
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <SlidersHorizontal size={20} />
        Фильтры
        {activeFiltersCount > 0 && (
          <span className={styles.filterBadge}>{activeFiltersCount}</span>
        )}
      </button>

      {showMobileFilters && (
        <div className={styles.mobileOverlay} onClick={() => setShowMobileFilters(false)}>
          <div className={styles.mobilePanel} onClick={(e) => e.stopPropagation()}>
            {filtersContent}
            <button 
              className={styles.applyButton}
              onClick={() => setShowMobileFilters(false)}
            >
              Применить фильтры
            </button>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        {filtersContent}
      </div>
    </>
  );
}