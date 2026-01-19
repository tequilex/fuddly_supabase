import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Интерфейс для Conversation
export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

// Entity Adapter для нормализации данных
const chatsAdapter = createEntityAdapter<Conversation>({
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
    setChats: (state, action: PayloadAction<Conversation[]>) => {
      chatsAdapter.setAll(state, action.payload);
      state.loading = false;
      state.error = null;
    },

    // Добавить один чат
    addChat: (state, action: PayloadAction<Conversation>) => {
      chatsAdapter.addOne(state, action.payload);
    },

    // Обновить чат (например, updated_at при новом сообщении)
    updateChat: (state, action: PayloadAction<{ id: string; changes: Partial<Conversation> }>) => {
      chatsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload.changes,
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
});

// Экспорт actions
export const {
  setActiveChat,
  setChats,
  addChat,
  updateChat,
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
