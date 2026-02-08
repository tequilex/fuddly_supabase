import { useState, useEffect } from 'react';
import styles from './Messages.module.scss';
import { MessagesList } from './sections/MessagesList/MessagesList';
import { MessagesChat } from './sections/MessagesChat/MessagesChat';
import type { ChatConversation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { useIsTablet } from '@/hooks/useMediaQuery';
import {
  chatsSelectors,
  selectActiveChatId,
  setActiveChat,
  fetchUserChats,
  resetUnreadCount,
} from '@/store/slices/chatsSlice';
import {
  fetchConversationMessages,
  selectMessagesByChatId,
  markMessagesAsRead,
  clearAllMessages,
  selectMessagesMeta,
} from '@/store/slices/messagesSlice';
import { useSocketContext } from '@/context/SocketContext';

export function Messages() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isTablet = useIsTablet();

  // Получаем данные из Redux
  const allChats = useAppSelector(chatsSelectors.selectAll);
  const activeChatId = useAppSelector(selectActiveChatId);

  // Скрываем header и navmenu только когда открыт чат на мобильных устройствах
  const shouldHideLayout = isTablet && activeChatId !== null;

  useLayoutConfig({
    hideHeader: shouldHideLayout,
    hideMobileBottomNav: shouldHideLayout,
  });
  const activeChat = useAppSelector((state) =>
    activeChatId ? chatsSelectors.selectById(state, activeChatId) : null
  );
  const chatMessages = useAppSelector(selectMessagesByChatId(activeChatId || ''));
  const chatMeta = useAppSelector(selectMessagesMeta(activeChatId || ''));
  const chatsLoading = useAppSelector((state) => state.chats.loading);
  // Локальное состояние
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  // Получаем метод отправки сообщений из Socket Context
  const { sendMessage } = useSocketContext();

  // Загрузка conversations при монтировании
  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (activeChatId && user?.id) {
      dispatch(fetchConversationMessages({ conversationId: activeChatId }));

      // Помечаем сообщения как прочитанные
      dispatch(markMessagesAsRead({ conversationId: activeChatId }));
      dispatch(resetUnreadCount(activeChatId));
    }
  }, [activeChatId, user?.id, dispatch]);

  // Очистка сообщений при уходе со страницы
  useEffect(() => {
    return () => {
      dispatch(clearAllMessages());
    };
  }, [dispatch]);

  // Фильтрация чатов по поисковому запросу
  const filteredChats = allChats.filter((chat) => {
    if (!user) return false;

    // Определяем собеседника
    const partner = chat.buyer_id === user.id ? chat.seller : chat.buyer;

    const searchLower = searchQuery.toLowerCase();
    return (
      partner?.name?.toLowerCase().includes(searchLower) ||
      chat.product?.title?.toLowerCase().includes(searchLower)
    );
  });

  // Преобразуем conversations в формат ChatConversation для UI
  const uiChats: ChatConversation[] = filteredChats.map((chat) => {
    const partner = chat.buyer_id === user?.id ? chat.seller : chat.buyer;

    return {
      id: chat.id,
      user: partner || { id: '', name: 'Неизвестный пользователь', email: '', status: 'ACTIVE' as any, created_at: '' },
      lastMessage: chat.last_message || undefined,
      unreadCount: chat.unread_count || 0,
      product: chat.product,
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

  const handleLoadOlder = () => {
    if (!activeChatId || chatMeta.loading || !chatMeta.hasMore) return;
    dispatch(
      fetchConversationMessages({
        conversationId: activeChatId,
        offset: chatMeta.nextOffset,
        mode: 'older',
      })
    );
  };

  // Преобразуем activeChat в формат ChatConversation для UI
  const selectedChatData: ChatConversation | null = activeChat
    ? {
        id: activeChat.id,
        user:
          activeChat.buyer_id === user?.id
            ? activeChat.seller || { id: '', name: 'Неизвестный', email: '', status: 'ACTIVE' as any, created_at: '' }
            : activeChat.buyer || { id: '', name: 'Неизвестный', email: '', status: 'ACTIVE' as any, created_at: '' },
        product: activeChat.product,
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
    <div
      className={styles.messagesPage}
      data-full-height={shouldHideLayout ? 'true' : 'false'}
    >
      <div
        className={styles.container}
        data-full-height={shouldHideLayout ? 'true' : 'false'}
      >
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
          onLoadOlder={handleLoadOlder}
          hasMore={chatMeta.hasMore}
          loadingOlder={chatMeta.loading}
        />
      </div>
    </div>
  );
}
