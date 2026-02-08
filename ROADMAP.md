# Roadmap Fuddly Supabase (Личный)

> Личное рабочее полотно. Дополняю по мере реализации.

## Текущий фокус
- [ ] Определить подход к масштабированию чатов (курсорная пагинация / summary-поля / отказ от RPC)

## Сообщения и чаты (масштабирование)
- [ ] Курсорная пагинация сообщений (backend + frontend)
  - [ ] API: `GET /conversations/:id/messages?limit&before&before_id`
  - [ ] Индекс в БД: `(conversation_id, created_at DESC, id DESC)`
  - [ ] Фронт: подгружать старые по курсору, объединять + дедуплицировать
- [ ] Summary-поля в `conversations`
  - [ ] Добавить поля: `last_message_id`, `last_message_at`, `unread_count_buyer`, `unread_count_seller`
  - [ ] Триггер на `messages` INSERT для обновления summary
  - [ ] Сброс unread при прочтении (с учетом buyer/seller)
- [ ] Заменить RPC summary на быстрый SELECT
  - [ ] Убрать RPC `get_conversation_summaries`
  - [ ] Обновить backend-контроллер под summary-поля

## Безопасность и авторизация
- [ ] Перевести сокеты на user-scoped supabase client (anon + JWT)
- [ ] Перепроверить RLS после изменения сокетов

## Согласованность данных
- [ ] Сверить типы: БД ↔ backend ↔ frontend

## Производительность
- [ ] Проверить планы запросов conversations/messages
- [ ] Добавить кеширование списка чатов при необходимости

## Заметки
- Приоритеты (из обсуждения):
  - Сначала курсорная пагинация
  - Затем summary-поля + триггеры
  - Потом убрать RPC


