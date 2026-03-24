.PHONY: help install dev build test lint clean db-migrate db-seed db-reset docker-up docker-down docker-dev

help:
	@echo "EKAI Development Commands"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install              Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev                  Start development servers (server + client)"
	@echo "  make dev-server           Start only backend server"
	@echo "  make dev-client           Start only frontend client"
	@echo ""
	@echo "Building & Testing:"
	@echo "  make build                Build for production"
	@echo "  make test                 Run tests"
	@echo "  make lint                 Run linting"
	@echo "  make type-check           Run TypeScript type checking"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate           Run database migrations"
	@echo "  make db-seed              Seed database with initial data"
	@echo "  make db-reset             Reset database (migrate + seed)"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up            Start production Docker environment"
	@echo "  make docker-down          Stop all Docker containers"
	@echo "  make docker-dev           Start development Docker environment with hot reload"
	@echo "  make docker-logs          View Docker container logs"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean                Clean build artifacts and dependencies"

# Setup & Installation
install:
	npm install

# Development
dev:
	npm run dev

dev-server:
	npm run dev:server

dev-client:
	npm run dev:client

# Building & Testing
build:
	npm run build

test:
	npm run test

lint:
	npm run lint

type-check:
	npm run type-check

# Database
db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

db-reset:
	npm run db:reset

# Docker
docker-up:
	docker-compose up -d
	@echo "Services are starting..."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"

docker-down:
	docker-compose down

docker-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

docker-logs:
	docker-compose logs -f

# Cleanup
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf build
	rm -rf coverage
	cd server && rm -rf node_modules dist && cd ..
	cd client && rm -rf node_modules dist && cd ..
	@echo "Cleaned all artifacts and dependencies"

.DEFAULT_GOAL := help
