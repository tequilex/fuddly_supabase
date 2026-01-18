import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import styles from './MessagesChat.module.scss';
import type { Chat } from '../MessagesList/MessagesList';

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface MessagesChatProps {
  chat: Chat | null;
  messages: Message[];
  messageText: string;
  onMessageTextChange: (text: string) => void;
  onSendMessage: () => void;
  onBack: () => void;
}

export function MessagesChat({
  chat,
  messages,
  messageText,
  onMessageTextChange,
  onSendMessage,
  onBack,
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

  return (
    <div className={`${styles.chatWindow} ${chat ? styles.chatWindowActive : ''}`}>
      <div className={styles.chatWindowHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={20} />
        </button>

        <div className={styles.chatUserInfo}>
          <div className={styles.avatarWrapper}>
            <img src={chat.userAvatar} alt={chat.userName} className={styles.avatar} />
            {chat.isOnline && <span className={styles.onlineIndicator}></span>}
          </div>
          <div>
            <h3 className={styles.chatUserName}>{chat.userName}</h3>
            <p className={styles.chatUserStatus}>
              {chat.isOnline ? 'В сети' : 'Не в сети'}
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

      {chat.productName && (
        <div className={styles.productCard}>
          <img src={chat.productImage} alt={chat.productName} />
          <div className={styles.productCardInfo}>
            <h4>{chat.productName}</h4>
            <p>Обсуждение товара</p>
          </div>
          <button className={styles.productCardButton}>Открыть</button>
        </div>
      )}

      <div className={styles.messages}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`${styles.message} ${message.isOwn ? styles.messageOwn : styles.messageOther}`}
          >
            <div className={styles.messageBubble}>
              <p>{message.text}</p>
              <span className={styles.messageTime}>{message.time}</span>
            </div>
          </div>
        ))}
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
