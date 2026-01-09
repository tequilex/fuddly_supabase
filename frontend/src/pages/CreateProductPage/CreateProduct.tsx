import React, { useState, useEffect } from 'react';
import {
  Upload,
  X,
  ImagePlus,
  ChevronDown,
  Plus,
  Minus,
  Info,
  MapPin,
  Clock,
  Users,
  Check
} from 'lucide-react';
import { storage, validateImageFiles } from '../../shared/api/storage';
import styles from './CreateProduct.module.scss';

interface CreateProductProps {
  onBack?: () => void;
  onPublish?: (data: {
    title: string;
    description: string;
    price: number;
    category: string;
    region: string;
    images?: string[];
  }) => void;
  isLoading?: boolean;
}

const categories = [
  'Супы',
  'Основные блюда',
  'Салаты',
  'Закуски',
  'Выпечка',
  'Торты',
  'Десерты',
  'Напитки',
  'Заготовки',
  'Другое'
];

const cuisineTypes = [
  'Русская',
  'Украинская',
  'Грузинская',
  'Армянская',
  'Узбекская',
  'Итальянская',
  'Азиатская',
  'Европейская',
  'Восточная',
  'Авторская'
];

const deliveryOptions = [
  { id: 'pickup', label: 'Самовывоз', icon: MapPin },
  { id: 'delivery', label: 'Доставка', icon: MapPin }
];

interface ImageState {
  preview: string;      // Blob URL для превью
  url?: string;         // Реальный URL из Supabase (после загрузки)
  path?: string;        // Storage path для удаления
  file: File;           // Оригинальный файл
  progress: number;     // 0-100
  error?: string;       // Ошибка загрузки
  uploaded: boolean;    // Флаг успешной загрузки
}

