import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { supabase } from './supabase';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // JWT Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new Error('Invalid or expired token'));
      }

      // Attach user info to socket
      socket.data.userId = user.id;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      return next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId}, socket: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId}, socket: ${socket.id}`);
    });
  });

  return io;
}
