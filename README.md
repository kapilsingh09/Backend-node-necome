# Neco Anime - Backend API

A secure, scalable Node.js/Express backend for the Neco Anime platform. Provides authentication, user management, watchlist, favourites, and playlist features with JWT security and rate limiting.

![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.16.0-47A248?logo=mongodb)

## 🌟 Features

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Refresh Token System**: Automatic token rotation with HTTP-only cookies
- **Rate Limiting**: Protection against brute force and API abuse
- **Password Hashing**: bcrypt encryption for user passwords

### User Features
- **User Registration & Login**: Secure account creation and authentication
- **Watchlist Management**: Add, remove, and track anime
- **Favourites System**: Save favorite anime
- **Seen List**: Mark anime as watched
- **Custom Playlists**: Create and manage anime playlists

### API Features
- **RESTful API**: Clean, standard REST endpoints
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Configured for frontend integration
- **File Serving**: Static file serving for videos

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **MongoDB**: v6.0 or higher (local or Atlas)
- **npm**: v9 or higher

### Installation

1. **Navigate to backend directory**
   ```bash
   cd Backend-neco
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/neco-anime
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/neco-anime

   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here_change_in_production
   REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here_change_in_production

   # Token Expiry
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   # CORS
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**

   **Development** (with auto-reload):
   ```bash
   npm run dev
   ```

   **Production**:
   ```bash
   npm start
   ```

   The server will be available at `http://localhost:3000`

---

## 📦 Tech Stack

### Core
- **Express.js** 5.1.0 - Web framework
- **Mongoose** 8.16.0 - MongoDB ODM
- **Node.js** - Runtime environment

### Security
- **jsonwebtoken** 9.0.2 - JWT implementation
- **bcrypt** 6.0.0 - Password hashing
- **express-rate-limit** - API rate limiting
- **cookie-parser** 1.4.7 - Cookie parsing
- **cors** 2.8.5 - CORS middleware

### Additional
- **dotenv** 16.6.1 - Environment variables
- **axios** 1.10.0 - HTTP client
- **node-cache** 5.1.2 - In-memory caching

---

## 📁 Project Structure

```
Backend-neco/
├── controllers/                 # Request handlers
│   ├── auth.controller.js       # Authentication logic
│   ├── watchlist.controller.js  # Watchlist management
│   ├── favourites.controller.js # Favourites management
│   ├── createanimeplaylist.controller.js # Playlist management
│   └── anime.controller.js      # Anime data operations
├── models/                      # Database models
│   ├── user.model.js           # User schema
│   ├── watchlist.model.js      # Watchlist schema
│   ├── favourites.model.js     # Favourites schema
│   └── playlist.model.js       # Playlist schema
├── routes/                      # API routes
│   ├── auth.routes.js          # Auth endpoints
│   ├── watchlist.routes.js     # Watchlist endpoints
│   ├── favourites.routes.js    # Favourites endpoints
│   ├── createanimeplaylist.routes.js # Playlist endpoints
│   └── anime.routes.js         # Anime endpoints
├── middlewares/                 # Custom middlewares
│   └── auth.middlewares.js     # JWT verification
├── utils/                       # Utility functions
│   ├── ApiError.js             # Custom error class
│   ├── ApiResponse.js          # Response formatter
│   └── asyncHandler.js         # Async error wrapper
├── db/                         # Database connection
│   └── index.js                # MongoDB connection
├── config/                     # Configuration files
├── app.js                      # Express app setup
├── server.js                   # Server entry point
├── .env.example                # Environment template
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🔐 Authentication System

### JWT Token Flow

```
┌─────────┐                  ┌─────────┐
│         │   1. Login       │         │
│ Client  ├─────────────────►│ Server  │
│         │                  │         │
│         │◄─────────────────┤         │
│         │   Access Token + │         │
│         │   Refresh Token  │         │
└─────────┘   (HTTP-only)    └─────────┘

┌─────────┐                  ┌─────────┐
│         │   2. API Request │         │
│ Client  ├─────────────────►│ Server  │
│         │   + Access Token │         │
│         │◄─────────────────┤         │
│         │   Response       │         │
└─────────┘                  └─────────┘

┌─────────┐                  ┌─────────┐
│         │   3. Token       │         │
│ Client  │      Expired     │ Server  │
│         ├─────────────────►│         │
│         │                  │ 401 Error
│         │◄─────────────────┤         │
└─────────┘                  └─────────┘

┌─────────┐                  ┌─────────┐
│         │   4. Refresh     │         │
│ Client  ├─────────────────►│ Server  │
│         │   Token (cookie) │         │
│         │◄─────────────────┤         │
│         │   New Tokens     │         │
└─────────┘                  └─────────┘
```

### Token Details

**Access Token**:
- Lifespan: 15 minutes (configurable)
- Storage: Client memory (not localStorage)
- Contains: User ID, email
- Use: Sent with every API request

**Refresh Token**:
- Lifespan: 7 days (configurable)
- Storage: HTTP-only cookie
- Contains: User ID only
- Use: Refresh expired access tokens
- Security: Rotated on every refresh

---

## 🛠️ API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌* |
| POST | `/api/auth/logout` | Logout user | ✅ |

*Uses HTTP-only cookie

### Watchlist

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/watchlist` | Get user's watchlist | ✅ |
| POST | `/api/watchlist/add` | Add anime to watchlist | ✅ |
| DELETE | `/api/watchlist/remove/:id` | Remove from watchlist | ✅ |
| GET | `/api/watchlist/check/:id` | Check if in watchlist | ✅ |
| POST | `/api/watchlist/seen/:id` | Mark as seen | ✅ |
| GET | `/api/watchlist/seen` | Get seen anime | ✅ |

