import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addMessage } from '../store/slices/messagesSlice';
import type { Message } from '../types';
import { updateChat, incrementUnreadCount, resetUnreadCount } from '../store/slices/chatsSlice';
import { selectActiveChatId } from '../store/slices/chatsSlice';
import { markMessagesAsRead } from '../store/slices/messagesSlice';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';

interface SocketContextValue {
  socket: Socket | null;
  sendMessage: (payload: {
    conversationId: string;
    text: string;
    receiverId: string;
  }) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const activeChatIdRef = useRef<string | null>(null);

  const { token, user } = useAppSelector((state) => state.auth);
  const activeChatId = useAppSelector(selectActiveChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);


  useEffect(() => {
    // Если нет токена или пользователя, не подключаемся
    if (!token || !user) {
      console.log('⚠️ No token or user, skipping socket connection');

      if (socketRef.current) {
        console.log('🔌 Disconnecting existing socket due to missing auth...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Если сокет уже существует, не создаем новый
    if (socketRef.current) {
      console.log('✅ Socket already exists:', socketRef.current.id);
      return;
    }

    // Инициализация Socket.io соединения
    console.log('🔌 Initializing socket connection...');
    const socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // ═════════════════════════════════════════════════════════════════════
    // Обработчик подключения
    // ═════════════════════════════════════════════════════════════════════
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    // ═════════════════════════════════════════════════════════════════════
    // Обработчик получения сообщения
    // ═════════════════════════════════════════════════════════════════════
    socket.on('receive_message', (message: Message) => {
      console.log('📩 Received message:', message);

      // Добавляем сообщение в Redux
      dispatch(addMessage(message));

      // Обновляем updated_at и last_message в чате
      dispatch(
        updateChat({
          id: message.conversation_id,
          changes: { updated_at: message.created_at, last_message: message },
        })
      );

      // Если это не активный чат - увеличиваем unread
      if (message.conversation_id !== activeChatIdRef.current && message.receiver_id === user?.id) {
        dispatch(incrementUnreadCount({ id: message.conversation_id, by: 1 }));
      }

      // Если активный чат - сразу помечаем как прочитанное
      if (message.conversation_id === activeChatIdRef.current && message.receiver_id === user?.id) {
        dispatch(markMessagesAsRead({ conversationId: message.conversation_id }));
        dispatch(resetUnreadCount(message.conversation_id));
      }

      toast.info('Новое сообщение', {
        description: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
        duration: 3000,
      });
    });

    // ═════════════════════════════════════════════════════════════════════
    // Обработчик подтверждения отправки
    // ═════════════════════════════════════════════════════════════════════
    socket.on('message_sent', (message: Message) => {
      console.log('✅ Message sent confirmation:', message);

      // Добавляем сообщение в Redux (если его еще нет)
      dispatch(addMessage(message));

      // Обновляем updated_at и last_message в чате
      dispatch(
        updateChat({
          id: message.conversation_id,
          changes: { updated_at: message.created_at, last_message: message },
        })
      );
    });

    // ═════════════════════════════════════════════════════════════════════
    // Обработчик ошибок
    // ═════════════════════════════════════════════════════════════════════
    socket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error);
      toast.error('Ошибка чата', {
        description: error.message,
      });
    });

    // ═════════════════════════════════════════════════════════════════════
    // Обработчик отключения
    // ═════════════════════════════════════════════════════════════════════
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        toast.error('Отключено от сервера');
      }
    });

    // ═════════════════════════════════════════════════════════════════════
    // Обработчик ошибок подключения
    // ═════════════════════════════════════════════════════════════════════
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      toast.error('Не удалось подключиться к чату');
    });

    // Cleanup при размонтировании Provider (только когда закрывается приложение)
    return () => {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, dispatch]);

  // Функция для отправки сообщения
  const sendMessage = (payload: {
    conversationId: string;
    text: string;
    receiverId: string;
  }) => {
    if (!socketRef.current || !user) {
      console.error('Socket not connected or user not available');
      toast.error('Нет подключения к чату');
      return;
    }

    socketRef.current.emit('send_message', {
      conversationId: payload.conversationId,
      text: payload.text,
      senderId: user.id,
      receiverId: payload.receiverId,
    });
  };

  const value: SocketContextValue = {
    socket: socketRef.current,
    sendMessage,
    isConnected: socketRef.current?.connected || false,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// Легковесный хук для доступа к сокету
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}
