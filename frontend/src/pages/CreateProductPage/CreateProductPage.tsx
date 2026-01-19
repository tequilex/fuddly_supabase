import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProduct } from '../../store/slices/productsSlice';
import { CreateProduct } from './CreateProduct';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.products);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate('/');
  };

  const handlePublish = async (productData: {
    title: string;
    description: string;
    price: number;
    category: string;
    region: string;
    images?: string[];
  }) => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(createProduct(productData));

      if (createProduct.fulfilled.match(result)) {
        toast.success('Объявление успешно создано!');
        navigate('/profile'); // Переходим в профиль где показаны все товары пользователя
      } else {
        toast.error(error || 'Не удалось создать объявление');
      }
    } catch (err) {
      toast.error('Произошла ошибка при создании объявления');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateProduct
      onBack={handleBack}
      onPublish={handlePublish}
      isLoading={loading || isSubmitting}
    />
  );
}