### Favourites

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/favourites` | Get user's favourites | ✅ |
| POST | `/api/favourites/add` | Add to favourites | ✅ |
| DELETE | `/api/favourites/remove/:id` | Remove from favourites | ✅ |
| GET | `/api/favourites/check/:id` | Check if in favourites | ✅ |

### Playlists

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/playlist/playlists` | Get all playlists | ✅ |
| POST | `/api/playlist/playlists` | Create playlist | ✅ |
| GET | `/api/playlist/playlists/:id` | Get playlist by ID | ✅ |
| POST | `/api/playlist/playlists/:id/add-anime` | Add anime to playlist | ✅ |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health status | ❌ |

---

## 📝 Request/Response Examples

### Register User

**Request**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "message": "User registered successfully"
}
```

### Login

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123",
  "rememberMe": true
}
```

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in Successfully",
  "success": true
}
```

*Refresh token set as HTTP-only cookie*

### Add to Watchlist

**Request**:
```http
POST /api/watchlist/add
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "animeId": "12345",
  "title": "Attack on Titan",
  "image": "https://example.com/image.jpg"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "watchlist": [
      {
        "animeId": "12345",
        "title": "Attack on Titan",
        "image": "https://example.com/image.jpg",
        "seen": false,
        "addedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Added to watchlist",
  "success": true
}
```

---

## 🔒 Security Features

### Rate Limiting

Two-tier rate limiting system:

**Auth Routes** (`/api/auth/*`):
- Limit: 5 requests per 15 minutes
- Protects: Login, Register
- Prevents: Brute force attacks

**General API Routes**:
- Limit: 100 requests per 15 minutes
- Applied to: All other endpoints
- Prevents: API abuse

**Rate Limit Response**:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again after 15 minutes"
}
```

### Password Security

- Passwords hashed using **bcrypt** (10 rounds)
- Never stored in plain text
- Never returned in API responses

### Token Security

- Access tokens expire after 15 minutes
- Refresh tokens rotate on every use
- Refresh tokens stored securely in database
- HTTP-only cookies prevent XSS attacks

### CORS Configuration

```javascript
// Configured in app.js
cors({
  origin: "http://localhost:5173", // Frontend URL
  credentials: true
})
```

---

## 🗄️ Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique, required),
  password: String (hashed, required),
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Watchlist Model

```javascript
{
  userId: ObjectId (ref: User),
  animeId: String (required),
  title: String,
  image: String,
  seen: Boolean (default: false),
  addedAt: Date
}
```

### Favourites Model

```javascript
{
  userId: ObjectId (ref: User),
  animeId: String (required),
  title: String,
  image: String,
  addedAt: Date
}
```

---

## 🛠️ Available Scripts

```bash
# Development (with nodemon auto-reload)
npm run dev

# Production
npm start

# Run tests (if configured)
npm test
```

---

## 🔧 Configuration

### Environment Variables

All configuration via `.env` file:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/neco-anime
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_secret_here

# Optional (with defaults)
PORT=3000
NODE_ENV=development
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

### CORS Configuration

Edit `app.js` to change allowed origins:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
```

### Rate Limit Configuration

Edit `app.js` to adjust limits:

```javascript
// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Time window
  max: 100,                   // Max requests
});

// Auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
```

---

## 🐛 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "errors": []
}
```

### Common Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Database connection failed |

---

## 🧪 Testing

### Manual Testing with cURL

**Register**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Protected Route**:
```bash
curl -X GET http://localhost:3000/api/watchlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -b cookies.txt
```

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 12345.67
}
```

### Request Logging

All requests logged to console in development mode:
```
POST /api/auth/login - 200 - 45ms
GET /api/watchlist - 200 - 12ms
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong, unique secrets for JWT
- [ ] Configure MongoDB Atlas or production database
- [ ] Set up proper CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Review rate limits for production traffic

### Recommended Hosting

- **Backend**: Heroku, Railway, Render, or AWS
- **Database**: MongoDB Atlas (free tier available)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/api-improvement`
3. Commit your changes: `git commit -m 'Add new endpoint'`
4. Push to the branch: `git push origin feature/api-improvement`
5. Open a Pull Request

### Code Style

- Use ESM imports (not CommonJS)
- Follow async/await pattern (avoid callbacks)
- Use asyncHandler for async route handlers
- Return ApiResponse objects for consistency
- Add JSDoc comments for complex functions

---

## 🐞 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
mongosh

# Connection string format
mongodb://localhost:27017/neco-anime
```

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in .env
PORT=3001
```

### CORS Errors

- Ensure frontend URL matches `CORS_ORIGIN` in `.env`
- Check `credentials: true` is set in both backend and frontend

---

## 📄 License

This project is private and not licensed for public use.

---

## 👥 Authors

- **Karan** - Backend development

---

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication standard
- **bcrypt** - Password hashing

---

**Happy Coding! 🚀**
