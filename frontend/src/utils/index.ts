// Утилиты из shared/api/storage
export { validateImageFiles, formatFileSize } from '../shared/api/storage';

// Дополнительные утилиты
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price);
};
