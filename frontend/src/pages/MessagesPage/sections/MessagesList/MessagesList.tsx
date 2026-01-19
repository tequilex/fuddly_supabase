import { Search } from 'lucide-react';
import styles from './MessagesList.module.scss';
import type { ChatConversation } from '@/types';

interface MessagesListProps {
  chats: ChatConversation[];
  selectedChatId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onChatSelect: (chatId: string) => void;
}

export function MessagesList({
  chats,
  selectedChatId,
  searchQuery,
  onSearchChange,
  onChatSelect,
}: MessagesListProps) {
  return (
    <div className={`${styles.chatList} ${selectedChatId ? styles.chatListHidden : ''}`}>
      <div className={styles.chatListHeader}>
        <h1>Сообщения</h1>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск по сообщениям..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.chats}>
        {chats.map(chat => {
          const isOnline = chat.user.status === 'ACTIVE';
          const lastMessageTime = chat.lastMessage
            ? new Date(chat.lastMessage.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.chatItemActive : ''}`}
              onClick={() => onChatSelect(chat.id)}
            >
              <div className={styles.avatarWrapper}>
                <img src={chat.user.avatar || '/default-avatar.png'} alt={chat.user.name} className={styles.avatar} />
                {isOnline && <span className={styles.onlineIndicator}></span>}
              </div>

              <div className={styles.chatInfo}>
                <div className={styles.chatHeader}>
                  <h3 className={styles.chatName}>{chat.user.name}</h3>
                  <span className={styles.chatTime}>{lastMessageTime}</span>
                </div>

                {chat.product && (
                  <div className={styles.productInfo}>
                    {chat.product.images[0] && (
                      <img src={chat.product.images[0]} alt={chat.product.title} className={styles.productImage} />
                    )}
                    <span className={styles.productName}>{chat.product.title}</span>
                  </div>
                )}

                <div className={styles.chatFooter}>
                  <p className={styles.lastMessage}>{chat.lastMessage?.text || ''}</p>
                  {chat.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
