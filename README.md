# Library Management System

A production-ready REST API for managing a library — books, members, borrowing, and returning — with JWT-based authentication and role-based access control (RBAC).

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (`jsonwebtoken`), passwords hashed with `bcryptjs`
- **Validation**: `express-validator`
- **Docs**: Swagger UI (`swagger-jsdoc` + `swagger-ui-express`)
- **Rate Limiting**: `express-rate-limit`

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library-management-system
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### 3. Run the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000`.  
Swagger UI is available at `http://localhost:5000/api/docs`.

## Project Structure

```
library-management-system/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register / login
│   ├── bookController.js      # Book CRUD + borrow/return
│   └── memberController.js    # Member management
├── middleware/
│   ├── asyncHandler.js        # Async error wrapper
│   ├── authMiddleware.js      # JWT verification
│   ├── errorMiddleware.js     # Global error handler
│   └── roleMiddleware.js      # RBAC authorize factory
├── models/
│   ├── Book.js
│   ├── Borrow.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   └── memberRoutes.js
├── validators/
│   ├── authValidator.js
│   └── bookValidator.js
├── utils/
│   └── generateToken.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## API Reference

### Authentication

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Public | Register as member |
| POST | `/api/auth/login` | Public | Login, get JWT |

> Rate limited: 10 requests per 15 minutes per IP.

### Books

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/books` | Any auth | List books (pagination + search + category) |
| POST | `/api/books` | Librarian | Create book |
| GET | `/api/books/:id` | Any auth | Get book by ID |
| PUT | `/api/books/:id` | Librarian | Update book |
| DELETE | `/api/books/:id` | Librarian | Delete book |

**Query parameters for `GET /api/books`:**

| Param | Description | Example |
|-------|-------------|---------|
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Items per page (default: 10) | `?limit=5` |
| `search` | Search title or author | `?search=tolkien` |
| `category` | Filter by category | `?category=Fiction` |

### Borrow & Return

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/books/:id/borrow` | Member | Borrow a book |
| POST | `/api/books/:id/return` | Member | Return a book |
| GET | `/api/members/me/books` | Member | My active borrows |

### Members

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/members` | Librarian | List all members |
| GET | `/api/members/stats` | Librarian | Member + borrow stats |
| DELETE | `/api/members/:id` | Librarian | Delete a member |

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Roles

| Role | Description |
|------|-------------|
| `member` | Can borrow/return books, view own borrows |
| `librarian` | Full book CRUD, member management |

> Registration always creates a `member` account. Assign `librarian` role directly in MongoDB if needed.

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 400 | Validation failed / bad input |
| 401 | Missing or invalid token |
| 403 | Insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already borrowed, active borrows block deletion) |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |
