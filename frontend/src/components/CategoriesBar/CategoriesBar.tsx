import React, { useState } from 'react';
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
  LucideIcon
} from 'lucide-react';
import { CategoryTile } from '../CategoryTile/CategoryTile';
import styles from './CategoriesBar.module.scss';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { id: 'bakery', name: 'Выпечка', icon: Croissant },
  { id: 'desserts', name: 'Десерты', icon: IceCream },
  { id: 'snacks', name: 'Закуски', icon: Pizza },
  { id: 'hot-dishes', name: 'Горячие блюда', icon: Flame },
  { id: 'soups', name: 'Супы', icon: Soup },
  { id: 'salads', name: 'Салаты', icon: Salad },
  { id: 'breakfast', name: 'Завтраки', icon: Coffee },
  { id: 'drinks', name: 'Напитки', icon: Wine },
  { id: 'semi-finished', name: 'Полуфабрикаты', icon: Package },
  { id: 'preserves', name: 'Заготовки', icon: Archive },
];

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