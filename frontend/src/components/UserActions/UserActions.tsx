import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MessageCircle, Heart, LogOut, Plus, ChevronDown } from 'lucide-react';
import styles from './UserActions.module.css';

interface UserActionsProps {
  isAuthenticated: boolean;
  user: { name: string; role?: string } | null;
  onLogout: () => void;
}

export function UserActions({
  isAuthenticated,
  user,
  onLogout
}: UserActionsProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // TODO: получать из Redux когда будут готовы favoritesSlice и messagesSlice
  const favoriteCount = 0;
  const messagesCount = 0;

  if (!isAuthenticated) {
    return (
      <button
        className={styles.authButton}
        onClick={() => navigate('/auth')}
      >
        Войти
      </button>
    );
  }

  return (
    <div className={styles.userActions}>
      {/* Кнопка "Добавить объявление" */}
      <button
        className={styles.addButton}
        onClick={() => navigate('/create-product')}
      >
        <Plus size={18} />
        <span className={styles.buttonText}>Добавить объявление</span>
      </button>

      {/* Избранное */}
      <button
        className={styles.iconButton}
        title="Избранное"
        onClick={() => navigate('/favorites')}
      >
        <Heart size={22} />
        {favoriteCount > 0 && (
          <span className={styles.badge}>{favoriteCount}</span>
        )}
      </button>

      {/* Чаты */}
      <button
        className={styles.iconButton}
        title="Чаты"
        onClick={() => navigate('/messages')}
      >
        <MessageCircle size={22} />
        {messagesCount > 0 && (
          <span className={styles.badge}>{messagesCount}</span>
        )}
      </button>

      {/* Профиль с выпадающим меню */}
      <div className={styles.userMenuWrapper}>
        <button
          className={styles.userButton}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          title="Профиль"
        >
          <div className={styles.userAvatar}>
            <User size={18} />
          </div>
          <span className={styles.userName}>{user?.name}</span>
          <ChevronDown
            size={16}
            className={`${styles.chevron} ${showProfileMenu ? styles.chevronOpen : ''}`}
          />
        </button>

        {showProfileMenu && (
          <>
            <div
              className={styles.overlay}
              onClick={() => setShowProfileMenu(false)}
            />
            <div className={styles.userMenu} ref={menuRef}>
              <div className={styles.userMenuHeader}>
                <div className={styles.userMenuAvatar}>
                  <User size={24} />
                </div>
                <div>
                  <div className={styles.userMenuName}>{user?.name}</div>
                  <div className={styles.userMenuRole}>
                    {user?.role === 'seller' ? 'Продавец' : 'Покупатель'}
                  </div>
                </div>
              </div>

              <div className={styles.userMenuDivider} />

              <button
                className={styles.userMenuItem}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
              >
                <User size={18} />
                Мой профиль
              </button>

              {user?.role === 'seller' && (
                <button
                  className={styles.userMenuItem}
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                >
                  <Plus size={18} />
                  Мои товары
                </button>
              )}

              <button
                className={styles.userMenuItem}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/favorites');
                }}
              >
                <Heart size={18} />
                Избранное
                {favoriteCount > 0 && (
                  <span className={styles.menuBadge}>{favoriteCount}</span>
                )}
              </button>

              <button
                className={styles.userMenuItem}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/messages');
                }}
              >
                <MessageCircle size={18} />
                Сообщения
                {messagesCount > 0 && (
                  <span className={styles.menuBadge}>{messagesCount}</span>
                )}
              </button>

              <div className={styles.userMenuDivider} />

              <button
                className={`${styles.userMenuItem} ${styles.logoutItem}`}
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
              >
                <LogOut size={18} />
                Выйти
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
