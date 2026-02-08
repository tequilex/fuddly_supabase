// Enums
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum ProductStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ReportStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar?: string;
}

export interface Seller {
  id: string;
  name: string;
  company?: string;
  avatar?: string;
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
  seller_id?: string;
  seller?: Seller;
  image?: string;
  rating?: number;
  reviewsCount?: number;
  distance?: string;
  chef?: { name: string };
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: User;
  receiver_id: string;
  receiver?: User;
  text: string;
  read: boolean;
  created_at: string;
}

// Вспомогательные типы для UI компонентов чата
export interface ChatConversation {
  id: string; // ID conversation
  user: User; // Собеседник
  lastMessage?: Message; // Последнее сообщение в диалоге
  unreadCount: number; // Количество непрочитанных сообщений
  product?: Product; // Товар, если обсуждается товар
}

// Базовый conversation (без join-данных)
export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

// Summary для списка чатов
export interface ConversationSummary {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  product: Product;
  buyer: User;
  seller: User;
  last_message?: Message | null;
  unread_count: number;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter?: User;
  product_id?: string;
  product?: Product;
  message: string;
  status: ReportStatus;
  created_at: string;
  updated_at?: string;
}

// API Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: string;
  details?: any;
}
