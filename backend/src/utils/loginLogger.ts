import { supabase } from '../supabase';
import { getGeolocation } from './geoip';

export interface LoginLogData {
  userId: string | null;
  email: string;
  status: 'success' | 'failed';
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logLoginAttempt(data: LoginLogData): Promise<void> {
  try {
    const geo = data.ipAddress
      ? await getGeolocation(data.ipAddress)
      : { country: null, city: null, isp: null };

    const { error } = await supabase.from('login_logs').insert({
      user_id: data.userId,
      email: data.email,
      login_status: data.status,
      failure_reason: data.failureReason || null,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      country: geo.country,
      city: geo.city,
      isp: geo.isp
    });

    if (error) {
      console.error('Failed to log login attempt:', error);
    }
  } catch (error) {
    console.error('Login logging error:', error);
  }
}
