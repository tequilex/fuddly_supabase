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

export enum LeadStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED',
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
  seller?: {
    id: string;
    name: string;
    company?: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  product_id: string;
  product?: Product;
  buyer_id: string;
  buyer?: User;
  message?: string;
  status: LeadStatus;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender?: User;
  receiver_id: string;
  receiver?: User;
  text: string;
  read: boolean;
  created_at: string;
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
