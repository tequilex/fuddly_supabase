import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';

// Валидация схем с помощью Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  company: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Регистрация пользователя
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    // Создание пользователя через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      res.status(400).json({ error: authError.message });
      return;
    }

    if (!authData.user) {
      res.status(400).json({ error: 'Failed to create user' });
      return;
    }

    // Создание записи пользователя в таблице users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        company: data.company || null,
        phone: data.phone || null,
        status: 'ACTIVE',
        is_admin: false,
      })
      .select()
      .single();

    if (userError) {
      res.status(500).json({ error: userError.message });
      return;
    }

    res.status(201).json({
      user: userData,
      token: authData.session?.access_token || ''
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Авторизация пользователя
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    // Авторизация через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!authData.user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Получение данных пользователя из таблицы users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Проверка статуса
    if (userData.status === 'BLOCKED') {
      res.status(403).json({ error: 'Account is blocked' });
      return;
    }

    res.json({
      user: userData,
      token: authData.session?.access_token || '',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получение текущего пользователя
export const getMe = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, company, phone, avatar, status, is_admin, created_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Сделать текущего пользователя админом (только если еще нет админов)
export const makeAdmin = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Проверяем, есть ли уже админы
    const { data: existingAdmins, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('is_admin', true)
      .limit(1);

    if (checkError) {
      res.status(500).json({ error: checkError.message });
      return;
    }

    if (existingAdmins && existingAdmins.length > 0) {
      res.status(403).json({ error: 'Admin already exists' });
      return;
    }

    // Делаем текущего пользователя админом
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', req.userId)
      .select()
      .single();

    if (updateError || !user) {
      res.status(500).json({ error: updateError?.message || 'Failed to update user' });
      return;
    }

    res.json({ message: 'You are now admin', user });
  } catch (error) {
    console.error('MakeAdmin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
