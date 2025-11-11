# Backend - Anime Playlist & Watchlist API

A Node.js Express backend application for managing anime playlists, watchlists, and favorites.

## Table of Contents
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Routes & Testing](#api-routes--testing)
- [Project Structure](#project-structure)

---

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation Steps

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Backend-neco
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables** (see [Environment Variables](#environment-variables))

---

## Environment Variables

Create an `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=8000

# Database
MONGODB_URI=mongodb://localhost:27017/anime-playlist
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anime-playlist

# JWT Tokens
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRY=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

---

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8000` by default.

### Health Check
```
GET http://localhost:8000/health
```

---

## API Routes & Testing

### Base URL
```
http://localhost:8000/api
```

---

## 🔐 Authentication Routes

### 1. Register User
**POST** `/auth/register`

**Description:** Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Email already registered"
}
```

---

### 2. Login User
**POST** `/auth/login`

**Description:** Login user and receive access & refresh tokens

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "rememberMe": false
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "User logged in Successfully",
  "success": true
}
```

**Note:** Tokens are automatically set in httpOnly cookies

---

### 3. Logout User
**POST** `/auth/logout`

**Description:** Logout user and clear cookies

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged Out",
  "success": true
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 🎌 Anime Routes

### 1. Get Anime Details
**GET** `/anime/:slug`

**Description:** Get detailed information about an anime by its slug

**Example Request:**
```
GET /api/anime/attack-on-titan
```

**Success Response (200):**
```json
{
  "id": 1,
  "slug": "attack-on-titan",
  "title": "Attack on Titan",
  "description": "...",
  "episodes": 25,
  "rating": 8.5
}
```

**Error Response (404):**
```json
{
  "error": "Anime not found"
}
```

---

## 📋 Watchlist Routes

**All watchlist routes require authentication**

**Headers Required:**
```
Authorization: Bearer <accessToken>
Cookie: accessToken=<token>
```

### 1. Get User's Watchlist
**GET** `/watchlist/`

**Description:** Get all anime in user's watchlist

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "anime_id",
      "userId": "user_id",
      "animeId": "anime_id",
      "animeTitle": "Attack on Titan",
      "addedAt": "2024-11-11T10:30:00Z"
    }
  ],
  "message": "Watchlist retrieved successfully",
  "success": true
}
```

---

### 2. Add to Watchlist
**POST** `/watchlist/add`

**Description:** Add an anime to user's watchlist

**Request Body:**
```json
{
  "animeId": "anime_id",
  "animeTitle": "Attack on Titan"
}
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "watchlist_item_id",
    "userId": "user_id",
    "animeId": "anime_id",
    "animeTitle": "Attack on Titan"
  },
  "message": "Anime added to watchlist successfully",
  "success": true
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Anime already in watchlist",
  "success": false
}
```

---

### 3. Get Seen Anime
**GET** `/watchlist/seen`

**Description:** Get all anime marked as seen by user

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "anime_id",
      "animeTitle": "Death Note",
      "seenAt": "2024-11-10T15:20:00Z"
    }
  ],
  "message": "Seen anime retrieved successfully",
  "success": true
}
```

---

### 4. Toggle Seen Status
**POST** `/watchlist/seen/:animeId`

**Description:** Mark or unmark an anime as seen

**URL Parameter:**
- `animeId`: MongoDB ObjectId of the anime

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "anime_id",
    "animeTitle": "Death Note",
    "isSeen": true
  },
  "message": "Seen status updated successfully",
  "success": true
}
```

---

### 5. Check Watchlist Status
**GET** `/watchlist/check/:animeId`

**Description:** Check if an anime is in user's watchlist

**URL Parameter:**
- `animeId`: MongoDB ObjectId of the anime

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "inWatchlist": true,
    "isSeen": false
  },
  "message": "Status retrieved successfully",
  "success": true
}
```

---

### 6. Remove from Watchlist
**DELETE** `/watchlist/remove/:animeId`

**Description:** Remove an anime from user's watchlist

