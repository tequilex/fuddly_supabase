import { useState, useEffect } from 'react';
import styles from './Messages.module.scss';
import { MessagesList } from './sections/MessagesList/MessagesList';
import { MessagesChat } from './sections/MessagesChat/MessagesChat';
import type { ChatConversation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  chatsSelectors,
  selectActiveChatId,
  setActiveChat,
  fetchUserChats,
} from '@/store/slices/chatsSlice';
import {
  fetchConversationMessages,
  selectMessagesByChatId,
  markMessagesAsRead,
} from '@/store/slices/messagesSlice';
import { useSocket } from '@/hooks/useSocket';

export function Messages() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Получаем данные из Redux
  const allChats = useAppSelector(chatsSelectors.selectAll);
  const activeChatId = useAppSelector(selectActiveChatId);
  const activeChat = useAppSelector((state) =>
    activeChatId ? chatsSelectors.selectById(state, activeChatId) : null
  );
  const chatMessages = useAppSelector(selectMessagesByChatId(activeChatId || ''));
  const chatsLoading = useAppSelector((state) => state.chats.loading);
  const allMessages = useAppSelector((state) => state.messages.byChatId);
  // Локальное состояние
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  // const { sendMessage } = useSocket();

  // Загрузка conversations при монтировании
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserChats(user.id));
    }
  }, [user?.id, dispatch]);

  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (activeChatId && user?.id) {
      dispatch(fetchConversationMessages({ conversationId: activeChatId }));

      // Помечаем сообщения как прочитанные
      dispatch(markMessagesAsRead({ conversationId: activeChatId, userId: user.id }));
    }
  }, [activeChatId, user?.id, dispatch]);

  // Фильтрация чатов по поисковому запросу
  const filteredChats = allChats.filter((chat) => {
    if (!user) return false;

    // Определяем собеседника
    const partner =
      chat.buyer_id === user.id
        ? (chat as any).seller
        : (chat as any).buyer;

    const searchLower = searchQuery.toLowerCase();
    return (
      partner?.name?.toLowerCase().includes(searchLower) ||
      (chat as any).product?.title?.toLowerCase().includes(searchLower)
    );
  });

  // Преобразуем conversations в формат ChatConversation для UI
  const uiChats: ChatConversation[] = filteredChats.map((chat) => {
    const partner =
      chat.buyer_id === user?.id
        ? (chat as any).seller
        : (chat as any).buyer;

    // Получаем сообщения из Redux
    const messages = allMessages[chat.id] || [];
    const lastMessage = messages[messages.length - 1];

    // Подсчитываем непрочитанные
    const unreadCount = messages.filter(
      (msg) => !msg.read && msg.receiver_id === user?.id
    ).length;

    return {
      id: chat.id,
      user: partner || { id: '', name: 'Неизвестный пользователь', email: '', status: 'ACTIVE' as any, created_at: '' },
      lastMessage,
      unreadCount,
      product: (chat as any).product,
    };
  });

  // Обработчик отправки сообщения
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChatId || !activeChat || !user) {
      return;
    }

    // Определяем получателя
    const receiverId =
      activeChat.buyer_id === user.id
        ? activeChat.seller_id
        : activeChat.buyer_id;

    // Отправляем через Socket.io
    sendMessage({
      conversationId: activeChatId,
      text: messageText.trim(),
      receiverId,
    });

    // Очищаем поле ввода
    setMessageText('');
  };

  // Обработчик выбора чата
  const handleChatSelect = (chatId: string) => {
    dispatch(setActiveChat(chatId));
  };

  // Преобразуем activeChat в формат ChatConversation для UI
  const selectedChatData: ChatConversation | null = activeChat
    ? {
        id: activeChat.id,
        user:
          activeChat.buyer_id === user?.id
            ? (activeChat as any).seller || { id: '', name: 'Неизвестный', email: '', status: 'ACTIVE' as any, created_at: '' }
            : (activeChat as any).buyer || { id: '', name: 'Неизвестный', email: '', status: 'ACTIVE' as any, created_at: '' },
        product: (activeChat as any).product,
        unreadCount: 0,
      }
    : null;

  if (chatsLoading && allChats.length === 0) {
    return (
      <div className={styles.messagesPage}>
        <div className={styles.container}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Загрузка чатов...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesPage}>
      <div className={styles.container}>
        <MessagesList
          chats={uiChats}
          selectedChatId={activeChatId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onChatSelect={handleChatSelect}
        />

        <MessagesChat
          chat={selectedChatData}
          messages={chatMessages}
          currentUserId={user?.id || ''}
          messageText={messageText}
          onMessageTextChange={setMessageText}
          onSendMessage={handleSendMessage}
          onBack={() => dispatch(setActiveChat(null))}
        />
      </div>
    </div>
  );
}
