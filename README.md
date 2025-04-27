# Language Learning Application

A full-stack language learning application built with Angular, Ionic, and Node.js, featuring AI-powered language assistance and real-time communication.

# Video Demo
https://youtu.be/FNQoWFQq1Kw

## Project Structure

The project consists of two main components:

1. **Frontend (language-learning-app)**: An Angular/Ionic application for the user interface
2. **Backend (language-learning-backend)**: A Node.js server with MongoDB integration, WebSocket support, and AI capabilities

## Features

- Modern, responsive UI built with Angular and Ionic
- MongoDB database for data persistence
- RESTful API backend
- User authentication and authorization
- Language learning exercises and content management
- Real-time communication using WebSockets
- AI-powered language assistance using Google's Gemini AI
- Interactive language practice sessions
- WebSocket-based chat functionality
- Real-time updates for language exercises
- Live feedback system
- Contextual learning support
- Natural language processing capabilities
- Interactive vocabulary game with:
  - Flashcard-based learning system
  - Multiple language support (French, Spanish, German, Italian, Japanese, Korean, Chinese, Russian, Portuguese, Arabic)
  - Streak tracking and daily goals
  - AI-generated vocabulary cards with examples and categories
  - Progress tracking and statistics
  - Celebration animations for achievements
  - Spaced repetition system
  - Example sentences and word categories

## Tech Stack

### Frontend
- Angular 8+
- Ionic Framework
- TypeScript
- Angular Material
- WebSocket client integration

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- Socket.IO for real-time communication
- Google Gemini AI integration
- WebSocket server implementation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Angular CLI
- Ionic CLI
- Google Gemini AI API key (for AI features)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/CianMartyn/language-learning-app

```

2. Install frontend dependencies:
```bash
cd language-learning-app
npm install
```

3. Install backend dependencies:
```bash
cd ../language-learning-backend
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```

## Running the Application

### Frontend
```bash
cd language-learning-app
ionic serve
```

### Backend
```bash
cd language-learning-backend
node server.js
```

The frontend will be available at `http://localhost:8100` and the backend at `http://localhost:5000`.

## Development

- Frontend development: `cd language-learning-app`
- Backend development: `cd language-learning-backend`

## Project Structure

### Frontend
```
language-learning-app/
├── src/              # Source files
├── .angular/         # Angular configuration
├── .vscode/          # VS Code settings
└── ...config files
```

### Backend
```
language-learning-backend/
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── server.js        # Main server file (includes WebSocket and AI integration)
└── db.js            # Database connection
```