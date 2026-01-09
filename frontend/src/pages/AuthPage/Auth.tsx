import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, register } from '../../store/slices/authSlice';
import styles from './Auth.module.css';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }

    if (mode === 'login') {
      const result = await dispatch(
        login({
          email: formData.email,
          password: formData.password,
        })
      );
      if (login.fulfilled.match(result)) {
        navigate('/');
      }
    } else {
      const result = await dispatch(
        register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        })
      );
      if (register.fulfilled.match(result)) {
        navigate('/');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.container}>
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>{mode === 'login' ? 'Добро пожаловать!' : 'Создайте аккаунт'}</h1>
              <p className={styles.formSubtitle}>
                {mode === 'login' ? 'Войдите, чтобы продолжить' : 'Присоединяйтесь к Fuddly сегодня'}
              </p>
            </div>

            <div className={styles.tabs}>
              <button className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`} onClick={() => setMode('login')}>
                Вход
              </button>
              <button
                className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
                onClick={() => setMode('register')}
              >
                Регистрация
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              {mode === 'register' && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Введите ваше имя"
                      className={styles.input}
                      required
                    />
                  </div>
                </>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                />
              </div>

              {mode === 'register' && (
                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Подтвердите пароль
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={styles.input}
                    required
                  />
                </div>
              )}

              {mode === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxLabel}>Запомнить меня</span>
                  </label>
                  <a href="#" className={styles.forgotPassword}>
                    Забыли пароль?
                  </a>
                </div>
              )}

              {mode === 'register' && (
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} required />
                  <span className={styles.checkboxLabel}>Я принимаю условия использования и политику конфиденциальности</span>
                </label>
              )}

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>или продолжить с</span>
              <div className={styles.dividerLine}></div>
            </div>

            <div className={styles.socialButtons}>
              <button className={styles.socialButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button className={styles.socialButton}>
                <Github size={20} />
                GitHub
              </button>
            </div>

            <div className={styles.footer}>
              {mode === 'login' ? (
                <>
                  Ещё нет аккаунта?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode('register');
                    }}
                    className={styles.footerLink}
                  >
                    Зарегистрироваться
                  </a>
                </>
              ) : (
                <>
                  Уже есть аккаунт?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setMode('login');
                    }}
                    className={styles.footerLink}
                  >
                    Войти
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
