import { apiClient } from './client';
import type { ConversationSummary, Message } from '../../types';

export interface CreateConversationData {
  productId: string;
  buyerId: string;
  sellerId: string;
}

export const conversationsApi = {
  // Получить или создать conversation
  getOrCreate: (data: CreateConversationData): Promise<ConversationSummary> => {
    return apiClient.post<ConversationSummary>('/conversations', data);
  },

  // Получить все conversations пользователя
  getUserConversations: (): Promise<ConversationSummary[]> => {
    return apiClient.get<ConversationSummary[]>('/conversations');
  },

  // Получить сообщения conversation
  getMessages: (conversationId: string, limit = 50, offset = 0): Promise<Message[]> => {
    return apiClient.get<Message[]>(`/conversations/${conversationId}/messages`, {
      limit,
      offset,
    });
  },

  // Пометить сообщения как прочитанные
  markAsRead: (conversationId: string): Promise<{ success: boolean }> => {
    return apiClient.request<{ success: boolean }>(`/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  },
};
