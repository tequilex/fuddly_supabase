import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/products - получить все одобренные товары (публичный)
router.get('/', getProducts);

// GET /api/products/my - получить мои товары (требуется авторизация)
router.get('/my', authenticateToken, getMyProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', getProduct);

// POST /api/products - создать товар (требуется авторизация)
router.post('/', authenticateToken, createProduct);

// PATCH /api/products/:id - обновить товар (требуется авторизация)
router.patch('/:id', authenticateToken, updateProduct);

// DELETE /api/products/:id - удалить товар (требуется авторизация)
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
