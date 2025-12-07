# Fuddly - B2B Marketplace

Независимый проект маркетплейса пищевой продукции на Supabase.

## Технологический стек

### Backend
- **Node.js** + Express
- **TypeScript**
- **Supabase** (PostgreSQL + Auth)
- **Zod** validation

### Frontend
- **React 18**
- **TypeScript**
- **Redux Toolkit**
- **React Router**
- **Vite**
- **SCSS Modules**

## Быстрый старт

### 1. Установите зависимости

```bash
make install
```

### 2. Настройте Supabase

Создайте проект в [Supabase Dashboard](https://app.supabase.com/).

Создайте файл `backend/.env`:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
PORT=3000
NODE_ENV=development
```

### 3. Создайте таблицы

Выполните SQL скрипт из `backend/supabase/schema.sql` в Supabase SQL Editor.

### 4. Запустите проект

```bash
make start
```

Приложение будет доступно:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Makefile команды

```bash
make install          # Установить зависимости
make start            # Запустить проект
make stop             # Остановить проект
make build            # Собрать для production
make clean            # Очистить node_modules
```

## Основные возможности

- ✅ Регистрация и авторизация через Supabase Auth
- ✅ Создание и публикация объявлений
- ✅ Модерация товаров
- ✅ Каталог с поиском и фильтрацией
- ✅ Отклики на товары
- ✅ Встроенный чат
- ✅ Личный кабинет

## Лицензия

MIT