**URL Parameter:**
- `animeId`: MongoDB ObjectId of the anime

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Anime removed from watchlist successfully",
  "success": true
}
```

---

## ❤️ Favourites Routes

**All favourites routes require authentication**

**Headers Required:**
```
Authorization: Bearer <accessToken>
Cookie: accessToken=<token>
```

### 1. Get User's Favourites
**GET** `/favourites/`

**Description:** Get all anime in user's favorites

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "favourite_id",
      "userId": "user_id",
      "animeId": "anime_id",
      "animeTitle": "Death Note",
      "addedAt": "2024-11-09T14:30:00Z"
    }
  ],
  "message": "Favourites retrieved successfully",
  "success": true
}
```

---

### 2. Add to Favourites
**POST** `/favourites/add`

**Description:** Add an anime to user's favorites

**Request Body:**
```json
{
  "animeId": "anime_id",
  "animeTitle": "Death Note"
}
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "favourite_id",
    "userId": "user_id",
    "animeId": "anime_id",
    "animeTitle": "Death Note"
  },
  "message": "Anime added to favourites successfully",
  "success": true
}
```

---

### 3. Check Favourite Status
**GET** `/favourites/check/:animeId`

**Description:** Check if an anime is in user's favorites

**URL Parameter:**
- `animeId`: MongoDB ObjectId of the anime

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "isFavourite": true
  },
  "message": "Status retrieved successfully",
  "success": true
}
```

---

### 4. Remove from Favourites
**DELETE** `/favourites/remove/:animeId`

**Description:** Remove an anime from user's favorites

**URL Parameter:**
- `animeId`: MongoDB ObjectId of the anime

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Anime removed from favourites successfully",
  "success": true
}
```

---

## 📺 Anime Playlist Routes

**All playlist routes require authentication**

**Headers Required:**
```
Authorization: Bearer <accessToken>
Cookie: accessToken=<token>
```

### 1. Create Playlist
**POST** `/playlist/playlists`

**Description:** Create a new anime playlist

**Request Body:**
```json
{
  "title": "My Favorite Anime",
  "description": "Collection of anime I love"
}
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "playlist_id",
    "userId": "user_id",
    "title": "My Favorite Anime",
    "description": "Collection of anime I love",
    "animes": [],
    "createdAt": "2024-11-11T10:00:00Z",
    "updatedAt": "2024-11-11T10:00:00Z"
  },
  "message": "Playlist created successfully",
  "success": true
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Playlist title is required",
  "success": false
}
```

---

### 2. Get All Playlists
**GET** `/playlist/playlists`

**Description:** Get all playlists for the authenticated user

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "playlist_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "title": "My Favorite Anime",
      "description": "Collection of anime I love",
      "animes": ["Attack on Titan", "Death Note"],
      "createdAt": "2024-11-11T10:00:00Z",
      "updatedAt": "2024-11-11T10:30:00Z"
    }
  ],
  "message": "Playlists retrieved successfully",
  "success": true
}
```

---

### 3. Get Specific Playlist
**GET** `/playlist/playlists/:id`

**Description:** Get a specific playlist by ID with all animes

**URL Parameter:**
- `id`: MongoDB ObjectId of the playlist

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "playlist_id",
    "userId": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "title": "My Favorite Anime",
    "description": "Collection of anime I love",
    "animes": [
      "Attack on Titan",
      "Death Note",
      "Jujutsu Kaisen"
    ],
    "createdAt": "2024-11-11T10:00:00Z",
    "updatedAt": "2024-11-11T10:45:00Z"
  },
  "message": "Playlist retrieved successfully",
  "success": true
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Playlist not found",
  "success": false
}
```

**Error Response (403):**
```json
{
  "statusCode": 403,
  "message": "You are not authorized to access this playlist",
  "success": false
}
```

---

### 4. Add Anime to Playlist
**POST** `/playlist/playlists/:id/add-anime`

**Description:** Add an anime to a specific playlist

**URL Parameter:**
- `id`: MongoDB ObjectId of the playlist

