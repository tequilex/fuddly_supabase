.PHONY: start stop install migrate-dev migrate-deploy prisma-studio clean

# Установка зависимостей
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Dependencies installed"

# Генерация Prisma Client
prisma-generate:
	@echo "🔧 Generating Prisma Client..."
	cd backend && npx prisma generate
	@echo "✅ Prisma Client generated"

# Миграция БД (development)
migrate-dev:
	@echo "🗄️  Running database migrations..."
	cd backend && npx prisma migrate dev
	@echo "✅ Migrations completed"

# Миграция БД (production)
migrate-deploy:
	@echo "🗄️  Deploying database migrations..."
	cd backend && npx prisma migrate deploy
	@echo "✅ Migrations deployed"

# Открыть Prisma Studio
prisma-studio:
	@echo "🎨 Opening Prisma Studio..."
	cd backend && npx prisma studio

# Запуск проекта
start:
	@echo "🚀 Starting Fuddly..."
	@if [ ! -f backend/.env ]; then \
		echo "⚠️  .env file not found! Copying from .env.example..."; \
		cp backend/.env.example backend/.env; \
		echo "⚠️  Please update backend/.env with your database credentials"; \
	fi
	@echo "Starting backend..."
	cd backend && npm run dev & \
	echo "Starting frontend..." && \
	cd frontend && npm run dev

# Остановка проекта
stop:
	@echo "🛑 Stopping Fuddly..."
	-pkill -f "tsx watch" || true
	-pkill -f "vite" || true
	@echo "✅ Fuddly stopped"

# Очистка
clean:
	@echo "🧹 Cleaning..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist
	@echo "✅ Cleaned"

# Билд production
build:
	@echo "🏗️  Building for production..."
	cd backend && npm run build
	cd frontend && npm run build
	@echo "✅ Build completed"
