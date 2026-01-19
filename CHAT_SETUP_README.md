# 🚀 Инструкция по развертыванию Real-time Chat

Эта инструкция описывает как запустить систему чата для маркетплейса Fuddly.

## 📋 Что было реализовано

### ✅ STEP 1: Database Update (Supabase SQL)
- ✅ Создана таблица `conversations` для связи покупателей, продавцов и продуктов
- ✅ Добавлена колонка `conversation_id` в таблицу `messages`
- ✅ Настроены индексы для оптимизации запросов
- ✅ Настроены RLS политики для безопасности данных

**Файл:** `backend/supabase/migrations/001_add_conversations.sql`

### ✅ STEP 2: Backend Implementation (Node.js + Socket.io)
- ✅ Обновлен Supabase клиент с `SERVICE_ROLE_KEY` (обход RLS)
- ✅ Реализована аутентификация через JWT в Socket.io
- ✅ Реализована логика событий:
  - `connection` - создание приватной комнаты для пользователя
  - `send_message` - отправка сообщений через Supabase
  - `receive_message` - получение сообщений в реальном времени
  - `message_sent` - подтверждение отправки

**Файлы:**
- `backend/src/socket.ts` - Socket.io логика
- `backend/src/supabase.ts` - типы и клиент Supabase
- `backend/src/index.ts` - инициализация сервера

### ✅ STEP 3: Frontend Redux State
- ✅ Создан `chatsSlice` с использованием `createEntityAdapter`
  - Нормализованное хранение чатов
  - Поле `activeChatId` для отслеживания активного чата
- ✅ Создан `messagesSlice`
  - Сообщения сгруппированы по `conversationId`
  - Actions: `setMessages`, `addMessage`, `updateMessage`

**Файлы:**
- `frontend/src/store/slices/chatsSlice.ts`
- `frontend/src/store/slices/messagesSlice.ts`
- `frontend/src/store/index.ts` - обновлен store

### ✅ STEP 4: Global Socket Hook
- ✅ Создан хук `useSocket`
  - Инициализация Socket.io с передачей `userId` (через JWT token)
  - Прослушивание события `receive_message`
  - Автоматическая диспетчеризация сообщений в Redux
  - Toast уведомления для сообщений не из активного чата
- ✅ Интеграция в `App.tsx`

**Файлы:**
- `frontend/src/hooks/useSocket.ts`
- `frontend/src/hooks/useSocketExample.tsx` - примеры использования
- `frontend/src/App.tsx` - подключение хука

---

## 🛠️ Инструкция по развертыванию

### 1️⃣ Настройка базы данных (Supabase)

1. Откройте **Supabase Dashboard** → **SQL Editor**
2. Выполните SQL миграцию:
   ```bash
   # Скопируйте содержимое файла
   backend/supabase/migrations/001_add_conversations.sql

   # Вставьте в SQL Editor и выполните
   ```

3. Проверьте, что таблицы созданы:
   - `conversations` - таблица разговоров
   - `messages` - обновлена с `conversation_id`

### 2️⃣ Настройка Backend

1. Убедитесь, что в `.env` файле есть переменные:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   FRONTEND_URL=http://localhost:5173
   PORT=3000
   ```

2. Установите зависимости (если не установлены):
   ```bash
   cd backend
   npm install
   ```

3. Запустите backend сервер:
   ```bash
   npm run dev
   ```

4. Проверьте логи:
   ```
   🚀 Fuddly Backend running on http://localhost:3000
   🔌 Socket.io server initialized
   ```

### 3️⃣ Настройка Frontend

1. Создайте файл `.env` в папке `frontend/` (если его нет):
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Установите зависимости (если не установлены):
   ```bash
   cd frontend
   npm install
   ```

3. Запустите frontend:
   ```bash
   npm run dev
   ```

### 4️⃣ Тестирование

1. Откройте приложение в двух окнах браузера
2. Войдите под разными пользователями (покупатель и продавец)
3. Создайте `conversation` (можно через SQL или через UI, если есть страница чата)
4. Отправьте сообщение от одного пользователя
5. Проверьте:
   - ✅ Сообщение появляется у получателя в реальном времени
   - ✅ Toast уведомление появляется, если чат не активен
   - ✅ `updated_at` в conversations обновляется

---

## 📚 Как использовать Socket в коде

### Отправка сообщения

```tsx
import { useSocket } from './hooks/useSocket';

const MyComponent = () => {
  const { sendMessage } = useSocket();

  const handleSend = () => {
    sendMessage({
      conversationId: 'uuid-here',
      text: 'Привет!',
      receiverId: 'receiver-uuid',
    });
  };

  return <button onClick={handleSend}>Отправить</button>;
};
```

### Получение сообщений

Сообщения автоматически добавляются в Redux через `useSocket` hook.

Чтобы отобразить их в компоненте:

```tsx
import { useAppSelector } from './store/hooks';
import { selectMessagesByChatId } from './store/slices/messagesSlice';

const ChatMessages = ({ chatId }: { chatId: string }) => {
  const messages = useAppSelector(selectMessagesByChatId(chatId));

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.text}</div>
      ))}
    </div>
  );
};
```

### Работа с активным чатом

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setActiveChat, selectActiveChat } from './store/slices/chatsSlice';

const ChatList = () => {
  const dispatch = useAppDispatch();
  const activeChat = useAppSelector(selectActiveChat);

  const handleSelectChat = (chatId: string) => {
    dispatch(setActiveChat(chatId));
  };

  return (
    <button onClick={() => handleSelectChat('chat-id')}>
      Открыть чат
    </button>
  );
};
```

---

## 🔧 API События Socket.io

### Frontend → Backend

| Событие | Payload | Описание |
|---------|---------|----------|
| `send_message` | `{ conversationId, text, senderId, receiverId }` | Отправка сообщения |

### Backend → Frontend

| Событие | Payload | Описание |
|---------|---------|----------|
| `receive_message` | `Message` | Получение нового сообщения |
| `message_sent` | `Message` | Подтверждение отправки |
| `error` | `{ message: string }` | Ошибка |

---

## 📝 Примечания

1. **SERVICE_ROLE_KEY** используется на backend для обхода RLS политик
2. **Frontend НЕ использует Supabase Realtime напрямую** - вся коммуникация идет через Node.js
3. При первом сообщении между пользователями, нужно **создать conversation** через API
4. Toast уведомления появляются только если сообщение **не из активного чата**

---

## 🐛 Troubleshooting

### Socket не подключается
- Проверьте CORS настройки в `backend/src/socket.ts`
- Проверьте `VITE_BACKEND_URL` в `.env` frontend
- Проверьте что backend запущен

### Сообщения не сохраняются
- Проверьте RLS политики в Supabase
- Проверьте что используется `SUPABASE_SERVICE_KEY` на backend
- Проверьте логи backend консоли

### Toast не показывается
- Убедитесь что `<Toaster />` компонент есть в `App.tsx`
- Проверьте что `activeChatId` корректно обновляется в Redux

---

## ✅ Готово!

Теперь у вас есть полностью рабочая система real-time чата для маркетплейса Fuddly! 🎉