**Request Body:**
```json
{
  "animeTitle": "Jujutsu Kaisen"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "playlist_id",
    "userId": "user_id",
    "title": "My Favorite Anime",
    "description": "Collection of anime I love",
    "animes": [
      "Attack on Titan",
      "Death Note",
      "Jujutsu Kaisen"
    ],
    "createdAt": "2024-11-11T10:00:00Z",
    "updatedAt": "2024-11-11T10:50:00Z"
  },
  "message": "Anime added to playlist successfully",
  "success": true
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Anime is already in this playlist",
  "success": false
}
```

**Error Response (403):**
```json
{
  "statusCode": 403,
  "message": "You are not authorized to modify this playlist",
  "success": false
}
```

---

## 🧪 Testing with cURL

### Register a User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "rememberMe": false
  }' \
  -c cookies.txt
```

### Create a Playlist (with token from login)
```bash
curl -X POST http://localhost:8000/api/playlist/playlists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -b cookies.txt \
  -d '{
    "title": "My Favorite Anime",
    "description": "Collection of anime I love"
  }'
```

### Get All Playlists
```bash
curl -X GET http://localhost:8000/api/playlist/playlists \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -b cookies.txt
```

### Add Anime to Playlist
```bash
curl -X POST http://localhost:8000/api/playlist/playlists/<PLAYLIST_ID>/add-anime \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -b cookies.txt \
  -d '{
    "animeTitle": "Attack on Titan"
  }'
```

### Add to Watchlist
```bash
curl -X POST http://localhost:8000/api/watchlist/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -b cookies.txt \
  -d '{
    "animeId": "anime_id",
    "animeTitle": "Death Note"
  }'
```

### Get Watchlist
```bash
curl -X GET http://localhost:8000/api/watchlist/ \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -b cookies.txt
```

### Add to Favorites
```bash
curl -X POST http://localhost:8000/api/favourites/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -b cookies.txt \
  -d '{
    "animeId": "anime_id",
    "animeTitle": "Jujutsu Kaisen"
  }'
```

### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -b cookies.txt
```

---

## 🧪 Testing with Postman

### Setup:
1. Create a new Postman Collection
2. Set up environment variables:
   - `base_url`: http://localhost:8000/api
   - `access_token`: (will be set after login)

### Quick Testing Workflow:

1. **POST** Register → `{{base_url}}/auth/register`
2. **POST** Login → `{{base_url}}/auth/login` (save token to environment)
3. **POST** Create Playlist → `{{base_url}}/playlist/playlists`
4. **GET** Get Playlists → `{{base_url}}/playlist/playlists`
5. **POST** Add Anime → `{{base_url}}/playlist/playlists/[PLAYLIST_ID]/add-anime`
6. **POST** Logout → `{{base_url}}/auth/logout`

---

## Project Structure

```
Backend-neco/
├── controllers/
│   ├── auth.controller.js
│   ├── anime.controller.js
│   ├── watchlist.controller.js
│   ├── favourites.controller.js
│   └── createanimeplaylist.controller.js
├── models/
│   ├── user.model.js
│   ├── watchlist.model.js
│   ├── favourites.model.js
│   └── createanimeplaylist.model.js
├── routes/
│   ├── auth.routes.js
│   ├── anime.routes.js
│   ├── watchlist.routes.js
│   ├── favourites.routes.js
│   └── createanimeplaylist.routes.js
├── middlewares/
│   └── auth.middlewares.js
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── fileUtils.js
├── services/
│   └── kitsu.service.js
├── app.js
├── server.js
├── package.json
└── README.md
```

---

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message describing what went wrong",
  "success": false,
  "errors": []
}
```

### Common HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (user not authorized for this resource)
- **404**: Not Found
- **500**: Internal Server Error

---

## Notes

- All protected routes require a valid JWT access token
- Tokens are sent via `Authorization` header or cookies
- Use `rememberMe: true` in login to set longer cookie expiry (7 days)
- Default cookie expiry is 1 hour

---

## Support

For issues or questions, please refer to the controller implementations or check the error message returned by the API.