export function CreateProduct({ onBack, onPublish, isLoading }: CreateProductProps) {
  const [imageStates, setImageStates] = useState<ImageState[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    cuisine: '',
    price: '',
    weight: '',
    servings: '',
    cookingTime: '',
    description: '',
    ingredients: '',
    address: '',
    deliveryTypes: ['pickup'] as string[],
    deliveryPrice: '',
    deliveryRadius: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraft, setIsDraft] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || isUploading) return;

    const fileArray = Array.from(files);

    // Проверка лимита
    if (imageStates.length + fileArray.length > 10) {
      setUploadErrors(prev => [...prev, 'Максимум 10 фотографий']);
      return;
    }

    // Валидация через storage API
    const validationErrors = validateImageFiles(fileArray, 10);
    if (validationErrors.length > 0) {
      setUploadErrors(prev => [...prev, ...validationErrors.map(e => `${e.fileName}: ${e.error}`)]);
      return;
    }

    setIsUploading(true);

    // Создаем ImageState для каждого файла
    const newImageStates: ImageState[] = fileArray.map(file => ({
      preview: URL.createObjectURL(file),
      file,
      progress: 0,
      uploaded: false,
    }));

    setImageStates(prev => [...prev, ...newImageStates]);

    // Загружаем каждый файл
    for (const imageState of newImageStates) {
      try {
        const result = await storage.uploadImage(
          imageState.file,
          'products',
          (progress) => {
            // Обновляем прогресс
            setImageStates(prev =>
              prev.map(img =>
                img.preview === imageState.preview
                  ? { ...img, progress: progress.percentage }
                  : img
              )
            );
          }
        );

        // Успешная загрузка - сохранить URL и path
        setImageStates(prev =>
          prev.map(img =>
            img.preview === imageState.preview
              ? {
                  ...img,
                  url: result.url,
                  path: result.path,
                  uploaded: true,
                  progress: 100
                }
              : img
          )
        );
      } catch (error: any) {
        // Ошибка загрузки
        setImageStates(prev =>
          prev.map(img =>
            img.preview === imageState.preview
              ? { ...img, error: error.message, progress: 0 }
              : img
          )
        );
        setUploadErrors(prev => [...prev, `${imageState.file.name}: ${error.message}`]);
      }
    }

    setIsUploading(false);
  };

  const removeImage = async (index: number) => {
    const imageState = imageStates[index];

    // Если изображение загружено, удалить из Supabase
    if (imageState.uploaded && imageState.path) {
      try {
        await storage.deleteImage(imageState.path);
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
        // Не блокируем удаление из UI даже если backend не удалил
      }
    }

    // Освободить blob URL
    URL.revokeObjectURL(imageState.preview);

    // Удалить из state
    setImageStates(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Убираем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeliveryToggle = (type: string) => {
    setFormData(prev => {
      const deliveryTypes = prev.deliveryTypes.includes(type)
        ? prev.deliveryTypes.filter(t => t !== type)
        : [...prev.deliveryTypes, type];
      return { ...prev, deliveryTypes };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Укажите название блюда';
    }
    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Укажите корректную цену';
    }

    // Проверить uploadedImages вместо images
    const uploadedImages = imageStates.filter(img => img.uploaded);
    if (uploadedImages.length === 0) {
      newErrors.images = 'Добавьте хотя бы одну фотографию';
    }

    if (!formData.description.trim() || formData.description.length < 50) {
      newErrors.description = 'Описание должно содержать минимум 50 символов';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Укажите адрес';
    }
    if (formData.deliveryTypes.length === 0) {
      newErrors.delivery = 'Выберите хотя бы один способ получения';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (saveAsDraft: boolean = false) => {
    if (!saveAsDraft && !validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Проверить что все изображения загружены
    const uploadingImages = imageStates.filter(img => !img.uploaded && !img.error);
    if (uploadingImages.length > 0) {
      setErrors(prev => ({ ...prev, images: 'Дождитесь завершения загрузки всех изображений' }));
      return;
    }

    // Собрать URLs успешно загруженных изображений
    const uploadedUrls = imageStates
      .filter(img => img.uploaded && img.url)
      .map(img => img.url!);

    if (uploadedUrls.length === 0 && !saveAsDraft) {
      setErrors(prev => ({ ...prev, images: 'Добавьте хотя бы одну фотографию' }));
      return;
    }

    setIsDraft(saveAsDraft);

    // Формируем данные для отправки
    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      region: formData.address, // address используется как region
      images: uploadedUrls, // Массив реальных URLs из Supabase
    };

    // Вызываем callback для публикации
    if (onPublish) {
      onPublish(productData);
    } else {
      // Fallback для старого поведения
      setTimeout(() => {
        alert(saveAsDraft ? 'Черновик сохранён!' : 'Объявление опубликовано!');
      }, 500);
    }
  };

  // Очистка blob URLs при размонтировании
  useEffect(() => {
    return () => {
      imageStates.forEach(img => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, [imageStates]);

  return (
    <div className={styles.createProductPage}>
      <div className={styles.container}>
        {/* Хлебные крошки */}
        <div className={styles.breadcrumbs}>
          <button onClick={onBack} className={styles.backButton}>
            Мои объявления
          </button>
          <span className={styles.separator}>/</span>
          <span>Новое объявление</span>
        </div>

        <div className={styles.pageHeader}>
          <h1>Создать объявление</h1>
          <p className={styles.pageSubtitle}>
            Заполните информацию о вашем блюде, чтобы покупатели могли его найти
          </p>
        </div>

        <div className={styles.formLayout}>
          {/* Основная форма */}
          <div className={styles.mainForm}>
            {/* Фотографии */}
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2>Фотографии</h2>
                <span className={styles.required}>*</span>
              </div>
              <p className={styles.sectionHint}>
                Первое фото будет использоваться как обложка. Добавьте до 10 фотографий.
              </p>

              {errors.images && (
                <div className={styles.errorMessage}>{errors.images}</div>
              )}

              <div className={styles.imagesGrid}>
                {imageStates.map((imageState, index) => (
                  <div key={imageState.preview} className={styles.imagePreview}>
                    <img src={imageState.preview} alt={`Preview ${index + 1}`} />

                    {/* Прогресс загрузки */}
                    {!imageState.uploaded && !imageState.error && (
                      <div className={styles.progressOverlay}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${imageState.progress}%` }}
                          />
                        </div>
                        <span className={styles.progressText}>{imageState.progress}%</span>
                      </div>
                    )}

                    {/* Ошибка */}
                    {imageState.error && (
                      <div className={styles.errorOverlay}>
                        <span className={styles.errorText}>Ошибка</span>
                      </div>
                    )}

                    {/* Успешная загрузка */}
                    {imageState.uploaded && (
                      <div className={styles.successIndicator}>✓</div>
                    )}

                    <button
                      className={styles.removeImageButton}
                      onClick={() => removeImage(index)}
                      type="button"
                      disabled={!imageState.uploaded && !imageState.error}
                    >
                      <X size={16} />
                    </button>

                    {index === 0 && (
                      <div className={styles.mainBadge}>Обложка</div>
                    )}
                  </div>
                ))}

                {imageStates.length < 10 && (
                  <label className={`${styles.uploadButton} ${isUploading ? styles.uploadButtonDisabled : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={isUploading || imageStates.length >= 10}
                    />
                    <ImagePlus size={32} />
                    <span>{isUploading ? 'Загрузка...' : 'Добавить фото'}</span>
                  </label>
                )}
              </div>

              {/* Ошибки загрузки */}
              {uploadErrors.length > 0 && (
                <div className={styles.uploadErrorsList}>
                  {uploadErrors.map((error, idx) => (
                    <div key={idx} className={styles.uploadError}>{error}</div>
                  ))}
                </div>
              )}
            </section>

            {/* Основная информация */}
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2>Основная информация</h2>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Название блюда <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                  placeholder="Например: Борщ украинский со сметаной"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={100}
                />
                <div className={styles.inputFooter}>
                  {errors.title && (
                    <span className={styles.errorText}>{errors.title}</span>
                  )}
                  <span className={styles.charCount}>{formData.title.length}/100</span>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Категория <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className={styles.selectIcon} />
                  </div>
                  {errors.category && (
                    <span className={styles.errorText}>{errors.category}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Кухня</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={formData.cuisine}
                      onChange={(e) => handleInputChange('cuisine', e.target.value)}
                    >
                      <option value="">Выберите кухню</option>
                      {cuisineTypes.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className={styles.selectIcon} />
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Цена <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithUnit}>
                    <input
                      type="number"
                      className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      min="0"
                    />
                    <span className={styles.unit}>₽</span>
                  </div>
                  {errors.price && (
                    <span className={styles.errorText}>{errors.price}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Вес/объём</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Например: 500 г, 1 л"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Users size={16} />
                    Количество порций
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="1"
                    value={formData.servings}
                    onChange={(e) => handleInputChange('servings', e.target.value)}
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    Время приготовления
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Например: 2 часа"
                    value={formData.cookingTime}
                    onChange={(e) => handleInputChange('cookingTime', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Описание */}
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2>Описание</h2>
                <span className={styles.required}>*</span>
              </div>
              <p className={styles.sectionHint}>
                Расскажите о вашем блюде: как оно приготовлено, что входит в состав, какой вкус
              </p>

              <div className={styles.formGroup}>
                <textarea
                  className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                  placeholder="Опишите ваше блюдо подробно..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  maxLength={2000}
                />
                <div className={styles.inputFooter}>
                  {errors.description && (
                    <span className={styles.errorText}>{errors.description}</span>
                  )}
                  <span className={styles.charCount}>{formData.description.length}/2000</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Состав и ингредиенты</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Перечислите основные ингредиенты..."
                  value={formData.ingredients}
                  onChange={(e) => handleInputChange('ingredients', e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <div className={styles.inputFooter}>
                  <span className={styles.charCount}>{formData.ingredients.length}/1000</span>
                </div>
              </div>
            </section>

            {/* Доставка и получение */}
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h2>Доставка и получение</h2>
                <span className={styles.required}>*</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <MapPin size={16} />
                  Адрес <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                  placeholder="Введите ваш адрес"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
                {errors.address && (
                  <span className={styles.errorText}>{errors.address}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Способы получения</label>
                {errors.delivery && (
                  <div className={styles.errorMessage}>{errors.delivery}</div>
                )}
                <div className={styles.checkboxGroup}>
                  {deliveryOptions.map(option => (
                    <label key={option.id} className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.deliveryTypes.includes(option.id)}
                        onChange={() => handleDeliveryToggle(option.id)}
                      />
                      <span className={styles.checkboxCustom}>
                        {formData.deliveryTypes.includes(option.id) && (
                          <Check size={14} />
                        )}
                      </span>
                      <option.icon size={18} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.deliveryTypes.includes('delivery') && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Стоимость доставки</label>
                    <div className={styles.inputWithUnit}>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        value={formData.deliveryPrice}
                        onChange={(e) => handleInputChange('deliveryPrice', e.target.value)}
                        min="0"
                      />
                      <span className={styles.unit}>₽</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Радиус доставки</label>
                    <div className={styles.inputWithUnit}>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        value={formData.deliveryRadius}
                        onChange={(e) => handleInputChange('deliveryRadius', e.target.value)}
                        min="0"
                      />
                      <span className={styles.unit}>км</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Боковая панель с подсказками */}
          <aside className={styles.sidebar}>
            <div className={styles.helpCard}>
              <div className={styles.helpIcon}>
                <Info size={24} />
              </div>
              <h3>Советы для хорошего объявления</h3>
              <ul className={styles.helpList}>
                <li>Добавьте качественные фотографии блюда</li>
                <li>Опишите вкус и особенности приготовления</li>
                <li>Укажите все ингредиенты для аллергиков</li>
                <li>Будьте честны с весом и порциями</li>
                <li>Укажите реальное время приготовления</li>
                <li>Ответьте на вопросы покупателей быстро</li>
              </ul>
            </div>

            <div className={styles.previewCard}>
              <h3>Ваше объявление будет видно</h3>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>~500</span>
                  <span className={styles.statLabel}>покупателей в день</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>24/7</span>
                  <span className={styles.statLabel}>круглосуточно</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Кнопки действий */}
        <div className={styles.actions}>
          <button
            className={styles.draftButton}
            onClick={() => handleSubmit(true)}
            type="button"
            disabled={isLoading}
          >
            <span className={styles.draftFullText}>Сохранить как черновик</span>
            <span className={styles.draftShortText}>Черновик</span>
          </button>
          <button
            className={styles.publishButton}
            onClick={() => handleSubmit(false)}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? 'Публикация...' : 'Опубликовать'}
          </button>
        </div>
      </div>
    </div>
  );
}