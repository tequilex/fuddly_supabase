import { Request } from 'express';

export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }

  return req.ip || req.socket.remoteAddress;
}

export function getUserAgent(req: Request): string | undefined {
  const ua = req.headers['user-agent'];
  return typeof ua === 'string' ? ua : undefined;
}
