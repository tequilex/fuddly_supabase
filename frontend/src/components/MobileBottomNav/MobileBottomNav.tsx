import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, Plus, MessageCircle, User } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import styles from './MobileBottomNav.module.css';

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // TODO: получать из Redux когда будут готовы favoritesSlice и messagesSlice
  const favoriteCount = 0;
  const messagesCount = 0;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      id: 'catalog',
      label: 'Каталог',
      icon: Home,
      show: true,
      path: '/',
      onClick: () => navigate('/')
    },
    {
      id: 'favorites',
      label: 'Избранное',
      icon: Heart,
      show: isAuthenticated,
      badge: favoriteCount,
      path: '/favorites',
      onClick: () => navigate('/favorites')
    },
    {
      id: 'add',
      label: 'Объявление',
      icon: Plus,
      show: isAuthenticated,
      isAccent: false,
      path: '/create-product',
      onClick: () => navigate('/create-product')
    },
    {
      id: 'messages',
      label: 'Сообщения',
      icon: MessageCircle,
      show: isAuthenticated,
      badge: messagesCount,
      path: '/messages',
      onClick: () => navigate('/messages')
    },
    {
      id: 'profile',
      label: isAuthenticated ? 'Профиль' : 'Войти',
      icon: User,
      show: true,
      path: isAuthenticated ? '/profile' : '/auth',
      onClick: () => navigate(isAuthenticated ? '/profile' : '/auth')
    }
  ];

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        {navItems.filter(item => item.show).map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${item.isAccent ? styles.navItemAccent : ''}`}
              onClick={item.onClick}
            >
              <div className={styles.iconWrapper}>
                <Icon size={22} />
                {item.badge && item.badge > 0 && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </div>
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
