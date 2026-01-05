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

// Статусы откликов
export const LEAD_STATUS = {
  PENDING: 'PENDING',
  CONTACTED: 'CONTACTED',
  CLOSED: 'CLOSED'
} as const;

// Категории товаров
export const PRODUCT_CATEGORIES = [
  'Выпечка',
  'Основные блюда',
  'Десерты',
  'Напитки',
  'Закуски',
  'Другое'
] as const;
