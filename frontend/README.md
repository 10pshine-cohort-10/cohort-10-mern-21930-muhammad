# Notes App Frontend

Single-page application built with React 19, Vite, and TipTap rich text editor.

## Setup

```bash
cd frontend
npm install
npm run dev
```

The application runs on `http://localhost:5173`.

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:3000/api` |

## Available Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Starts Vite local development server on port 5173 |
| `npm run build` | Builds optimized production static bundle in `dist/` |
| `npm run preview` | Previews production build locally |
| `npm test` | Runs Jest unit test suites |
| `npm run test:watch` | Runs Jest in interactive watch mode |
| `npm run test:coverage` | Generates test coverage report |

## Application Structure

- `src/components/Layout.jsx`: Responsive layout shell with sidebar, navigation, user avatar, and topbar.
- `src/components/NoteCard.jsx`: Note display card with pin indicator, color theme, and delete confirmation.
- `src/components/NoteEditor.jsx`: TipTap headless rich text editor drawer with toolbar, color picker, and tag input.
- `src/components/SearchBar.jsx`: Search input with clear button.
- `src/components/ProtectedRoute.jsx`: Authentication gate that redirects unauthenticated users to `/login`.
- `src/context/AuthContext.jsx`: Authentication context managing tokens and user sessions.
- `src/hooks/useNotes.js`: Custom hook encapsulating note CRUD, search, export/import, and Socket.IO real-time synchronization.
- `src/pages/LoginPage.jsx`: Sign-in screen with validation.
- `src/pages/RegisterPage.jsx`: Registration screen with validation.
- `src/pages/DashboardPage.jsx`: Workspace dashboard with responsive note grid and filter tabs.
- `src/pages/ProfilePage.jsx`: User profile screen with note metrics and session logout.
