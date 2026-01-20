import { Router } from 'express';
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  markMessagesAsRead,
} from '../controllers/conversationController';

const router = Router();

// POST /api/conversations - Получить или создать conversation
router.post('/', getOrCreateConversation);

// GET /api/conversations/:userId - Получить все conversations пользователя
router.get('/user/:userId', getUserConversations);

// GET /api/conversations/:conversationId/messages - Получить сообщения conversation
router.get('/:conversationId/messages', getConversationMessages);

// PUT /api/conversations/:conversationId/read - Пометить сообщения как прочитанные
router.put('/:conversationId/read', markMessagesAsRead);

export default router;
