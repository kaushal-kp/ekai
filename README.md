# EKAI - APAAR-native School Operating System

<div align="center">

![EKAI Logo](https://kaushal-kp.github.io/ekai-prototype/logo.png)

**Empowering Schools with APAAR Integration**

[View Prototype](https://kaushal-kp.github.io/ekai-prototype/) | [PRD Reference](#prd-reference)

</div>

## What is EKAI?

EKAI is a modern, cloud-native School Operating System built natively on APAAR (Automated Permanent Academic Account Repository), India's unified student academic data platform. It provides schools with a comprehensive system for managing students, teachers, classes, assignments, attendance, and academic performance while maintaining seamless integration with APAAR.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Node.js + Express | 20 |
| **Frontend** | React + TypeScript + Vite | Latest |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis | 7 |
| **Authentication** | JWT + OTP | - |
| **API** | RESTful + WebSockets | - |
| **Containerization** | Docker & Docker Compose | Latest |
| **Deployment** | Docker, Kubernetes-ready | - |

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Docker** 24.x and **Docker Compose** 2.x (for containerized deployment)
- **PostgreSQL** 16+ (if running locally without Docker)
- **Redis** 7+ (if running locally without Docker)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kaushal-kp/ekai.git
cd ekai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Setup Database

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

## Docker Quick Start

### Development Environment

```bash
npm run docker:dev
```

This command:
- Builds Docker images for server and client
- Spins up PostgreSQL, Redis, server, and client containers
- Mounts volumes for hot reload
- Exposes ports for development

### Production Environment

```bash
npm run docker:up
```

To stop all containers:

```bash
npm run docker:down
```

View logs:

```bash
npm run docker:logs
```

## Project Structure

```
ekai/
├── server/                      # Backend application
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Database models
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Configuration
│   │   └── index.ts            # Entry point
│   ├── migrations/             # Database migrations
│   ├── seeds/                  # Database seeds
│   ├── tests/                  # Unit tests
│   ├── package.json
│   └── tsconfig.json
├── client/                      # Frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   ├── store/              # State management
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/                 # Static assets
│   ├── tests/                  # Component tests
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker/                      # Docker configurations
│   ├── Dockerfile.server
│   ├── Dockerfile.client
│   └── nginx.conf
├── docker-compose.yml          # Production compose file
├── docker-compose.dev.yml      # Development compose file
├── .env.example                # Environment template
├── .gitignore
├── package.json                # Root package.json
├── Makefile                    # Development shortcuts
├── README.md
└── LICENSE
```

## API Documentation

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/otp/request` | Request OTP |
| POST | `/api/auth/otp/verify` | Verify OTP |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | User logout |
| **Students** |
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get student details |
| POST | `/api/students` | Create new student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/students/:id/apaar` | Sync with APAAR |
| **Teachers** |
| GET | `/api/teachers` | List all teachers |
| GET | `/api/teachers/:id` | Get teacher details |
| POST | `/api/teachers` | Create new teacher |
| PUT | `/api/teachers/:id` | Update teacher |
| DELETE | `/api/teachers/:id` | Delete teacher |
| **Classes** |
| GET | `/api/classes` | List all classes |
| GET | `/api/classes/:id` | Get class details |
| POST | `/api/classes` | Create new class |
| PUT | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |
| **Attendance** |
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/reports` | Attendance reports |
| **Assignments** |
| GET | `/api/assignments` | List assignments |
| GET | `/api/assignments/:id` | Get assignment details |
| POST | `/api/assignments` | Create assignment |
| PUT | `/api/assignments/:id` | Update assignment |
| DELETE | `/api/assignments/:id` | Delete assignment |
| **Grades** |
| GET | `/api/grades` | List grades |
| POST | `/api/grades` | Submit grades |
| GET | `/api/grades/reports` | Grade reports |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Application environment |
| `PORT` | 5000 | Server port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `REDIS_URL` | redis://localhost:6379 | Redis connection string |
| `JWT_SECRET` | - | JWT signing secret (required in production) |
| `JWT_EXPIRY` | 7d | JWT token expiration |
| `OTP_EXPIRY_MINUTES` | 5 | OTP validity duration |
| `APAAR_API_URL` | https://api.apaar.education.gov.in/v1 | APAAR API endpoint |
| `APAAR_API_KEY` | - | APAAR API key |
| `CORS_ORIGIN` | http://localhost:3000 | CORS allowed origin |
| `VITE_API_URL` | http://localhost:5000 | Frontend API URL |

## Development

### Common Commands

```bash
# Install all dependencies
npm install

# Run development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Database operations
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:reset        # Reset database
```

### Using Makefile

```bash
make install            # Install dependencies
make dev                # Start development
make build              # Build for production
make test               # Run tests
make db-migrate         # Run migrations
make db-seed            # Seed database
make db-reset           # Reset database
make docker-up          # Start Docker containers
make docker-down        # Stop Docker containers
make docker-dev         # Start dev Docker environment
make clean              # Clean build artifacts
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows the existing style
- Tests pass: `npm test`
- Linting passes: `npm run lint`
- Types are correct: `npm run type-check`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **Prototype**: https://kaushal-kp.github.io/ekai-prototype/
- **Issues**: https://github.com/kaushal-kp/ekai/issues
- **Discussions**: https://github.com/kaushal-kp/ekai/discussions

## Support

For support, email support@ekai.local or open an issue on GitHub.

---

Made with ❤️ by [Kaushal Prajapati](https://github.com/kaushal-kp)
