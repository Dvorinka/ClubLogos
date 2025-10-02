.PHONY: help install dev build docker-build docker-up docker-down clean

help: ## Show this help message
	@echo "🇨🇿 Czech Clubs Logos API - Available Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "📦 Installing backend dependencies..."
	cd backend && go mod download
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ All dependencies installed!"

dev-backend: ## Run backend in development mode
	@echo "🚀 Starting backend..."
	cd backend && go run .

dev-frontend: ## Run frontend in development mode
	@echo "🎨 Starting frontend..."
	cd frontend && npm run dev

build-backend: ## Build backend binary
	@echo "🔨 Building backend..."
	cd backend && go build -o main .
	@echo "✓ Backend built successfully!"

build-frontend: ## Build frontend for production
	@echo "🔨 Building frontend..."
	cd frontend && npm run build
	@echo "✓ Frontend built successfully!"

build: build-backend build-frontend ## Build both backend and frontend

docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	docker-compose build
	@echo "✓ Docker images built!"

docker-up: ## Start services with Docker Compose
	@echo "🐳 Starting services..."
	docker-compose up -d
	@echo "✓ Services started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend: http://localhost:8080"

docker-down: ## Stop Docker services
	@echo "🛑 Stopping services..."
	docker-compose down
	@echo "✓ Services stopped!"

docker-logs: ## View Docker logs
	docker-compose logs -f

clean: ## Clean build artifacts and data
	@echo "🧹 Cleaning..."
	rm -rf backend/main backend/*.db backend/logos
	rm -rf frontend/dist frontend/node_modules
	rm -rf data
	@echo "✓ Cleaned!"

test-backend: ## Run backend tests
	@echo "🧪 Running backend tests..."
	cd backend && go test ./...

lint-backend: ## Lint backend code
	@echo "🔍 Linting backend..."
	cd backend && golangci-lint run

lint-frontend: ## Lint frontend code
	@echo "🔍 Linting frontend..."
	cd frontend && npm run lint

.DEFAULT_GOAL := help
