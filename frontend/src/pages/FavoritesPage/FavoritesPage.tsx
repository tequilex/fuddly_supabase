import { useNavigate } from 'react-router-dom';
import { Favorites } from './Favorites';

export default function FavoritesPage() {
  const navigate = useNavigate();

  // TODO: когда будет favoritesSlice в Redux, загружать избранное оттуда
  // const dispatch = useAppDispatch();
  // const { favorites, loading } = useAppSelector((state) => state.favorites);
  //
  // useEffect(() => {
  //   dispatch(fetchFavorites());
  // }, [dispatch]);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Favorites
      onProductClick={handleProductClick}
      onBack={handleBack}
    />
  );
}
