import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { supabase } from './supabase';

// Интерфейсы для Socket.io событий
interface SendMessagePayload {
  conversationId: string;
  text: string;
  senderId: string;
  receiverId: string;
}

interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // JWT Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new Error('Invalid or expired token'));
      }

      // Attach user info to socket
      socket.data.userId = user.id;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      return next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId}, socket: ${socket.id}`);

    // Пользователь присоединяется к своей приватной комнате
    socket.join(userId);

    // ═════════════════════════════════════════════════════════════════════
    // Событие: send_message
    // ═════════════════════════════════════════════════════════════════════
    socket.on('send_message', async (payload: SendMessagePayload) => {
      try {
        const { conversationId, text, senderId, receiverId } = payload;

        // Проверка: отправитель должен совпадать с userId из сокета
        if (senderId !== userId) {
          socket.emit('error', { message: 'Sender ID mismatch' });
          return;
        }

        // 1. Вставка сообщения в базу данных
        const { data: newMessage, error: insertError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            receiver_id: receiverId,
            text: text,
            read: false,
          })
          .select()
          .single();

        if (insertError || !newMessage) {
          console.error('Error inserting message:', insertError);
          socket.emit('error', { message: 'Failed to send message' });
          return;
        }

        // 2. Обновление updated_at в conversations
        const { error: updateError } = await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        if (updateError) {
          console.error('Error updating conversation:', updateError);
        }

        // 3. Отправка сообщения получателю (в его приватную комнату)
        io.to(receiverId).emit('receive_message', newMessage);

        // 4. Подтверждение отправителю
        socket.emit('message_sent', newMessage);

        console.log(`💬 Message sent: ${senderId} -> ${receiverId} in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error in send_message:', error);
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    // ═════════════════════════════════════════════════════════════════════
    // Событие: disconnect
    // ═════════════════════════════════════════════════════════════════════
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId}, socket: ${socket.id}`);
    });
  });

  return io;
}
