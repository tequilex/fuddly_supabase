import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';

// Валидация
const sendMessageSchema = z.object({
  receiverId: z.string().uuid(),
  text: z.string().min(1),
});

// Отправить сообщение
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = sendMessageSchema.parse(req.body);

    // Нельзя отправить сообщение самому себе
    if (data.receiverId === req.userId) {
      res.status(400).json({ error: 'Cannot send message to yourself' });
      return;
    }

    // Проверка существования получателя
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.receiverId)
      .single();

    if (receiverError || !receiver) {
      res.status(404).json({ error: 'Receiver not found' });
      return;
    }

    // Создание сообщения
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: req.userId!,
        receiver_id: data.receiverId,
        text: data.text,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar),
        receiver:users!messages_receiver_id_fkey(id, name, avatar)
      `)
      .single();

    if (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получить диалог с конкретным пользователем
export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar),
        receiver:users!messages_receiver_id_fkey(id, name, avatar)
      `)
      .or(`and(sender_id.eq.${req.userId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${req.userId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    // Отметить сообщения как прочитанные
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', userId)
      .eq('receiver_id', req.userId)
      .eq('read', false);

    res.json(messages || []);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получить список всех диалогов
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Получаем все сообщения, где пользователь участвует
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, avatar),
        receiver:users!messages_receiver_id_fkey(id, name, avatar)
      `)
      .or(`sender_id.eq.${req.userId},receiver_id.eq.${req.userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    if (!messages || messages.length === 0) {
      res.json([]);
      return;
    }

    // Группируем по собеседникам
    const conversationsMap = new Map<string, any>();

    for (const message of messages) {
      const otherUserId = message.sender_id === req.userId
        ? message.receiver_id
        : message.sender_id;

      if (!conversationsMap.has(otherUserId)) {
        const otherUser = message.sender_id === req.userId
          ? message.receiver
          : message.sender;

        // Подсчет непрочитанных
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', otherUserId)
          .eq('receiver_id', req.userId)
          .eq('read', false);

        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: count || 0,
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получить количество непрочитанных сообщений
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', req.userId)
      .eq('read', false);

    if (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ count: count || 0 });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
