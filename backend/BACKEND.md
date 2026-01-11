# Backend Documentation

## Содержание

1. [Геолокация через ipwho.is API](#геолокация-через-ipwhois-api)
2. [Интеграция в проект](#интеграция-в-проект)
3. [Кэширование](#кэширование)
4. [Лимиты и мониторинг](#лимиты-и-мониторинг)
5. [Тестирование](#тестирование)
6. [SQL запросы для аналитики](#sql-запросы-для-аналитики)
7. [Автоматическая очистка логов](#автоматическая-очистка-логов)
8. [Troubleshooting](#troubleshooting)

---

## Геолокация через ipwho.is API

### Что такое ipwho.is?

**ipwho.is** - бесплатный API для определения геолокации по IP адресу.

### Преимущества:

- **Бесплатно** - 10,000 запросов/месяц без регистрации
- **Без API ключа** - работает сразу после установки
- **Хорошая точность** - ~75-80% для городов
- **Простой API** - один HTTP GET запрос
- **Кэширование** - результаты кэшируются на 24 часа
- **Дополнительные данные** - timezone, currency, ISP

### Точность:

- **Страна**: 95-98%
- **Город**: 75-80%
- **Мобильные IP**: Определяет, но показывает местоположение оператора связи
- **VPN/Proxy**: Показывает местоположение VPN сервера

---

## Интеграция в проект

### Файлы:

1. [geoip.ts](src/utils/geoip.ts) - функция `getGeolocation(ip)`
2. [loginLogger.ts](src/utils/loginLogger.ts) - вызывает геолокацию при логировании
3. [authController.ts](src/controllers/authController.ts) - логирует каждый вход

### API Request

```bash
GET https://ipwho.is/8.8.8.8
```

### Response Example

```json
{
  "ip": "8.8.8.8",
  "success": true,
  "type": "IPv4",
  "country": "United States",
  "country_code": "US",
  "city": "Mountain View",
  "region": "California",
  "timezone": "America/Los_Angeles",
  "latitude": 37.386,
  "longitude": -122.0838,
  "connection": {
    "asn": 15169,
    "org": "Google LLC",
    "isp": "Google LLC",
    "domain": "google.com"
  }
}
```

### Как используется:

```typescript
// При входе пользователя
const ipAddress = getClientIp(req); // Извлекаем IP
const userAgent = getUserAgent(req);

// Логируем попытку входа (геолокация происходит внутри)
await logLoginAttempt({
  userId: user.id,
  email: user.email,
  status: 'success',
  ipAddress,  // Передаем IP
  userAgent,
});

// В loginLogger.ts:
const geo = await getGeolocation(ipAddress); // API запрос к ipwho.is
// Результат сохраняется в login_logs
```

---

## Кэширование

Для экономии API запросов используется **in-memory кэш**:

- **TTL**: 24 часа
- **Хранение**: `Map<IP, GeoLocation>`
- **Автоматическая очистка**: Устаревшие записи не используются

### Пример:

```typescript
const cached = geoCacheWithTTL.get('8.8.8.8');
if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return cached.data; // Возвращаем из кэша
}

// Иначе делаем новый запрос к API
const response = await axios.get('https://ipwho.is/8.8.8.8');
```

**Экономия**: Если один IP заходит 100 раз в день, будет сделан только **1 API запрос**.

---

## Лимиты и мониторинг

### Лимиты ipwho.is

| План | Запросов/месяц | Стоимость |
|------|----------------|-----------|
| Free | 10,000 | Бесплатно |
| Pro | 250,000 | $10/месяц |
| Business | 1,000,000 | $25/месяц |

### Расчет для вашего проекта:

- **10,000 запросов/месяц** = ~333 запроса/день
- С кэшированием: **1 запрос на уникальный IP**
- Если у вас 200 уникальных пользователей/день → **200 запросов/день**
- **Итого**: ~6,000 запросов/месяц → **Free план достаточно**

### Мониторинг использования API

В логах backend смотрите на вызовы `getGeolocation()`:

```bash
# Успешный запрос
✅ IP geolocation: 8.8.8.8 -> US, Mountain View

# Из кэша (запроса не было)
# (логов нет - возврат из кэша)

# Ошибка API
⚠️  IP geolocation failed for 1.2.3.4: Invalid IP
```

### SQL запрос для подсчета уникальных IP

```sql
SELECT COUNT(DISTINCT ip_address) as unique_ips
FROM login_logs
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## Тестирование

### Тест 1: Локальный IP (должен вернуть null)

```bash
curl -X POST http://localhost:54112/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

**Результат в login_logs:**
- `ip_address`: `::ffff:127.0.0.1`
- `country`: `null`
- `city`: `null`

### Тест 2: Внешний IP США (Google DNS)

```bash
curl -X POST http://localhost:54112/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 8.8.8.8" \
  -d '{"email":"test@example.com","password":"yourpassword"}'
```

**Результат:**
- `ip_address`: `8.8.8.8`
- `country`: `US`
- `city`: `Mountain View` (или другой город Google)

### Тест 3: Российский IP (Яндекс DNS)

```bash
curl -X POST http://localhost:54112/api/auth/login \
  -H "X-Forwarded-For: 77.88.8.8" \
  ...
```

**Результат:**
- `country`: `RU`
- `city`: `Moscow`

### Тест 4: Проверка кэша

Сделайте 2 запроса подряд с одним IP - второй должен быть мгновенным (из кэша).

---

## SQL запросы для аналитики

### География входов за месяц

```sql
SELECT
  country,
  city,
  COUNT(*) as logins
FROM login_logs
WHERE created_at > NOW() - INTERVAL '30 days'
  AND login_status = 'success'
  AND country IS NOT NULL
GROUP BY country, city
ORDER BY logins DESC;
```

### Топ стран по неудачным попыткам входа

```sql
SELECT
  country,
  COUNT(*) as failed_attempts
FROM login_logs
WHERE login_status = 'failed'
  AND country IS NOT NULL
GROUP BY country
ORDER BY failed_attempts DESC
LIMIT 10;
```

### Подозрительная активность (входы из разных стран)

```sql
SELECT
  email,
  COUNT(DISTINCT country) as countries_count,
  array_agg(DISTINCT country) as countries
FROM login_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY email
HAVING COUNT(DISTINCT country) > 3
ORDER BY countries_count DESC;
```

---

## Автоматическая очистка логов

### Настройка автоматической очистки (pg_cron)

В [schema.sql](supabase/schema.sql) уже настроена автоматическая очистка логов старше 30 дней с помощью **pg_cron** (расширение PostgreSQL для планировщика задач).

### Как это работает:

1. **Функция очистки** - удаляет записи старше 30 дней:
```sql
CREATE FUNCTION cleanup_old_login_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM login_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

2. **Cron задача** - запускается каждый день в 2:00 AM:
```sql
SELECT cron.schedule(
  'cleanup-old-login-logs',
  '0 2 * * *',  -- Каждый день в 2:00
  'SELECT cleanup_old_login_logs();'
);
```

### Проверка статуса задачи

```sql
-- Просмотр всех cron задач
SELECT * FROM cron.job;

-- История запусков (последние 10)
SELECT *
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job
  WHERE jobname = 'cleanup-old-login-logs'
)
ORDER BY start_time DESC
LIMIT 10;
```

### Ручная очистка

Если нужно запустить очистку вручную:

```sql
SELECT cleanup_old_login_logs();
```

### Изменение периода хранения

Чтобы хранить логи дольше (например, 90 дней):

```sql
-- Обновляем функцию
CREATE OR REPLACE FUNCTION cleanup_old_login_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM login_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
```

### Важно для Supabase:

- **pg_cron** доступен только на **платных планах** Supabase (Pro и выше)
- Для **бесплатного плана** используйте альтернативу (см. ниже)

### Альтернатива для бесплатного плана Supabase

Если у вас бесплатный план, используйте **GitHub Actions** или **Node.js cron**:

#### Вариант 1: GitHub Actions (рекомендуется)

Создайте файл `.github/workflows/cleanup-logs.yml`:

```yaml
name: Cleanup Old Logs

on:
  schedule:
    - cron: '0 2 * * *'  # Каждый день в 2:00 AM UTC
  workflow_dispatch:  # Можно запустить вручную

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup old login logs
        run: |
          curl -X POST '${{ secrets.SUPABASE_URL }}/rest/v1/rpc/cleanup_old_login_logs' \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"
```

#### Вариант 2: Node.js cron (в backend)

Установите `node-cron`:

```bash
npm install node-cron
```

Создайте `src/jobs/cleanupLogs.ts`:

```typescript
import cron from 'node-cron';
import { supabase } from '../config/supabase';

// Каждый день в 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running cleanup job for old login logs...');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error } = await supabase
    .from('login_logs')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('Error cleaning up logs:', error);
  } else {
    console.log('Old login logs cleaned up successfully');
  }
});
```

Импортируйте в `src/index.ts`:

```typescript
import './jobs/cleanupLogs';
```

#### Вариант 3: Supabase Edge Function

Создайте Edge Function для вызова через webhook:

```typescript
// supabase/functions/cleanup-logs/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error } = await supabase
    .from('login_logs')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
});
```

Затем используйте бесплатный сервис cron (например, cron-job.org) для вызова этой функции.

---

## Troubleshooting

### Ошибка: "Geolocation API error: timeout"

**Причина**: ipwho.is не ответил за 3 секунды
**Решение**: Увеличьте таймаут в `geoip.ts`:

```typescript
timeout: 5000, // 5 секунд
```

### country/city всегда null

**Причина 1**: Локальный IP (127.0.0.1, 192.168.x.x)
**Решение**: Тестируйте с заголовком `X-Forwarded-For`

**Причина 2**: API недоступен
**Решение**: Проверьте https://ipwho.is/ в браузере

### Превышен лимит 10,000/месяц

**Решение 1**: Увеличьте TTL кэша с 24 часов до 7 дней
**Решение 2**: Купите Pro план ($10/месяц)
**Решение 3**: Переключитесь на MaxMind GeoLite2 (офлайн база)

---

## Альтернативы

Если ipwho.is не подходит:

1. **ip-api.com** - 45 запросов/минуту бесплатно
2. **ipapi.co** - 30,000/месяц бесплатно
3. **MaxMind GeoLite2** - офлайн база, неограниченно, но требует регистрации
4. **ipinfo.io** - 50,000/месяц бесплатно

---

## Структура таблицы login_logs

```sql
CREATE TABLE login_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  login_status login_status NOT NULL,
  failure_reason TEXT,

  -- IP и геолокация
  ip_address TEXT,
  country TEXT,
  city TEXT,
  isp TEXT,  -- Провайдер (e.g., "Google LLC", "Rostelecom")

  -- Устройство
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Заключение

ipwho.is - простое и надежное решение для геолокации в вашем проекте:

- Работает сразу после установки (без регистрации)
- Достаточная точность для большинства задач
- Кэширование снижает нагрузку на API
- Бесплатный лимит достаточен для малых/средних проектов

Если нужна **максимальная точность** или **офлайн работа** - используйте MaxMind GeoLite2 (требует регистрации и скачивания базы данных).
