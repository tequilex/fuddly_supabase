import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyProducts } from '../../store/slices/productsSlice';
import { Profile } from './Profile';

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myProducts, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    // Загружаем товары пользователя при монтировании
    dispatch(fetchMyProducts());
  }, [dispatch]);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleCreateProduct = () => {
    navigate('/create-product');
  };

  if (loading && myProducts.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Загрузка...</h2>
      </div>
    );
  }

  return (
    <Profile
      user={user}
      products={myProducts}
      onProductClick={handleProductClick}
      onCreateProduct={handleCreateProduct}
    />
  );
}
