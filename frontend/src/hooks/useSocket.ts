import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addMessage, Message } from '../store/slices/messagesSlice';
import { updateChat } from '../store/slices/chatsSlice';
import { selectActiveChatId } from '../store/slices/chatsSlice';
import { toast } from 'sonner';

// URL backend сервера
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const activeChatIdRef = useRef<string | null>(null);

  // Получаем токен и userId из Redux
  const { token, user } = useAppSelector((state) => state.auth);
  const activeChatId = useAppSelector(selectActiveChatId);

  // Обновляем ref при изменении activeChatId (БЕЗ пересоздания socket)
  activeChatIdRef.current = activeChatId;

  useEffect(() => {
    // Если нет токена или пользователя, не подключаемся
    if (!token || !user) {
      console.log('⚠️ No token or user, skipping socket connection');
      // Если сокет был создан ранее, отключаем его
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

      // Обновляем updated_at в чате
      dispatch(
        updateChat({
          id: message.conversation_id,
          changes: { updated_at: message.created_at },
        })
      );

      // Если сообщение НЕ из активного чата, показываем уведомление
      if (message.conversation_id !== activeChatIdRef.current) {
        toast.info('Новое сообщение', {
          description: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
          duration: 3000,
        });
      }
    });

    // ═════════════════════════════════════════════════════════════════════
    // Обработчик подтверждения отправки
    // ═════════════════════════════════════════════════════════════════════
    socket.on('message_sent', (message: Message) => {
      console.log('✅ Message sent confirmation:', message);

      // Добавляем сообщение в Redux (если его еще нет)
      dispatch(addMessage(message));

      // Обновляем updated_at в чате
      dispatch(
        updateChat({
          id: message.conversation_id,
          changes: { updated_at: message.created_at },
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

    // Cleanup при размонтировании компонента
    return () => {
      console.log('🔌 Disconnecting socket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, dispatch]); // activeChatId убран из зависимостей!

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

  return {
    socket: socketRef.current,
    sendMessage,
  };
};
