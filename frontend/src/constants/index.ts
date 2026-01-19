// Статусы пользователей
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION'
} as const;

// Статусы товаров
export const PRODUCT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

// Категории товаров
export const PRODUCT_CATEGORIES = [
  { id: 'bakery', name: 'Выпечка' },
  { id: 'desserts', name: 'Десерты' },
  { id: 'snacks', name: 'Закуски' },
  { id: 'hot-dishes', name: 'Горячие блюда' },
  { id: 'soups', name: 'Супы' },
  { id: 'salads', name: 'Салаты' },
  { id: 'breakfast', name: 'Завтраки' },
  { id: 'drinks', name: 'Напитки' },
  { id: 'semi-finished', name: 'Полуфабрикаты' },
  { id: 'preserves', name: 'Заготовки' },
] as const;

// Массив только названий для форм
export const CATEGORY_NAMES = PRODUCT_CATEGORIES.map(cat => cat.name);
