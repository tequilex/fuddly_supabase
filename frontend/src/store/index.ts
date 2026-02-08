import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import uiReducer from './slices/uiSlice';
import chatsReducer from './slices/chatsSlice';
import messagesReducer from './slices/messagesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    ui: uiReducer,
    chats: chatsReducer,
    messages: messagesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
