import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Supabase ADMIN client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Для обратной совместимости
export const supabase = supabaseAdmin;

// Database types
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING_VERIFICATION';
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  region: string;
  status: ProductStatus;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  product_id?: string;
  message: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}
