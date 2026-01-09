import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts } from '../../store/slices/productsSlice';
import { SellerProfile } from './SellerProfile';

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    // Загружаем все товары, потом отфильтруем по seller_id
    // TODO: добавить API endpoint для получения товаров конкретного продавца
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Фильтруем товары по ID продавца
  const sellerProducts = products.filter(p => p.seller_id === id);
  const seller = sellerProducts[0]?.seller;

  const handleBack = () => {
    navigate(-1);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleMessageClick = () => {
    // TODO: открыть чат с продавцом
    navigate('/messages');
  };

  if (loading && sellerProducts.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Загрузка...</h2>
      </div>
    );
  }

  if (!seller && !loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Продавец не найден</h2>
        <button onClick={handleBack} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Назад
        </button>
      </div>
    );
  }

  return (
    <SellerProfile
      sellerId={id || ''}
      seller={seller}
      products={sellerProducts}
      onBack={handleBack}
      onProductClick={handleProductClick}
      onMessageClick={handleMessageClick}
    />
  );
}
