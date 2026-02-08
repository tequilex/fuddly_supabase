import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import styles from './MessagesChat.module.scss';
import type { ChatConversation, Message } from '@/types';

interface MessagesChatProps {
  chat: ChatConversation | null;
  messages: Message[];
  currentUserId: string; // ID текущего пользователя для определения своих сообщений
  messageText: string;
  onMessageTextChange: (text: string) => void;
  onSendMessage: () => void;
  onBack: () => void;
  onLoadOlder?: () => void;
  hasMore?: boolean;
  loadingOlder?: boolean;
}

export function MessagesChat({
  chat,
  messages,
  currentUserId,
  messageText,
  onMessageTextChange,
  onSendMessage,
  onBack,
  onLoadOlder,
  hasMore = false,
  loadingOlder = false,
}: MessagesChatProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  if (!chat) {
    return (
      <div className={styles.chatWindow}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>💬</div>
          <h2>Выберите чат</h2>
          <p>Выберите диалог из списка слева, чтобы начать общение</p>
        </div>
      </div>
    );
  }

  const isOnline = chat.user.status === 'ACTIVE';

  return (
    <div className={`${styles.chatWindow} ${chat ? styles.chatWindowActive : ''}`}>
      <div className={styles.chatWindowHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
        </button>

        <div className={styles.chatUserInfo}>
          <div className={styles.avatarWrapper}>
            <img src={chat.user.avatar || '/default-avatar.png'} alt={chat.user.name} className={styles.avatar} />
            {isOnline && <span className={styles.onlineIndicator}></span>}
          </div>
          <div>
            <h3 className={styles.chatUserName}>{chat.user.name}</h3>
            <p className={styles.chatUserStatus}>
              {isOnline ? 'В сети' : 'Не в сети'}
            </p>
          </div>
        </div>

        <div className={styles.chatActions}>
          <button className={styles.iconButton}>
            <Phone size={20} />
          </button>
          <button className={styles.iconButton}>
            <Video size={20} />
          </button>
          <button className={styles.iconButton}>
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {chat.product && (
        <div className={styles.productCard}>
          <img src={chat.product.images[0]} alt={chat.product.title} />
          <div className={styles.productCardInfo}>
            <h4>{chat.product.title}</h4>
            <p>Обсуждение товара</p>
          </div>
          <button className={styles.productCardButton}>Открыть</button>
        </div>
      )}

      <div className={styles.messages}>
        {hasMore && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <button
              onClick={onLoadOlder}
              disabled={loadingOlder}
              style={{
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                cursor: loadingOlder ? 'not-allowed' : 'pointer',
              }}
            >
              {loadingOlder ? 'Загрузка...' : 'Показать более ранние'}
            </button>
          </div>
        )}
        {messages.map(message => {
          const isOwn = message.sender_id === currentUserId;
          const messageTime = new Date(message.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={message.id}
              className={`${styles.message} ${isOwn ? styles.messageOwn : styles.messageOther}`}
            >
              <div className={styles.messageBubble}>
                <p>{message.text}</p>
                <span className={styles.messageTime}>{messageTime}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.messageInput}>
        <input
          type="text"
          placeholder="Написать сообщение..."
          value={messageText}
          onChange={(e) => onMessageTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={styles.sendButton}
          onClick={onSendMessage}
          disabled={!messageText.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
