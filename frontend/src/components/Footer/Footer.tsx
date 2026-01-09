import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h4>О платформе</h4>
            <div className={styles.links}>
              <a href="/about" className={styles.link}>О нас</a>
              <a href="/how-it-works" className={styles.link}>Как это работает</a>
              <a href="/safety" className={styles.link}>Безопасность</a>
              <a href="/blog" className={styles.link}>Блог</a>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4>Покупателям</h4>
            <div className={styles.links}>
              <a href="/catalog" className={styles.link}>Каталог</a>
              <a href="/favorites" className={styles.link}>Избранное</a>
              <a href="/orders" className={styles.link}>Мои заказы</a>
              <a href="/help" className={styles.link}>Помощь</a>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4>Продавцам</h4>
            <div className={styles.links}>
              <a href="/become-seller" className={styles.link}>Стать продавцом</a>
              <a href="/seller-guide" className={styles.link}>Руководство</a>
              <a href="/seller-dashboard" className={styles.link}>Личный кабинет</a>
              <a href="/seller-faq" className={styles.link}>FAQ</a>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4>Поддержка</h4>
            <div className={styles.links}>
              <a href="/contact" className={styles.link}>Контакты</a>
              <a href="/terms" className={styles.link}>Условия использования</a>
              <a href="/privacy" className={styles.link}>Политика конфиденциальности</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 Fuddly. Все права защищены.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
