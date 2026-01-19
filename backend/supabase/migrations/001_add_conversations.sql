-- Migration: Add conversations table and update messages table
-- Created: 2026-01-19
-- Description: Adds conversations table to link buyers, sellers, and products
--              Updates messages table to reference conversations

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1: Create conversations table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Уникальная комбинация продукта, покупателя и продавца
  CONSTRAINT unique_conversation UNIQUE (product_id, buyer_id, seller_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2: Add conversation_id to messages table
-- ═══════════════════════════════════════════════════════════════════════════

-- Добавляем новую колонку conversation_id
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3: Create indexes for better performance
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 4: Add trigger for updated_at
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 5: Row Level Security (RLS) Policies
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть разговоры, в которых они участвуют
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Пользователи могут создавать разговоры как покупатели
CREATE POLICY "Users can create conversations as buyers" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Обновлять могут только участники разговора (для updated_at)
CREATE POLICY "Participants can update conversations" ON conversations
  FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 6: Update messages policies to work with conversations
-- ═══════════════════════════════════════════════════════════════════════════

-- Удаляем старые политики messages (если нужно обновить)
-- DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
-- DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Новая политика: пользователи видят сообщения из своих разговоров
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Новая политика: пользователи могут отправлять сообщения в свои разговоры
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTES / ПРИМЕЧАНИЯ
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. После выполнения миграции, старые сообщения без conversation_id
--    нужно будет либо удалить, либо создать для них conversations
--
-- 2. Рекомендуется создать функцию для автоматического создания conversation
--    при первом сообщении между покупателем и продавцом по продукту
--
-- 3. updated_at в conversations автоматически обновляется при каждом новом сообщении
--    это позволит сортировать чаты по активности
