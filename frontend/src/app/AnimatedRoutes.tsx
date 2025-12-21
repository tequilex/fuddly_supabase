import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppSelector } from './store/hooks';
import PageTransition from '@/shared/components/PageTransition';

// Pages
import HomePage from '@/pages/home/HomePage';
import CatalogPage from '@/pages/catalog/CatalogPage';
import ProductDetailPage from '@/pages/product-detail/ProductDetailPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <CatalogPage />
            </PageTransition>
          }
        />
        <Route
          path="/info"
          element={
            <PageTransition>
              <HomePage />
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
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
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
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
