import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProduct } from '../../store/slices/productsSlice';
import { getOrCreateConversation } from '../../store/slices/chatsSlice';
import { toast } from 'sonner';
import { ProductDetail } from './ProductDetail';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProduct, products, loading } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
  }, [id, dispatch]);

  // Похожие товары - из той же категории
  const similarProducts = useMemo(() => {
    if (!currentProduct) return [];
    return products
      .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
      .slice(0, 4);
  }, [currentProduct, products]);

  const handleBack = () => {
    navigate('/');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleChatClick = async () => {
    // Проверяем авторизацию
    if (!user) {
      toast.error('Войдите в аккаунт, чтобы написать продавцу');
      navigate('/auth');
      return;
    }

    // Проверяем, что это не свой товар
    if (currentProduct?.seller_id === user.id) {
      toast.warning('Вы не можете написать сами себе');
      return;
    }

    try {
      // Создаем или получаем conversation через Redux thunk
      await dispatch(
        getOrCreateConversation({
          productId: currentProduct!.id,
          buyerId: user.id,
          sellerId: currentProduct!.seller_id!,
        })
      ).unwrap();

      // Переходим на страницу чата
      navigate('/messages');
      toast.success('Чат открыт');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Не удалось открыть чат');
    }
  };

  const handleSellerClick = () => {
    if (currentProduct?.seller_id) {
      navigate(`/seller/${currentProduct.seller_id}`);
    }
  };

  if (loading && !currentProduct) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Загрузка...</h2>
      </div>
    );
  }

  if (!id || !currentProduct) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Товар не найден</h2>
        <button onClick={handleBack} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Вернуться к каталогу
        </button>
      </div>
    );
  }

  return (
    <ProductDetail
      productId={id}
      product={currentProduct}
      similarProducts={similarProducts}
      onBack={handleBack}
      onProductClick={handleProductClick}
      onSellerClick={handleSellerClick}
      onChatClick={handleChatClick}
    />
  );
}
