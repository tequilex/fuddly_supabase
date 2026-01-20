-- Migration: Fix RLS policies for messages table
-- Created: 2026-01-19
-- Description: Удаляет старые политики и создает новые для работы с conversations

-- ═══════════════════════════════════════════════════════════════════════════
-- Удаляем ВСЕ старые политики messages
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update received messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;

-- ═══════════════════════════════════════════════════════════════════════════
-- Создаем НОВЫЕ политики (с поддержкой conversation_id)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Пользователи могут видеть сообщения из своих разговоров
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    -- С conversation_id - проверяем участие
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    ))
    OR
    -- Без conversation_id - старый формат (backwards compatibility)
    (conversation_id IS NULL AND (sender_id = auth.uid() OR receiver_id = auth.uid()))
  );

-- 2. Пользователи могут отправлять сообщения в свои разговоры
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    -- С conversation_id - проверяем участие
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
    AND auth.uid() = sender_id)
    OR
    -- Без conversation_id - старый формат
    (conversation_id IS NULL AND auth.uid() = sender_id)
  );

-- 3. Пользователи могут обновлять сообщения (например, read = true)
CREATE POLICY "Users can update messages in their conversations" ON messages
  FOR UPDATE USING (
    -- С conversation_id - проверяем участие
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    ))
    OR
    -- Без conversation_id - старый формат (только получатель может обновить)
    (conversation_id IS NULL AND receiver_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- ПРИМЕЧАНИЕ
-- ═══════════════════════════════════════════════════════════════════════════
-- SERVICE_ROLE_KEY на backend автоматически обходит эти политики,
-- так что Socket.io сервер сможет вставлять сообщения от имени любого пользователя
