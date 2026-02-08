import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getMe } from './store/slices/authSlice';
import { selectLayoutConfig } from './store/slices/uiSlice';
import { useTheme } from './hooks/useTheme';
import AnimatedRoutes from './AnimatedRoutes';

// Новые компоненты из design
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { MobileBottomNav } from './components/MobileBottomNav/MobileBottomNav';

function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const layoutConfig = useAppSelector(selectLayoutConfig);

  // Инициализация темы
  useTheme();

  // Автоматическая загрузка пользователя при наличии токена
  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {layoutConfig.header.visible && <Header />}
        <main
          style={{ flex: 1 }}
          data-mobile-nav-visible={layoutConfig.mobileBottomNav.visible}
        >
          <AnimatedRoutes />
        </main>
        {layoutConfig.footer.visible && <Footer />}
        {layoutConfig.mobileBottomNav.visible && <MobileBottomNav />}
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;
