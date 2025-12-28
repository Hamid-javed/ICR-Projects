# Quiz Application Backend

A Node.js backend for a quiz application with QR code scanning and leaderboard features.

## Features

- QR Code based question access
- User registration and authentication
- Question management through CSV import
- Comprehensive leaderboard system
  - Daily rankings
  - Weekly rankings
  - Monthly rankings
  - All-time rankings
  - Custom date range rankings
- Super admin dashboard
  - User management
  - Question management
  - CSV import functionality

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Question Endpoints
- GET /api/questions/:id - Get specific question
- POST /api/questions/import - Import questions via CSV
- GET /api/questions/next - Get next question for user

### Leaderboard Endpoints
- GET /api/leaderboard/daily - Get today's leaderboard
- GET /api/leaderboard/weekly - Get weekly leaderboard
- GET /api/leaderboard/monthly - Get monthly leaderboard
- GET /api/leaderboard/all-time - Get all-time leaderboard
- GET /api/leaderboard/custom - Get custom date range leaderboard

### Admin Endpoints
- GET /api/admin/users - Get all users
- PUT /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user
- POST /api/admin/questions/import - Import questions
