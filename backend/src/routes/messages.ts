import { Router } from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
} from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все эндпоинты требуют авторизации
router.use(authenticateToken);

// POST /api/messages - отправить сообщение
router.post('/', sendMessage);

// GET /api/messages - получить список всех диалогов
router.get('/', getConversations);

// GET /api/messages/unread - получить количество непрочитанных
router.get('/unread', getUnreadCount);

// GET /api/messages/:userId - получить диалог с пользователем
router.get('/:userId', getConversation);

export default router;
