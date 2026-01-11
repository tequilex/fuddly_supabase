# MaxMind GeoLite2 Database Setup

## Как получить базу данных:

1. **Зарегистрируйтесь** на MaxMind:
   https://www.maxmind.com/en/geolite2/signup

2. **Войдите в аккаунт** и перейдите в:
   Account → Manage License Keys → Generate new license key

3. **Скачайте базу данных**:
   - Перейдите: https://www.maxmind.com/en/accounts/current/geoip/downloads
   - Найдите: **GeoLite2 City**
   - Формат: **MMDB**
   - Скачайте архив

4. **Распакуйте файл**:
   - Извлеките файл `GeoLite2-City.mmdb`
   - Поместите его в эту папку: `backend/data/geoip/GeoLite2-City.mmdb`

## Структура:

```
backend/
  data/
    geoip/
      GeoLite2-City.mmdb  <-- Поместите файл сюда
      README.md           <-- Этот файл
```

## Обновление базы данных:

MaxMind обновляет базу каждый вторник. Рекомендуется обновлять раз в месяц:

1. Скачайте новую версию
2. Замените старый файл `GeoLite2-City.mmdb`
3. Перезапустите backend сервер

## Альтернатива: Автоматическое обновление

Можно настроить автоматическое скачивание через cron job или npm скрипт:

```bash
# Установить geoipupdate
npm install -g geoipupdate

# Настроить конфиг с вашим License Key
# Запускать еженедельно
```

## Важно:

- Файл `.mmdb` НЕ должен коммититься в git (добавлен в .gitignore)
- Размер файла: ~70MB
- Лицензия: Creative Commons Attribution-ShareAlike 4.0
