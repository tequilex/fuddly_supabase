import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, ChevronDown, LayoutGrid, MapPin } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/uiSlice';
import { UserActions } from '../UserActions/UserActions';
import styles from './Header.module.scss';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.ui.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            Fuddly
          </Link>

          <button className={styles.catalogButton}>
            <LayoutGrid size={18} />
            <span className={styles.catalogText}>Каталог</span>
          </button>

          <div className={styles.searchBar}>
            <button className={styles.searchCategory}>
              <span>Везде</span>
              <ChevronDown size={16} />
            </button>
            <input
              type="text"
              placeholder="Искать в Fuddly"
              className={styles.searchInput}
            />
            <button className={styles.searchButton} aria-label="Поиск">
              <Search size={18} />
            </button>
          </div>

          <div className={styles.actions}>
            <button className={styles.iconButton} onClick={handleToggleTheme}>
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <UserActions
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.container}>
          <nav className={styles.quickLinks}>
            <Link to="/" className={styles.quickLink}>Fuddly fresh</Link>
            <Link to="/" className={styles.quickLink}>Готовая еда</Link>
            <Link to="/" className={styles.quickLink}>Сертификаты</Link>
            <Link to="/" className={styles.quickLink}>Для бизнеса</Link>
            <Link to="/" className={styles.quickLink}>Помощь</Link>
          </nav>

          <div className={styles.location}>
            <MapPin size={16} />
            <span>Пункт выдачи · ул. 1 Мая, 430/2</span>
          </div>
        </div>
      </div>
    </header>
  );
}
