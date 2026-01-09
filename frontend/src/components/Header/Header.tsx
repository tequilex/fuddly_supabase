import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/uiSlice';
import { UserActions } from '../UserActions/UserActions';
import styles from './Header.module.scss';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
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
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Fuddly
        </Link>

        <div className={styles.search}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Найти домашнюю еду..."
            className={styles.searchInput}
          />
        </div>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            Каталог
          </Link>

          <button className={styles.iconButton} onClick={handleToggleTheme}>
            {theme === 'light' ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          <UserActions
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
          />
        </nav>
      </div>
    </header>
  );
}
