# Fuddly - Площадка для продажи домашней еды

Платформа для людей, которые готовят еду дома и хотят её продавать. Объединяет домашних поваров с покупателями, которые ищут вкусную домашнюю еду.

## Технологии

**Frontend:** React 18, TypeScript, Redux Toolkit, React Router, Vite, SCSS Modules, Framer Motion

**Backend:** Node.js, Express, TypeScript, Supabase (PostgreSQL + Auth + Storage), Zod

**Архитектура:** Классическая (components/hooks/utils/pages/store), Row Level Security (RLS)

---

## Быстрый старт

### Требования
- Node.js >= 18
- npm >= 9
- Аккаунт Supabase (бесплатный)

### 1. Установка
```bash
cd fuddly_supabase
make install
```

### 2. Настройка Supabase
1. Создайте проект на [supabase.com](https://supabase.com)
2. В SQL Editor выполните скрипт `backend/supabase/schema.sql`
3. Скопируйте URL и API ключи из Settings > API

### 3. Переменные окружения
```bash
cp backend/.env.example backend/.env
```

Заполните `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=3003
```

### 4. Запуск
```bash
make start
```

Приложение доступно:
- Frontend: http://localhost:5173
- Backend: http://localhost:3003

---

## Команды

```bash
make install    # Установка зависимостей
make start      # Запуск backend + frontend
make stop       # Остановка процессов
make build      # Production сборка
make clean      # Очистка node_modules
```

---

## Основные функции

### Для продавцов
- Создание объявлений о продаже еды
- Загрузка изображений продуктов
- Управление товарами (редактирование, удаление)
- Получение откликов от покупателей
- Личные сообщения с покупателями

### Для покупателей
- Каталог товаров с фильтрами и поиском
- Просмотр деталей продуктов
- Отклики на объявления
- Чат с продавцами

### Система
- Регистрация и аутентификация через Supabase Auth
- Модерация товаров (статусы: pending, approved, rejected)
- Темная/светлая тема
- Адаптивный дизайн

---

## База данных

### Таблицы
- **users** - пользователи (продавцы и покупатели)
- **products** - товары (еда)
- **messages** - личные сообщения
- **reports** - жалобы

### Статусы
- **Пользователи**: ACTIVE, BLOCKED, PENDING_VERIFICATION
- **Товары**: PENDING, APPROVED, REJECTED
- **Отклики**: PENDING, CONTACTED, CLOSED

---

## Структура

```
fuddly_supabase/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Бизнес-логика
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Аутентификация
│   │   └── supabase.ts     # Supabase клиент
│   └── supabase/
│       └── schema.sql      # SQL схема
│
├── frontend/
│   ├── src/
│   │   ├── components/    # UI компоненты
│   │   ├── pages/         # Страницы
│   │   ├── store/         # Redux store
│   │   ├── hooks/         # Кастомные хуки
│   │   ├── utils/         # Утилиты
│   │   ├── types/         # TypeScript типы
│   │   ├── constants/     # Константы
│   │   ├── config/        # Конфигурация
│   │   ├── styles/        # Глобальные стили
│   │   └── shared/api/    # API клиенты
│   └── vite.config.ts
│
└── Makefile
```

---

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - текущий пользователь

### Товары
- `GET /api/products` - список товаров (с фильтрами)
- `POST /api/products` - создать товар
- `GET /api/products/my` - мои товары
- `PATCH /api/products/:id` - обновить
- `DELETE /api/products/:id` - удалить

### Сообщения
- `POST /api/messages` - отправить сообщение
- `GET /api/messages/conversations` - список диалогов
- `GET /api/messages/conversation/:userId` - диалог
