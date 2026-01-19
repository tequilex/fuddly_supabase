import { useState } from 'react';
import styles from './Messages.module.scss';
import { MessagesList } from './sections/MessagesList/MessagesList';
import { MessagesChat } from './sections/MessagesChat/MessagesChat';
import type { Chat } from './sections/MessagesList/MessagesList';
import type { Message } from './sections/MessagesChat/MessagesChat';

const mockChats: Chat[] = [
  {
    id: '1',
    userName: 'Мария Петрова',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    lastMessage: 'Добрый день! Торт еще актуален?',
    time: '14:32',
    unreadCount: 2,
    isOnline: true,
    productName: 'Наполеон домашний',
    productImage: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    userName: 'Иван Смирнов',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    lastMessage: 'Спасибо, очень вкусно было! Закажу еще',
    time: '13:15',
    unreadCount: 0,
    isOnline: false,
    productName: 'Борщ украинский',
    productImage: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&h=100&fit=crop'
  },
  {
    id: '3',
    userName: 'Анна Кузнецова',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    lastMessage: 'Можно заказать на завтра на 6 человек?',
    time: '12:48',
    unreadCount: 1,
    isOnline: true,
    productName: 'Пельмени домашние',
    productImage: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=100&h=100&fit=crop'
  },
  {
    id: '4',
    userName: 'Дмитрий Волков',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    lastMessage: 'Отлично, жду заказ!',
    time: 'Вчера',
    unreadCount: 0,
    isOnline: false,
    productName: 'Хачапури по-аджарски',
    productImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop'
  },
  {
    id: '5',
    userName: 'Елена Соколова',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    lastMessage: 'Добрый вечер! А есть возможность доставки?',
    time: 'Вчера',
    unreadCount: 3,
    isOnline: false,
    productName: 'Шарлотка яблочная',
    productImage: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=100&h=100&fit=crop'
  }
];

const mockMessages: { [key: string]: Message[] } = {
  '1': [
    { id: '1', text: 'Здравствуйте! Интересует Наполеон', time: '14:25', isOwn: false },
    { id: '2', text: 'Добрый день! Да, конечно. Торт свежий, испекла сегодня утром', time: '14:27', isOwn: true },
    { id: '3', text: 'Отлично! А сколько весит?', time: '14:28', isOwn: false },
    { id: '4', text: 'Примерно 1.5 кг, на 8-10 человек хватит', time: '14:30', isOwn: true },
    { id: '5', text: 'Добрый день! Торт еще актуален?', time: '14:32', isOwn: false },
  ],
  '2': [
    { id: '1', text: 'Здравствуйте! Хочу заказать борщ', time: '10:15', isOwn: false },
    { id: '2', text: 'Добрый день! Сколько порций?', time: '10:20', isOwn: true },
    { id: '3', text: '4 порции, пожалуйста', time: '10:22', isOwn: false },
    { id: '4', text: 'Спасибо, очень вкусно было! Закажу еще', time: '13:15', isOwn: false },
  ]
};

interface MessagesProps {
  onBack?: () => void;
  onContactClick?: (userId: string) => void;
}

export function Messages({ onBack }: MessagesProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.productName?.toLowerCase().includes(searchQuery.toLowerCase())
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
          messageText={messageText}
          onMessageTextChange={setMessageText}
          onSendMessage={handleSendMessage}
          onBack={() => setSelectedChat(null)}
        />
      </div>
    </div>
  );
}
