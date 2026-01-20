import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import messageRoutes from './routes/messages';
import conversationRoutes from './routes/conversations';
import { initializeSocket } from './socket';

// Загрузка переменных окружения
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
console.log(process.env.PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Create HTTP server and initialize Socket.io
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Fuddly Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.io server initialized`);
});
