# Notes App (MERN Stack)

Full-stack note-taking application built with Node.js, Express, MongoDB (Mongoose), React 19, and Vite. Features user authentication with JWT, note pinning, categorization tags, color themes, real-time synchronization with Socket.IO, structured application logging with Pino, and automated testing via Mocha/Chai and Jest.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | Node.js (v24), Express (v5), MongoDB / Mongoose (v9), Socket.IO, bcryptjs, jsonwebtoken |
| Frontend | React (v19), Vite (v8), TipTap Rich Text Editor, React Router (v7), Axios, Lucide Icons |
| Logging | Pino, Pino-HTTP, Pino-Pretty |
| Backend Testing | Mocha, Chai, Supertest, c8 (coverage), mongodb-memory-server |
| Frontend Testing | Jest, React Testing Library, jest-environment-jsdom |
| Code Quality | SonarQube Scanner |

## Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB Atlas connection
│   │   ├── controllers/     # Request handlers (auth, notes, users)
│   │   ├── middleware/      # Auth, error handling, Pino request logging
│   │   ├── models/          # Mongoose schemas (User, Note)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic and database operations
│   │   ├── socket/          # Socket.IO real-time event handlers
│   │   └── utils/           # Shared Pino logger instance
│   └── test/                # Mocha unit and integration test suites
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with interceptors
│   │   ├── components/      # UI components (Layout, NoteCard, NoteEditor, SearchBar)
│   │   ├── context/         # AuthContext state provider
│   │   ├── hooks/           # useNotes and useAuth hooks
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage, ProfilePage
│   │   └── styles/          # Eye-soothing global styles and CSS modules
│   └── __tests__/           # Jest unit test suites
├── sonar-project.properties # SonarQube configuration
└── package.json             # Root workspace orchestrator
```

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- MongoDB Atlas cluster URI (or local MongoDB daemon)

## Setup and Installation

1. Clone the repository and checkout the `develop` branch:
   ```bash
   git clone https://github.com/Awadul/cohort-10-mern-21930-muhammad.git
   cd cohort-10-mern-21930-muhammad
   git checkout develop
   ```

2. Install all dependencies across root, backend, and frontend:
   ```bash
   npm run install:all
   ```

3. Configure environment variables in `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit `backend/.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notes_app?retryWrites=true&w=majority
   JWT_SECRET=your_secure_random_64_character_secret_string
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

4. Configure environment variables in `frontend/.env` (optional, defaults to `http://localhost:3000/api`):
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

## Running the Application

### Development Mode (Both Frontend and Backend)
Runs the backend on port 3000 with nodemon and frontend on port 5173 with Vite concurrently:
```bash
npm run dev
```

### Standalone Services
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## Running Tests

Automated testing is configured for both backend and frontend. The backend tests use an isolated in-memory MongoDB server (`mongodb-memory-server`), requiring no live network connection or external database.

```bash
# Run all tests (backend Mocha + frontend Jest)
npm test

# Run backend tests only
npm run test:backend

# Run backend tests with code coverage (c8)
cd backend && npm run test:coverage

# Run frontend tests only
npm run test:frontend

# Run frontend tests with code coverage
cd frontend && npm run test:coverage
```

## SonarQube Integration

Code quality scanning is preconfigured in `sonar-project.properties`. To trigger a scan against your SonarQube instance:
```bash
cd backend
npm run sonar
```
