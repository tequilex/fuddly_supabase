import { Router } from 'express';
import { register, login, getMe, makeAdmin } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register - регистрация
router.post('/register', register);

// POST /api/auth/login - авторизация
router.post('/login', login);

// GET /api/auth/me - получить текущего пользователя
router.get('/me', authenticateToken, getMe);

// POST /api/auth/make-admin - стать админом (только если еще нет админов)
router.post('/make-admin', authenticateToken, makeAdmin);

export default router;
