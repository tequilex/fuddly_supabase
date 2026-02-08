import { Router } from 'express';
import {
  getConversationSummaries,
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  markMessagesAsRead,
} from '../controllers/conversationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все эндпоинты требуют авторизации
router.use(authenticateToken);

// GET /api/conversations - Получить список conversations (для текущего пользователя)
router.get('/', getConversationSummaries);

// POST /api/conversations - Получить или создать conversation
router.post('/', getOrCreateConversation);

// GET /api/conversations/:userId - Получить все conversations пользователя
router.get('/user/:userId', getUserConversations);

// GET /api/conversations/:conversationId/messages - Получить сообщения conversation
router.get('/:conversationId/messages', getConversationMessages);

// PUT /api/conversations/:conversationId/read - Пометить сообщения как прочитанные
router.put('/:conversationId/read', markMessagesAsRead);

export default router;
