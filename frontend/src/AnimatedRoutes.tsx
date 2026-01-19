import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppSelector } from './store/hooks';
import PageTransition from './components/PageTransition/PageTransition';

// Новые страницы из design
import Catalog from './pages/CatalogPage/Catalog';
import Auth from './pages/AuthPage/Auth';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import MessagesPage from './pages/MessagesPage/MessagesPage';
import SellerProfilePage from './pages/SellerProfilePage/SellerProfilePage';
import CreateProductPage from './pages/CreateProductPage/CreateProductPage';

// Временно используем заглушки для страниц, которые ещё не адаптированы
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>Страница в разработке</p>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Публичные маршруты */}
        <Route
          path="/"
          element={
            <PageTransition>
              <Catalog />
            </PageTransition>
          }
        />
        <Route
          path="/products/:id"
          element={
            <PageTransition>
              <ProductDetailPage />
            </PageTransition>
          }
        />
        <Route
          path="/seller/:id"
          element={
            <PageTransition>
              <SellerProfilePage />
            </PageTransition>
          }
        />
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <PageTransition>
                <Auth />
              </PageTransition>
            )
          }
        />

        {/* Защищённые маршруты */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/messages"
          element={
            isAuthenticated ? (
              <PageTransition>
                <MessagesPage />
              </PageTransition>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/favorites"
          element={
            isAuthenticated ? (
              <PageTransition>
                <FavoritesPage />
              </PageTransition>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/create-product"
          element={
            isAuthenticated ? (
              <PageTransition>
                <CreateProductPage />
              </PageTransition>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        {/* Редирект старых маршрутов */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
