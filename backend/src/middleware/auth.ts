import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

// Расширяем Request для добавления userId
export interface AuthRequest extends Request {
  userId?: string;
}

// Middleware для проверки Supabase Auth токена
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    // Проверяем токен через Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
