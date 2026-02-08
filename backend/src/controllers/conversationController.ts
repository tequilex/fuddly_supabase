import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';

const createConversationSchema = z.object({
  productId: z.string().uuid(),
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
});

// ═════════════════════════════════════════════════════════════════════════====
// Получить список conversations с last_message и unread_count
// ═════════════════════════════════════════════════════════════════════════====
export const getConversationSummaries = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase.rpc('get_conversation_summaries', {
      p_user_id: req.userId,
    });

    if (error) {
      console.error('Error fetching conversation summaries:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error in getConversationSummaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═════════════════════════════════════════════════════════════════════════====
// Получить или создать conversation (между покупателем и продавцом по продукту)
// ═════════════════════════════════════════════════════════════════════════====
export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = createConversationSchema.parse(req.body);

    // Только покупатель может создавать conversation
    if (data.buyerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (data.buyerId === data.sellerId) {
      return res.status(400).json({ error: 'Buyer and seller cannot be the same' });
    }

    // Проверяем, что product существует и sellerId совпадает
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', data.productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id !== data.sellerId) {
      return res.status(400).json({ error: 'Seller does not match product owner' });
    }

    // Проверяем, существует ли уже такой conversation
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('product_id', data.productId)
      .eq('buyer_id', data.buyerId)
      .eq('seller_id', data.sellerId)
      .single();

    let conversationId = existingConversation?.id;

    if (!conversationId) {
      // Если не существует, создаем новый
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          product_id: data.productId,
          buyer_id: data.buyerId,
          seller_id: data.sellerId,
        })
        .select()
        .single();

      if (createError || !newConversation) {
        console.error('Error creating conversation:', createError);
        return res.status(500).json({ error: 'Failed to create conversation' });
      }

      conversationId = newConversation.id;
    }

    // Возвращаем summary с join-данными
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        product:products(*),
        buyer:users!conversations_buyer_id_fkey(*),
        seller:users!conversations_seller_id_fkey(*)
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('Error fetching conversation:', convError);
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }

    const { data: lastMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', req.userId)
      .eq('read', false);

    res.status(existingConversation ? 200 : 201).json({
      ...conversation,
      last_message: lastMessages && lastMessages.length > 0 ? lastMessages[0] : null,
      unread_count: count || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═════════════════════════════════════════════════════════════════════════====
// Получить все conversations для пользователя
// ═════════════════════════════════════════════════════════════════════════====
export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.params;
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
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
      .or(`buyer_id.eq.${req.userId},seller_id.eq.${req.userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    res.json(conversations || []);
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═════════════════════════════════════════════════════════════════════════====
// Получить историю сообщений для conversation
// ═════════════════════════════════════════════════════════════════════════====
export const getConversationMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Проверяем участие пользователя в conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.buyer_id !== req.userId && conversation.seller_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Получаем сообщения для conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Возвращаем в порядке возрастания времени (старые -> новые)
    res.json((messages || []).slice().reverse());
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ═════════════════════════════════════════════════════════════════════════====
// Пометить сообщения как прочитанные
// ═════════════════════════════════════════════════════════════════════════====
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Проверяем участие пользователя в conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.buyer_id !== req.userId && conversation.seller_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Помечаем все сообщения в conversation как прочитанные для текущего пользователя
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', req.userId)
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
