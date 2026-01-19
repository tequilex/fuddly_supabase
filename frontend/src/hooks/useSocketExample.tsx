/**
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ useSocket HOOK
 *
 * Этот файл показывает как использовать useSocket в компонентах чата
 */

import { useState } from 'react';
import { useSocket } from './useSocket';
import { useAppSelector } from '../store/hooks';
import { selectMessagesByChatId } from '../store/slices/messagesSlice';
import { selectActiveChat } from '../store/slices/chatsSlice';

// ═════════════════════════════════════════════════════════════════════════════
// ПРИМЕР 1: Компонент чата с отправкой сообщений
// ═════════════════════════════════════════════════════════════════════════════

export const ChatComponent = () => {
  const [messageText, setMessageText] = useState('');

  // Инициализация Socket.io
  const { sendMessage } = useSocket();

  // Получаем активный чат из Redux
  const activeChat = useAppSelector(selectActiveChat);

  // Получаем сообщения активного чата
  const messages = useAppSelector(
    selectMessagesByChatId(activeChat?.id || '')
  );

  // Получаем текущего пользователя
  const { user } = useAppSelector((state) => state.auth);

  // Обработчик отправки сообщения
  const handleSendMessage = () => {
    if (!activeChat || !user || !messageText.trim()) {
      return;
    }

    // Определяем ID получателя
    const receiverId =
      activeChat.buyer_id === user.id
        ? activeChat.seller_id
        : activeChat.buyer_id;

    // Отправляем сообщение через Socket.io
    sendMessage({
      conversationId: activeChat.id,
      text: messageText.trim(),
      receiverId: receiverId,
    });

    // Очищаем поле ввода
    setMessageText('');
  };

  return (
    <div className="chat-container">
      {/* Список сообщений */}
      <div className="messages-list">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.sender_id === user?.id
                ? 'message-sent'
                : 'message-received'
            }
          >
            <p>{message.text}</p>
            <span>{new Date(message.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      {/* Форма отправки */}
      <div className="message-input">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Введите сообщение..."
        />
        <button onClick={handleSendMessage}>Отправить</button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ПРИМЕР 2: Список чатов с непрочитанными сообщениями
// ═════════════════════════════════════════════════════════════════════════════

export const ChatsList = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Получаем все чаты из Redux (используя entity adapter selectors)
  const { chatsSelectors } = require('../store/slices/chatsSlice');
  const allChats = useAppSelector(chatsSelectors.selectAll);

  return (
    <div className="chats-list">
      {allChats.map((chat) => {
        // Определяем собеседника
        const partnerId =
          chat.buyer_id === user?.id ? chat.seller_id : chat.buyer_id;

        return (
          <div key={chat.id} className="chat-item">
            <div className="chat-info">
              <h4>Чат #{chat.id.substring(0, 8)}</h4>
              <p>Продукт: {chat.product_id}</p>
            </div>
            <div className="chat-meta">
              <span>{new Date(chat.updated_at).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ПРИМЕР 3: Загрузка истории чата при открытии
// ═════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setMessages } from '../store/slices/messagesSlice';
import { setActiveChat } from '../store/slices/chatsSlice';

export const ChatWindow = ({ conversationId }: { conversationId: string }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // При открытии чата загружаем историю сообщений
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        // Запрос к API для получения истории сообщений
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.id}`, // Или ваш токен
            },
          }
        );

        const messages = await response.json();

        // Сохраняем сообщения в Redux
        dispatch(setMessages({ conversationId, messages }));

        // Устанавливаем активный чат
        dispatch(setActiveChat(conversationId));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    if (conversationId) {
      loadChatHistory();
    }
  }, [conversationId, dispatch, user]);

  return <ChatComponent />;
};
