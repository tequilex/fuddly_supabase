import { apiClient } from './client';
import { Conversation } from '../../store/slices/chatsSlice';
import { Message } from '../../store/slices/messagesSlice';

export interface CreateConversationData {
  productId: string;
  buyerId: string;
  sellerId: string;
}

export const conversationsApi = {
  // Получить или создать conversation
  getOrCreate: (data: CreateConversationData): Promise<Conversation> => {
    return apiClient.post<Conversation>('/conversations', data);
  },

  // Получить все conversations пользователя
  getUserConversations: (userId: string): Promise<Conversation[]> => {
    return apiClient.get<Conversation[]>(`/conversations/user/${userId}`);
  },

  // Получить сообщения conversation
  getMessages: (conversationId: string, limit = 50, offset = 0): Promise<Message[]> => {
    return apiClient.get<Message[]>(`/conversations/${conversationId}/messages`, {
      limit,
      offset,
    });
  },

  // Пометить сообщения как прочитанные
  markAsRead: (conversationId: string, userId: string): Promise<{ success: boolean }> => {
    return apiClient.request<{ success: boolean }>(`/conversations/${conversationId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    });
  },
};
