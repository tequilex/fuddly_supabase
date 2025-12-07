# Fuddly - Настройка и запуск

Пошаговая инструкция по развертыванию проекта с Supabase.

## 1. Создание проекта в Supabase

1. Перейдите на https://app.supabase.com
2. Создайте новый проект
3. Дождитесь завершения настройки (2-3 минуты)

## 2. Настройка базы данных

1. Откройте **SQL Editor** в Supabase Dashboard
2. Создайте новый query
3. Скопируйте и выполните содержимое файла `backend/supabase/schema.sql`

## 3. Получение credentials

1. Перейдите в **Project Settings** → **API**
2. Скопируйте:
   - Project URL
   - anon public key
   - service_role key (секретный ключ)

## 4. Настройка Backend

1. Создайте файл `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
```

2. Установите зависимости:

```bash
cd backend
npm install
```

3. Запустите backend:

```bash
npm run dev
```

Backend будет доступен на http://localhost:3003

## 5. Настройка Frontend

1. Установите зависимости:

```bash
cd frontend
npm install
```

2. Создайте файл `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3000
```

3. Запустите frontend:

```bash
npm run dev
```

Frontend будет доступен на http://localhost:5173

## 6. Тестирование

1. Откройте http://localhost:5173
2. Зарегистрируйтесь как новый пользователь
3. Проверьте функциональность:
   - Регистрация/Авторизация
   - Создание товара
   - Просмотр каталога

## Использование Makefile (опционально)

Для удобства можно использовать Makefile:

```bash
# Установить зависимости
make install

# Запустить проект (в одном терминале запустятся backend и frontend)
make start

# Остановить проект
make stop
```

## Структура проекта

```
fuddly-standalone/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Контроллеры API (Supabase)
│   │   ├── middleware/      # Middleware (Supabase Auth)
│   │   ├── routes/          # Роуты Express
│   │   ├── supabase.ts      # Supabase клиент
│   │   └── index.ts         # Точка входа
│   ├── supabase/
│   │   └── schema.sql       # SQL схема для Supabase
│   ├── package.json
│   └── .env                 # Настройки окружения
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env                 # Настройки окружения
├── Makefile
└── README.md
```

## Troubleshooting

### Backend не запускается

- Проверьте правильность credentials в `.env`
- Убедитесь что SQL схема выполнена в Supabase
- Проверьте что порт 3000 свободен

### Frontend не подключается к backend

- Убедитесь что backend запущен
- Проверьте `VITE_API_URL` в `frontend/.env`

### Ошибки авторизации

- Проверьте что email confirmation отключен в Supabase (Authentication → Email Auth → Disable email confirmations for development)
- Проверьте credentials в `.env`

## Дополнительные возможности Supabase

- **Realtime**: WebSocket подключения для live updates
- **Storage**: Загрузка изображений товаров
- **Edge Functions**: Serverless функции
- **Row Level Security**: Уже настроен в schema.sql
