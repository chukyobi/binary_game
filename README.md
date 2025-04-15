# Binary Runner

A 3D educational game that helps players learn binary number conversion while running through an immersive environment.

## Features

- 🎮 3D game environment with character movement
- 📚 Binary to decimal (and vice versa) conversion challenges
- 🏆 Progressive difficulty levels
- 💎 Gem collection system
- 👥 User authentication and profiles
- 📊 Leaderboard system
- 🎯 Achievement tracking

## Tech Stack

### Frontend
- Next.js
- React Three Fiber (3D rendering)
- Tailwind CSS (styling)
- Zustand (state management)
- Axios (API calls)

### Backend
- Node.js
- Express
- MySQL
- Prisma ORM
- JWT Authentication

## Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database credentials:
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/binary_runner"
   JWT_SECRET="your-secret-key"
   PORT=3001
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Game Mechanics

1. **Character Movement**
   - Automatic forward movement
   - Left/right controls for dodging obstacles
   - Spacebar for jumping (optional)

2. **Number Conversion**
   - Questions appear above the character
   - Answer options appear in lanes
   - Correct answers award gems
   - Progressive difficulty based on level

3. **Levels**
   - Level 1-3: 4-bit binary conversion
   - Level 4-6: 6-bit binary conversion
   - Level 7-9: 8-bit binary conversion
   - Level 10+: 10-bit binary conversion

4. **Scoring**
   - 10 gems per correct answer
   - High score tracking
   - Level completion rewards

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/user/me` - Get current user profile

### Game
- GET `/api/game/question` - Get random question
- POST `/api/game/answer` - Submit answer
- POST `/api/game/score` - Update score
- GET `/api/game/levels` - Get available levels
- GET `/api/game/assets` - Get game assets

### User
- GET `/api/user/:id` - Get user profile
- GET `/api/user/leaderboard` - Get leaderboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 