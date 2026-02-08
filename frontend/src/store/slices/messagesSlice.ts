import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { conversationsApi } from '../../shared/api/conversations';
import type { Message } from '../../types';

// State структура: сообщения сгруппированы по conversationId
interface ChatMessagesMeta {
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextOffset: number;
}

interface MessagesState {
  byChatId: {
    [conversationId: string]: Message[];
  };
  metaByChatId: {
    [conversationId: string]: ChatMessagesMeta;
  };
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_MESSAGES_PER_CHAT = 500;

const initialState: MessagesState = {
  byChatId: {},
  metaByChatId: {},
};

// ═══════════════════════════════════════════════════════════════════════════
// Async Thunks
// ═══════════════════════════════════════════════════════════════════════════

// Загрузить сообщения для conversation
export const fetchConversationMessages = createAsyncThunk(
  'messages/fetchConversationMessages',
  async ({
    conversationId,
    limit = DEFAULT_PAGE_SIZE,
    offset = 0,
    mode = 'initial',
  }: {
    conversationId: string;
    limit?: number;
    offset?: number;
    mode?: 'initial' | 'older';
  }) => {
    const messages = await conversationsApi.getMessages(conversationId, limit, offset);
    return { conversationId, messages, limit, offset, mode };
  }
);

// Пометить сообщения как прочитанные
export const markMessagesAsRead = createAsyncThunk(
  'messages/markAsRead',
  async ({ conversationId }: { conversationId: string }) => {
    await conversationsApi.markAsRead(conversationId);
    return conversationId;
  }
);

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
      state.metaByChatId[conversationId] = {
        loading: false,
        error: null,
        hasMore: messages.length === DEFAULT_PAGE_SIZE,
        nextOffset: messages.length,
      };
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

      // Ограничиваем размер кэша
      if (state.byChatId[conversationId].length > MAX_MESSAGES_PER_CHAT) {
        state.byChatId[conversationId] = state.byChatId[conversationId].slice(
          -MAX_MESSAGES_PER_CHAT
        );
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
      delete state.metaByChatId[conversationId];
    },

    // Очистить все сообщения
    clearAllMessages: (state) => {
      state.byChatId = {};
      state.metaByChatId = {};
    },

    // Установить loading
    setMessagesLoading: (
      state,
      action: PayloadAction<{ conversationId: string; loading: boolean }>
    ) => {
      const { conversationId, loading } = action.payload;
      const meta = state.metaByChatId[conversationId] || {
        loading: false,
        error: null,
        hasMore: false,
        nextOffset: 0,
      };
      state.metaByChatId[conversationId] = { ...meta, loading };
    },

    // Установить ошибку
    setMessagesError: (
      state,
      action: PayloadAction<{ conversationId: string; error: string | null }>
    ) => {
      const { conversationId, error } = action.payload;
      const meta = state.metaByChatId[conversationId] || {
        loading: false,
        error: null,
        hasMore: false,
        nextOffset: 0,
      };
      state.metaByChatId[conversationId] = { ...meta, error, loading: false };
    },
  },
  extraReducers: (builder) => {
    // Загрузка сообщений
    builder
      .addCase(fetchConversationMessages.pending, (state, action) => {
        const { conversationId } = action.meta.arg;
        const meta = state.metaByChatId[conversationId] || {
          loading: false,
          error: null,
          hasMore: false,
          nextOffset: 0,
        };
        state.metaByChatId[conversationId] = { ...meta, loading: true, error: null };
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        const { conversationId, messages, limit, offset, mode } = action.payload;
        const existing = state.byChatId[conversationId] || [];

        let combined: Message[];
        if (mode === 'older') {
          combined = [...messages, ...existing];
        } else {
          combined = messages;
        }

        // Дедупликация по id
        const uniqueMap = new Map<string, Message>();
        for (const msg of combined) {
          uniqueMap.set(msg.id, msg);
        }
        const deduped = Array.from(uniqueMap.values()).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Ограничиваем размер кэша
        const trimmed = deduped.length > MAX_MESSAGES_PER_CHAT
          ? deduped.slice(-MAX_MESSAGES_PER_CHAT)
          : deduped;

        state.byChatId[conversationId] = trimmed;
        state.metaByChatId[conversationId] = {
          loading: false,
          error: null,
          hasMore: messages.length === limit,
          nextOffset: offset + messages.length,
        };
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        const { conversationId } = action.meta.arg;
        const meta = state.metaByChatId[conversationId] || {
          loading: false,
          error: null,
          hasMore: false,
          nextOffset: 0,
        };
        state.metaByChatId[conversationId] = {
          ...meta,
          loading: false,
          error: action.error.message || 'Failed to load messages',
        };
      })
      // Пометить как прочитанное
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        const messages = state.byChatId[conversationId];
        if (messages) {
          messages.forEach((msg) => {
            msg.read = true;
          });
        }
      });
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

export const selectMessagesMeta = (conversationId: string) => (state: RootState) =>
  state.messages.metaByChatId[conversationId] || {
    loading: false,
    error: null,
    hasMore: false,
    nextOffset: 0,
  };

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
