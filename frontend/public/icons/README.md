# PWA Icons

Эта папка должна содержать иконки приложения для PWA.

## Необходимые иконки:

### Стандартные иконки (any):
- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px) - для Apple Touch Icon
- `icon-192x192.png` (192x192px) - минимум для Android
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px) - для splash screen

### Maskable иконки (для Android adaptive icons):
- `icon-192x192-maskable.png` (192x192px)
- `icon-512x512-maskable.png` (512x512px)

## Как создать иконки:

### Вариант 1: Онлайн генераторы
1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
2. **RealFaviconGenerator**: https://realfavicongenerator.net/
3. **Favicon.io**: https://favicon.io/

### Вариант 2: Вручную
1. Создайте квадратное изображение 512x512px с вашим логотипом
2. Для maskable иконок - добавьте отступы 80px со всех сторон (safe zone)
3. Используйте Photoshop/Figma/ImageMagick для создания всех размеров

### Требования к maskable иконкам:
- Важный контент должен быть в центральном круге (диаметр 66% от размера)
- Safe zone: 80px отступ от краев для иконки 512x512px
- Фон должен полностью заполнять квадрат

## Проверка PWA:

После добавления иконок проверьте в Chrome DevTools:
1. Откройте DevTools (F12)
2. Вкладка "Application" > "Manifest"
3. Проверьте что все иконки загружаются

## Текущий статус:

⚠️ **Иконки не созданы** - добавьте PNG файлы в эту папку
