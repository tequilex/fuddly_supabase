import { apiClient } from './client';
import { Product } from '@/shared/types';

export interface ProductFilters {
  category?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  region: string;
}

export const productsApi = {
  getProducts: (filters?: ProductFilters): Promise<ProductsResponse> => {
    return apiClient.get<ProductsResponse>('/products', filters);
  },

  getProduct: (id: string): Promise<Product> => {
    return apiClient.get<Product>(`/products/${id}`);
  },

  getMyProducts: (): Promise<Product[]> => {
    return apiClient.get<Product[]>('/products/my');
  },

  createProduct: (data: CreateProductData): Promise<Product> => {
    return apiClient.post<Product>('/products', data);
  },

  updateProduct: (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    return apiClient.patch<Product>(`/products/${id}`, data);
  },

  deleteProduct: (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/products/${id}`);
  },
};
