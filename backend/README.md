# Notes App Backend

Express 5 REST API and WebSocket service using MongoDB (Mongoose), Pino logging, and JWT authentication.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `LOG_LEVEL` | Pino logging level (`debug`, `info`, `warn`, `error`) | `info` |
| `MONGODB_URI` | MongoDB Atlas or local connection string | *Required* |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | *Required* |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CLIENT_URL` | Allowed origin for CORS and Socket.IO | `http://localhost:5173` |

## API Endpoints

### Authentication & Users

#### POST `/api/auth/register`
- **Request Body:** `{ "name": "string", "email": "string", "password": "string (min 8)" }`
- **Response Body:** `{ "success": true, "data": { "token": "string", "user": { "id": "string", "name": "string", "email": "string" } } }`
- **Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict`, `500 Server Error`

#### POST `/api/auth/login`
- **Request Body:** `{ "email": "string", "password": "string" }`
- **Response Body:** `{ "success": true, "data": { "token": "string", "user": { "id": "string", "name": "string", "email": "string" } } }`
- **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`, `500 Server Error`

#### GET `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response Body:** `{ "success": true, "data": { "id": "string", "name": "string", "email": "string", "createdAt": "string" } }`
- **Status Codes:** `200 OK`, `401 Unauthorized`, `404 Not Found`

### Notes Management

All `/api/notes` routes require `Authorization: Bearer <token>`.

#### GET `/api/notes`
- **Query Parameters:** `?tag=string` (optional filter)
- **Response Body:** `{ "success": true, "data": [ { "id": "string", "title": "string", "content": "string", "isPinned": boolean, "tags": string[], "color": "string", "createdAt": "string", "updatedAt": "string" } ] }`
- **Status Codes:** `200 OK`, `401 Unauthorized`

#### POST `/api/notes`
- **Request Body:** `{ "title": "string", "content": "string", "isPinned": boolean, "tags": string[], "color": "string" }`
- **Response Body:** `{ "success": true, "data": Note }`
- **Status Codes:** `201 Created`, `400 Bad Request`, `401 Unauthorized`

#### GET `/api/notes/:id`
- **Response Body:** `{ "success": true, "data": Note }`
- **Status Codes:** `200 OK`, `401 Unauthorized`, `404 Not Found`

#### PUT `/api/notes/:id`
- **Request Body:** `{ "title"?: "string", "content"?: "string", "isPinned"?: boolean, "tags"?: string[], "color"?: "string" }`
- **Response Body:** `{ "success": true, "data": Note }`
- **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

#### DELETE `/api/notes/:id`
- **Response Body:** `{ "success": true, "data": { "id": "string" } }`
- **Status Codes:** `200 OK`, `401 Unauthorized`, `404 Not Found`

#### GET `/api/notes/search`
- **Query Parameters:** `?q=string`
- **Response Body:** `{ "success": true, "data": Note[] }`
- **Status Codes:** `200 OK`, `401 Unauthorized`

#### GET `/api/notes/export`
- **Query Parameters:** `?format=json|markdown`
- **Response:** File download (`.json` or `.md`)
- **Status Codes:** `200 OK`, `401 Unauthorized`

#### POST `/api/notes/import`
- **Request Body:** `Note[]` (Array of note objects)
- **Response Body:** `{ "success": true, "data": { "count": number } }`
- **Status Codes:** `201 Created`, `400 Bad Request`, `401 Unauthorized`

## Testing

```bash
# Run Mocha test suite (uses in-memory MongoDB)
npm test

# Run tests with c8 coverage
npm run test:coverage
```
