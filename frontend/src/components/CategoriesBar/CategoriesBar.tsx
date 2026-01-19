import { useState } from 'react';
import {
  Croissant,
  IceCream,
  Pizza,
  Flame,
  Soup,
  Salad,
  Coffee,
  Wine,
  Package,
  Archive,
  type LucideIcon
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../constants';
import { CategoryTile } from '../CategoryTile/CategoryTile';
import styles from './CategoriesBar.module.scss';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

// Маппинг id категорий к иконкам
const categoryIcons: Record<string, LucideIcon> = {
  'bakery': Croissant,
  'desserts': IceCream,
  'snacks': Pizza,
  'hot-dishes': Flame,
  'soups': Soup,
  'salads': Salad,
  'breakfast': Coffee,
  'drinks': Wine,
  'semi-finished': Package,
  'preserves': Archive,
};

// Добавляем иконки к категориям из constants
const categories: Category[] = PRODUCT_CATEGORIES.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: categoryIcons[cat.id] || Pizza, // fallback
}));

interface CategoriesBarProps {
  onCategorySelect?: (categoryId: string | null) => void;
  activeCategory?: string | null;
}

export function CategoriesBar({ onCategorySelect, activeCategory }: CategoriesBarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategory || null);

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    onCategorySelect?.(newCategory);
  };

  return (
    <div className={styles.categoriesBar}>
      <div className={styles.container}>
        <div className={styles.scrollWrapper}>
          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                name={category.name}
                icon={category.icon}
                onClick={() => handleCategoryClick(category.id)}
                isActive={selectedCategory === category.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { categories };