import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Интерфейс для Message
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

// State структура: сообщения сгруппированы по conversationId
interface MessagesState {
  byChatId: {
    [conversationId: string]: Message[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  byChatId: {},
  loading: false,
  error: null,
};

// Slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Установить сообщения для конкретного чата (загрузка истории)
    setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      const { conversationId, messages } = action.payload;
      // Сортировка по created_at (старые сверху)
      state.byChatId[conversationId] = messages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      state.loading = false;
      state.error = null;
    },

    // Добавить одно сообщение в чат (realtime update)
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const conversationId = message.conversation_id;

      if (!state.byChatId[conversationId]) {
        state.byChatId[conversationId] = [];
      }

      // Проверка на дубликаты
      const exists = state.byChatId[conversationId].some((msg) => msg.id === message.id);
      if (!exists) {
        state.byChatId[conversationId].push(message);
      }
    },

    // Обновить сообщение (например, пометить как прочитанное)
    updateMessage: (
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; changes: Partial<Message> }>
    ) => {
      const { conversationId, messageId, changes } = action.payload;
      const messages = state.byChatId[conversationId];

      if (messages) {
        const index = messages.findIndex((msg) => msg.id === messageId);
        if (index !== -1) {
          messages[index] = { ...messages[index], ...changes };
        }
      }
    },

    // Пометить все сообщения в чате как прочитанные
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const messages = state.byChatId[conversationId];

      if (messages) {
        messages.forEach((msg) => {
          msg.read = true;
        });
      }
    },

    // Очистить сообщения конкретного чата
    clearChatMessages: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      delete state.byChatId[conversationId];
    },

    // Очистить все сообщения
    clearAllMessages: (state) => {
      state.byChatId = {};
      state.error = null;
    },

    // Установить loading
    setMessagesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Установить ошибку
    setMessagesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Экспорт actions
export const {
  setMessages,
  addMessage,
  updateMessage,
  markChatAsRead,
  clearChatMessages,
  clearAllMessages,
  setMessagesLoading,
  setMessagesError,
} = messagesSlice.actions;

// Селекторы
export const selectMessagesByChatId = (conversationId: string) => (state: RootState) =>
  state.messages.byChatId[conversationId] || [];

export const selectMessagesLoading = (state: RootState) => state.messages.loading;
export const selectMessagesError = (state: RootState) => state.messages.error;

// Селектор для подсчета непрочитанных сообщений в чате
export const selectUnreadCountByChatId = (conversationId: string) => (state: RootState) => {
  const messages = state.messages.byChatId[conversationId] || [];
  return messages.filter((msg) => !msg.read).length;
};

// Селектор для последнего сообщения в чате
export const selectLastMessageByChatId = (conversationId: string) => (state: RootState) => {
  const messages = state.messages.byChatId[conversationId] || [];
  return messages.length > 0 ? messages[messages.length - 1] : null;
};

export default messagesSlice.reducer;
