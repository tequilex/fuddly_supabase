import { Search } from 'lucide-react';
import styles from './MessagesList.module.scss';

export interface Chat {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  productName?: string;
  productImage?: string;
}

interface MessagesListProps {
  chats: Chat[];
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
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.chatItemActive : ''}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className={styles.avatarWrapper}>
              <img src={chat.userAvatar} alt={chat.userName} className={styles.avatar} />
              {chat.isOnline && <span className={styles.onlineIndicator}></span>}
            </div>

            <div className={styles.chatInfo}>
              <div className={styles.chatHeader}>
                <h3 className={styles.chatName}>{chat.userName}</h3>
                <span className={styles.chatTime}>{chat.time}</span>
              </div>

              {chat.productName && (
                <div className={styles.productInfo}>
                  {chat.productImage && (
                    <img src={chat.productImage} alt={chat.productName} className={styles.productImage} />
                  )}
                  <span className={styles.productName}>{chat.productName}</span>
                </div>
              )}

              <div className={styles.chatFooter}>
                <p className={styles.lastMessage}>{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
