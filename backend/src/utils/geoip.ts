import axios from 'axios';

export interface GeoLocation {
  country: string | null;
  city: string | null;
  isp: string | null;
}

// Кэш для геолокации (чтобы не делать лишние запросы к API)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

interface CacheEntry {
  data: GeoLocation;
  timestamp: number;
}

const geoCacheWithTTL = new Map<string, CacheEntry>();

export async function getGeolocation(ip: string): Promise<GeoLocation> {
  // Нормализуем IPv6-mapped IPv4 адрес (::ffff:127.0.0.1 -> 127.0.0.1)
  let normalizedIp = ip;
  if (ip && ip.startsWith('::ffff:')) {
    normalizedIp = ip.substring(7);
  }

  // Проверяем локальные адреса
  if (!normalizedIp ||
      normalizedIp === '127.0.0.1' ||
      normalizedIp === '::1' ||
      normalizedIp === 'localhost' ||
      normalizedIp.startsWith('192.168.') ||
      normalizedIp.startsWith('10.') ||
      normalizedIp.startsWith('172.16.')) {
    return { country: null, city: null, isp: null };
  }

  // Проверяем кэш
  const cached = geoCacheWithTTL.get(normalizedIp);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Запрос к ipwho.is API
    const response = await axios.get(`https://ipwho.is/${normalizedIp}`, {
      timeout: 3000, // 3 секунды таймаут
      headers: {
        'Accept': 'application/json'
      }
    });

    // Проверяем успешность ответа
    if (!response.data.success) {
      console.warn(`⚠️  IP geolocation failed for ${normalizedIp}:`, response.data.message);
      return { country: null, city: null, isp: null };
    }

    const result: GeoLocation = {
      country: response.data.country_code || null,
      city: response.data.city || null,
      isp: response.data.connection?.isp || null
    };

    // Сохраняем в кэш
    geoCacheWithTTL.set(normalizedIp, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error: any) {
    // Не логируем ошибки таймаута (это нормально при медленной сети)
    if (error.code !== 'ECONNABORTED') {
      console.error('Geolocation API error:', error.message);
    }
    return { country: null, city: null, isp: null };
  }
}
