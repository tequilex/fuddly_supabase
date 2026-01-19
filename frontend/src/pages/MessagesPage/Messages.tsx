import { useState } from 'react';
import styles from './Messages.module.scss';
import { MessagesList } from './sections/MessagesList/MessagesList';
import { MessagesChat } from './sections/MessagesChat/MessagesChat';
import type { ChatConversation, Message } from '@/types';
import { UserStatus } from '@/types';

// Временный ID текущего пользователя (позже будет из Redux)
const CURRENT_USER_ID = 'current-user-id';

const mockChats: ChatConversation[] = [
  {
    id: 'user-1',
    user: {
      id: 'user-1',
      email: 'maria@example.com',
      name: 'Мария Петрова',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      status: UserStatus.ACTIVE,
      created_at: '2026-01-15T10:00:00Z',
    },
    lastMessage: {
      id: 'msg-1-5',
      sender_id: 'user-1',
      receiver_id: CURRENT_USER_ID,
      text: 'Добрый день! Торт еще актуален?',
      read: false,
      created_at: '2026-01-19T14:32:00Z',
    },
    unreadCount: 2,
    product: {
      id: 'product-1',
      title: 'Наполеон домашний',
      description: 'Классический торт Наполеон',
      price: 1500,
      category: 'десерты',
      images: ['https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=100&h=100&fit=crop'],
      region: 'Москва',
      status: 'APPROVED' as any,
      seller: { id: CURRENT_USER_ID, name: 'Текущий пользователь' },
    },
  },
  {
    id: 'user-2',
    user: {
      id: 'user-2',
      email: 'ivan@example.com',
      name: 'Иван Смирнов',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      status: UserStatus.ACTIVE,
      created_at: '2026-01-14T10:00:00Z',
    },
    lastMessage: {
      id: 'msg-2-4',
      sender_id: 'user-2',
      receiver_id: CURRENT_USER_ID,
      text: 'Спасибо, очень вкусно было! Закажу еще',
      read: true,
      created_at: '2026-01-19T13:15:00Z',
    },
    unreadCount: 0,
    product: {
      id: 'product-2',
      title: 'Борщ украинский',
      description: 'Домашний борщ',
      price: 500,
      category: 'супы',
      images: ['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&h=100&fit=crop'],
      region: 'Москва',
      status: 'APPROVED' as any,
      seller: { id: CURRENT_USER_ID, name: 'Текущий пользователь' },
    },
  },
];

const mockMessages: { [key: string]: Message[] } = {
  'user-1': [
    {
      id: 'msg-1-1',
      sender_id: 'user-1',
      receiver_id: CURRENT_USER_ID,
      text: 'Здравствуйте! Интересует Наполеон',
      read: true,
      created_at: '2026-01-19T14:25:00Z',
    },
    {
      id: 'msg-1-2',
      sender_id: CURRENT_USER_ID,
      receiver_id: 'user-1',
      text: 'Добрый день! Да, конечно. Торт свежий, испекла сегодня утром',
      read: true,
      created_at: '2026-01-19T14:27:00Z',
    },
    {
      id: 'msg-1-3',
      sender_id: 'user-1',
      receiver_id: CURRENT_USER_ID,
      text: 'Отлично! А сколько весит?',
      read: true,
      created_at: '2026-01-19T14:28:00Z',
    },
    {
      id: 'msg-1-4',
      sender_id: CURRENT_USER_ID,
      receiver_id: 'user-1',
      text: 'Примерно 1.5 кг, на 8-10 человек хватит',
      read: true,
      created_at: '2026-01-19T14:30:00Z',
    },
    {
      id: 'msg-1-5',
      sender_id: 'user-1',
      receiver_id: CURRENT_USER_ID,
      text: 'Добрый день! Торт еще актуален?',
      read: false,
      created_at: '2026-01-19T14:32:00Z',
    },
  ],
  'user-2': [
    {
      id: 'msg-2-1',
      sender_id: 'user-2',
      receiver_id: CURRENT_USER_ID,
      text: 'Здравствуйте! Хочу заказать борщ',
      read: true,
      created_at: '2026-01-19T10:15:00Z',
    },
    {
      id: 'msg-2-2',
      sender_id: CURRENT_USER_ID,
      receiver_id: 'user-2',
      text: 'Добрый день! Сколько порций?',
      read: true,
      created_at: '2026-01-19T10:20:00Z',
    },
    {
      id: 'msg-2-3',
      sender_id: 'user-2',
      receiver_id: CURRENT_USER_ID,
      text: '4 порции, пожалуйста',
      read: true,
      created_at: '2026-01-19T10:22:00Z',
    },
    {
      id: 'msg-2-4',
      sender_id: 'user-2',
      receiver_id: CURRENT_USER_ID,
      text: 'Спасибо, очень вкусно было! Закажу еще',
      read: true,
      created_at: '2026-01-19T13:15:00Z',
    },
  ],
};

export function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.product?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = mockChats.find(chat => chat.id === selectedChat);
  const chatMessages = selectedChat ? mockMessages[selectedChat] || [] : [];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Здесь будет логика отправки сообщения
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className={styles.messagesPage}>
      <div className={styles.container}>
        <MessagesList
          chats={filteredChats}
          selectedChatId={selectedChat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onChatSelect={setSelectedChat}
        />

        <MessagesChat
          chat={selectedChatData || null}
          messages={chatMessages}
          currentUserId={CURRENT_USER_ID}
          messageText={messageText}
          onMessageTextChange={setMessageText}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedChat(null)}
        />
      </div>
    </div>
  );
}
