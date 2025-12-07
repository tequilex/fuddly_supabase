import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';

// Валидация
const createLeadSchema = z.object({
  productId: z.string().uuid(),
  message: z.string().optional(),
});

// Создать отклик (лид) на товар
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createLeadSchema.parse(req.body);

    // Проверка существования товара
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, status, seller_id')
      .eq('id', data.productId)
      .single();

    if (productError || !product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (product.status !== 'APPROVED') {
      res.status(400).json({ error: 'Product is not approved' });
      return;
    }

    // Нельзя откликнуться на свой товар
    if (product.seller_id === req.userId) {
      res.status(400).json({ error: 'Cannot create lead for your own product' });
      return;
    }

    // Проверка, есть ли уже отклик от этого пользователя
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('product_id', data.productId)
      .eq('buyer_id', req.userId!)
      .single();

    if (existingLead) {
      res.status(400).json({ error: 'Lead already exists' });
      return;
    }

    // Создание отклика
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        product_id: data.productId,
        buyer_id: req.userId!,
        message: data.message || null,
      })
      .select(`
        *,
        product:products(id, title, price, images),
        buyer:users!leads_buyer_id_fkey(id, name, company, phone, email)
      `)
      .single();

    if (error) {
      console.error('Create lead error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получить мои отклики (как покупатель)
export const getMyLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        product:products(
          id, title, price, images,
          seller:users!products_seller_id_fkey(id, name, company, phone)
        )
      `)
      .eq('buyer_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my leads error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(leads || []);
  } catch (error) {
    console.error('Get my leads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получить отклики на мои товары (как продавец)
export const getLeadsForMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Сначала получаем ID товаров пользователя
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', req.userId);

    if (!products || products.length === 0) {
      res.json([]);
      return;
    }

    const productIds = products.map(p => p.id);

    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        product:products(id, title, price, images),
        buyer:users!leads_buyer_id_fkey(id, name, company, phone, email)
      `)
      .in('product_id', productIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get leads for my products error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(leads || []);
  } catch (error) {
    console.error('Get leads for my products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Обновить статус отклика (только продавец)
export const updateLeadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONTACTED', 'CLOSED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*, product:products(seller_id)')
      .eq('id', id)
      .single();

    if (fetchError || !lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    // Только продавец может изменять статус
    if ((lead.product as any).seller_id !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update lead status error:', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(updatedLead);
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
