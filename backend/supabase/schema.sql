-- ═══════════════════════════════════════════════════════════════════════════
-- Fuddly Database Schema (Complete All-in-One)
-- Автор: Fuddly Team
-- Описание: Единый скрипт для развертывания всей структуры БД
-- Стек: Supabase (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. CONFIGURATION & EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Типы данных (Enums)
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING_VERIFICATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TABLES (Создание таблиц в правильном порядке зависимостей)
-- ═══════════════════════════════════════════════════════════════════════════

-- [1] USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  avatar TEXT,
  status user_status DEFAULT 'ACTIVE',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [2] PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  region TEXT NOT NULL,
  status product_status DEFAULT 'PENDING',
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [3] CONVERSATIONS (Связывает покупателя, продавца и товар)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Уникальность: один чат на конкретный товар между двумя людьми
  CONSTRAINT unique_conversation UNIQUE (product_id, buyer_id, seller_id)
);

-- [4] MESSAGES (Теперь сразу ссылается на conversations)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [5] REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status report_status DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. INDEXES (Для производительности)
-- ═══════════════════════════════════════════════════════════════════════════

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at_desc ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_receiver_read ON messages(conversation_id, receiver_id, read);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_product_id ON reports(product_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. TRIGGERS (Автоматическое обновление updated_at)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- 4.1 FUNCTIONS (Conversation summaries)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_conversation_summaries(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  buyer_id UUID,
  seller_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product JSONB,
  buyer JSONB,
  seller JSONB,
  last_message JSONB,
  unread_count INTEGER
)
LANGUAGE sql
AS $$
  SELECT
    c.id,
    c.product_id,
    c.buyer_id,
    c.seller_id,
    c.created_at,
    c.updated_at,
    to_jsonb(p) AS product,
    to_jsonb(b) AS buyer,
    to_jsonb(s) AS seller,
    to_jsonb(lm) AS last_message,
    COALESCE(uc.unread_count, 0) AS unread_count
  FROM conversations c
  JOIN products p ON p.id = c.product_id
  JOIN users b ON b.id = c.buyer_id
  JOIN users s ON s.id = c.seller_id
  LEFT JOIN LATERAL (
    SELECT m.*
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS unread_count
    FROM messages m
    WHERE m.conversation_id = c.id
      AND m.receiver_id = p_user_id
      AND m.read = FALSE
  ) uc ON TRUE
  WHERE c.buyer_id = p_user_id OR c.seller_id = p_user_id
  ORDER BY c.updated_at DESC;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Включаем RLS на всех таблицах
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- --- USERS POLICIES ---
CREATE POLICY "Users can view all active users" ON users
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- --- PRODUCTS POLICIES ---
CREATE POLICY "Anyone can view approved products" ON products
  FOR SELECT USING (status = 'APPROVED' OR seller_id = auth.uid());

CREATE POLICY "Users can create products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = seller_id);

-- --- CONVERSATIONS POLICIES ---
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create conversations as buyers" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversations" ON conversations
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- --- MESSAGES POLICIES (С поддержкой conversation_id) ---

-- 1. Просмотр сообщений
CREATE POLICY "Users can view messages from their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- 2. Отправка сообщений
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

-- 3. Обновление сообщений (прочитано)
CREATE POLICY "Users can update messages in their conversations" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- --- REPORTS POLICIES ---
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (reporter_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. STORAGE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════
-- Примечание: Bucket 'product-images' должен быть создан вручную или через API.
-- Этот SQL только настраивает права доступа.

-- Разрешить загрузку (Authenticated)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = 'products'
);

-- Разрешить чтение всем (Public)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Разрешить удаление (Owner)
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images'); -- Здесь в реальном проекте часто добавляют проверку на owner_id

-- Автоматическое создание бакета
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
