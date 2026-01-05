import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getMe } from './store/slices/authSlice';
import { useTheme } from './hooks/useTheme';
import AnimatedRoutes from './AnimatedRoutes';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

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
      <Header />
      <main style={{ flex: 1 }}>
        <AnimatedRoutes />
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
