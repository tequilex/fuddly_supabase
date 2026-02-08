import { createSlice, createEntityAdapter, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { conversationsApi } from '../../shared/api/conversations';
import type { ConversationSummary, Message } from '../../types';

// Entity Adapter для нормализации данных
const chatsAdapter = createEntityAdapter<ConversationSummary>({
  selectId: (chat) => chat.id,
  // Сортировка по updated_at (новые сверху)
  sortComparer: (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
});

// Начальное состояние
interface ChatsState {
  activeChatId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState = chatsAdapter.getInitialState<ChatsState>({
  activeChatId: null,
  loading: false,
  error: null,
});

// ═══════════════════════════════════════════════════════════════════════════
// Async Thunks
// ═══════════════════════════════════════════════════════════════════════════

// Загрузить все чаты пользователя
export const fetchUserChats = createAsyncThunk(
  'chats/fetchUserChats',
  async () => {
    return await conversationsApi.getUserConversations();
  }
);

// Создать или получить conversation
export const getOrCreateConversation = createAsyncThunk(
  'chats/getOrCreate',
  async (data: { productId: string; buyerId: string; sellerId: string }) => {
    return await conversationsApi.getOrCreate(data);
  }
);

// Slice
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    // Установить активный чат
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },

    // Установить все чаты (при загрузке)
    setChats: (state, action: PayloadAction<ConversationSummary[]>) => {
      chatsAdapter.setAll(state, action.payload);
      state.loading = false;
      state.error = null;
    },

    // Добавить один чат
    addChat: (state, action: PayloadAction<ConversationSummary>) => {
      chatsAdapter.addOne(state, action.payload);
    },

    // Обновить чат (например, updated_at при новом сообщении)
    updateChat: (state, action: PayloadAction<{ id: string; changes: Partial<ConversationSummary> }>) => {
      chatsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload.changes,
      });
    },

    // Обновить last_message
    setChatLastMessage: (state, action: PayloadAction<{ id: string; message: Message }>) => {
      chatsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          last_message: action.payload.message,
          updated_at: action.payload.message.created_at,
        },
      });
    },

    // Увеличить unread_count
    incrementUnreadCount: (state, action: PayloadAction<{ id: string; by?: number }>) => {
      const current = state.entities[action.payload.id];
      if (!current) return;
      const increment = action.payload.by ?? 1;
      chatsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          unread_count: (current.unread_count || 0) + increment,
          updated_at: current.updated_at,
        },
      });
    },

    // Сбросить unread_count
    resetUnreadCount: (state, action: PayloadAction<string>) => {
      const current = state.entities[action.payload];
      if (!current) return;
      chatsAdapter.updateOne(state, {
        id: action.payload,
        changes: {
          unread_count: 0,
        },
      });
    },

    // Удалить чат
    removeChat: (state, action: PayloadAction<string>) => {
      chatsAdapter.removeOne(state, action.payload);
      if (state.activeChatId === action.payload) {
        state.activeChatId = null;
      }
    },

    // Установить loading
    setChatsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Установить ошибку
    setChatsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Очистить все чаты
    clearChats: (state) => {
      chatsAdapter.removeAll(state);
      state.activeChatId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Загрузка чатов
    builder
      .addCase(fetchUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        chatsAdapter.setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load chats';
      })
      // Создание/получение conversation
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        chatsAdapter.upsertOne(state, action.payload);
        state.activeChatId = action.payload.id;
      });
  },
});

// Экспорт actions
export const {
  setActiveChat,
  setChats,
  addChat,
  updateChat,
  setChatLastMessage,
  incrementUnreadCount,
  resetUnreadCount,
  removeChat,
  setChatsLoading,
  setChatsError,
  clearChats,
} = chatsSlice.actions;

// Экспорт селекторов
export const chatsSelectors = chatsAdapter.getSelectors<RootState>((state) => state.chats);

// Кастомные селекторы
export const selectActiveChatId = (state: RootState) => state.chats.activeChatId;
export const selectChatsLoading = (state: RootState) => state.chats.loading;
export const selectChatsError = (state: RootState) => state.chats.error;

// Селектор активного чата
export const selectActiveChat = (state: RootState) => {
  const activeChatId = state.chats.activeChatId;
  if (!activeChatId) return null;
  return chatsSelectors.selectById(state, activeChatId);
};

export default chatsSlice.reducer;
