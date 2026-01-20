import { Request, Response } from 'express';
import { supabase } from '../supabase';

// ═════════════════════════════════════════════════════════════════════════════
// Получить или создать conversation (между покупателем и продавцом по продукту)
// ═════════════════════════════════════════════════════════════════════════════
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { productId, buyerId, sellerId } = req.body;

    if (!productId || !buyerId || !sellerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Проверяем, существует ли уже такой conversation
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .eq('product_id', productId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .single();

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Если не существует, создаем новый
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        product_id: productId,
        buyer_id: buyerId,
        seller_id: sellerId,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return res.status(500).json({ error: 'Failed to create conversation' });
    }

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// Получить все conversations для пользователя
// ═════════════════════════════════════════════════════════════════════════════
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Получаем все conversations где пользователь является buyer или seller
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        product:products(*),
        buyer:users!conversations_buyer_id_fkey(*),
        seller:users!conversations_seller_id_fkey(*)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    res.json(conversations);
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// Получить историю сообщений для conversation
// ═════════════════════════════════════════════════════════════════════════════
export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Получаем сообщения для conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    res.json(messages);
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// Пометить сообщения как прочитанные
// ═════════════════════════════════════════════════════════════════════════════
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Помечаем все сообщения в conversation как прочитанные для получателя
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      return res.status(500).json({ error: 'Failed to mark messages as read' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
