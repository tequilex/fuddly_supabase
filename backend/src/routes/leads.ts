import { Router } from 'express';
import {
  createLead,
  getMyLeads,
  getLeadsForMyProducts,
  updateLeadStatus,
} from '../controllers/leadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все эндпоинты требуют авторизации
router.use(authenticateToken);

// POST /api/leads - создать отклик на товар
router.post('/', createLead);

// GET /api/leads/my - получить мои отклики (как покупатель)
router.get('/my', getMyLeads);

// GET /api/leads/received - получить отклики на мои товары (как продавец)
router.get('/received', getLeadsForMyProducts);

// PATCH /api/leads/:id/status - обновить статус отклика
router.patch('/:id/status', updateLeadStatus);

export default router;
