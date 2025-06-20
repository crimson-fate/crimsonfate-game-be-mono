# Game Backend Monorepo

A comprehensive backend system for a blockchain-based game, built with NestJS and organized as a monorepo using Yarn workspaces.

## 🎮 Project Overview

This monorepo contains a complete backend infrastructure for a blockchain game, featuring:

- **API Service**: Core game logic, player management, and blockchain integration
- **AI Service**: Intelligent game agents and chat functionality
- **Shared Package**: Common utilities, models, and configurations
- **Web3 Package**: Blockchain integration utilities

## 🏗️ Architecture

```
game_be_mono/
├── packages/
│   ├── api-service/          # Main game API service
│   ├── ai-service/           # AI agents and chat service
│   ├── shared/               # Shared utilities and models
│   └── web3/                 # Web3 integration utilities
├── docker-compose.yml        # Docker orchestration
├── Dockerfile               # Multi-stage Docker build
└── package.json             # Root workspace configuration
```

## 🚀 Features

### API Service
- **Player Management**: Authentication, profiles, and wallet integration
- **Game Mechanics**: Heroes, equipment, inventory, and resources
- **Dungeon System**: Wave-based challenges and progress tracking
- **Shop System**: In-game marketplace and transactions
- **Zone Management**: Game areas and rewards
- **Data Management**: Equipment, heroes, and game data

### AI Service
- **Intelligent Agents**: AI-powered game assistants
- **Chat System**: Player-AI interaction with history
- **Feedback System**: Player feedback collection and processing
- **Rate Limiting**: API usage control and protection

### Shared Components
- **Database Models**: MongoDB schemas for all game entities
- **Authentication**: JWT-based security system
- **Validation**: Request/response validation
- **Configuration**: Environment and service configuration
- **Middleware**: Logging and request processing

### Web3 Integration
- **Blockchain Support**: StarkNet and Ethereum integration
- **Smart Contract Interaction**: Game contract communication
- **Wallet Verification**: Cryptographic signature validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Yarn** (v1.22.22 or higher)
- **Docker** and **Docker Compose**
- **MongoDB** (or use Docker)
- **Git**

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd game_be_mono
```

### 2. Install Dependencies

```bash
# Install all dependencies across all packages
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27018/game_db

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# AI Service Configuration
GROQ_API_KEY=your-groq-api-key

# Web3 Configuration
STARKNET_RPC_URL=your-starknet-rpc-url
ETHEREUM_RPC_URL=your-ethereum-rpc-url

# Service Ports
API_SERVICE_PORT=8000
AI_SERVICE_PORT=8001
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start MongoDB using Docker Compose
yarn run:redis  # If you need Redis
docker-compose up mongo -d
```

#### Option B: Local MongoDB

Install MongoDB locally and ensure it's running on port 27017.

## 🚀 Running the Application

### Development Mode

#### Run All Services with Docker

```bash
# Start all services (API, AI, MongoDB)
yarn start
```

#### Run Individual Services

```bash
# API Service only
yarn workspace api-service start:dev

# AI Service only
yarn workspace ai-service start:dev
```

### Production Mode

```bash
# Build all packages
yarn build

# Start production containers
docker-compose up --build -d
```

## 📁 Project Structure

### API Service (`packages/api-service/`)

```
src/
├── players/              # Player management
├── heroes/               # Hero system
├── equipment/            # Equipment management
├── inventory/            # Player inventory
├── dungeon/              # Dungeon challenges
├── shop/                 # In-game shop
├── zone/                 # Game zones
├── zone-reward/          # Zone rewards
├── player-resource/      # Player resources
├── player-level/         # Player progression
├── drop-resource/        # Resource drops
├── gem/                  # Gem system
└── public/               # Static files
```

### AI Service (`packages/ai-service/`)

```
src/
├── agents/               # AI agent implementations
│   ├── services/         # Agent services
│   ├── dto/              # Data transfer objects
│   └── utils/            # Utility functions
├── config/               # AI configuration
└── simple-ui/            # Simple UI components
```

### Shared Package (`packages/shared/`)

```
├── models/               # Database schemas
├── jwt/                  # Authentication
├── middleware/           # Request middleware
├── config/               # Configuration utilities
└── utils/                # Common utilities
```

## 🧪 Testing

### Run All Tests

```bash
yarn test
```

### Run Tests for Specific Package

```bash
# API Service tests
yarn workspace api-service test

# AI Service tests
yarn workspace ai-service test

# Shared package tests
yarn workspace shared test
```

### Run Tests with Coverage

```bash
yarn workspace api-service test:cov
```

## 🐳 Docker Commands

### Build and Run

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Management

```bash
# Start only API service
docker-compose up api-service -d

# Start only AI service
docker-compose up ai-service -d

# Restart specific service
docker-compose restart api-service
```

## 🔧 Development Commands

### Code Quality

```bash
# Lint all packages
yarn lint

# Format code
yarn workspace api-service format
yarn workspace ai-service format
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it game_be_mono-mongo-1 mongosh

# Backup data
docker exec game_be_mono-mongo-1 mongodump --out /data/backup
```

## 📊 API Documentation

Once the services are running, you can access:

- **API Service**: http://localhost:8000
- **AI Service**: http://localhost:8001
- **Swagger Documentation**: http://localhost:8000/api (if configured)

## 🔐 Security

- JWT-based authentication
- Rate limiting on AI service
- Input validation using class-validator
- Secure Web3 signature verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   # Kill the process or change the port in .env
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check if MongoDB is running
   docker ps | grep mongo
   # Restart MongoDB container
   docker-compose restart mongo
   ```

3. **Dependencies Issues**
   ```bash
   # Clear yarn cache
   yarn cache clean
   # Reinstall dependencies
   rm -rf node_modules packages/*/node_modules
   yarn install
   ```

### Getting Help

If you encounter any issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure all prerequisites are installed
4. Check the troubleshooting section above

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Update all dependencies
yarn upgrade

# Update specific package
yarn workspace api-service upgrade @nestjs/common
```

### Database Migrations

The project uses MongoDB with Mongoose. Schema changes are handled automatically, but you may need to run data migration scripts for major changes.

---

**Happy Gaming! 🎮**

```
yarn install
```

### Run Project through workspace
The project is divided into two workspaces, `api-service` and `ai-service`. You can run them separately or together.

```
yarn workspace api-server start:dev

