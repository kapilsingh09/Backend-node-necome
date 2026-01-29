import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import rateLimit from 'express-rate-limit';
import animeRoutes from './routes/anime.routes.js'
import path from 'path'
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import availableDataRoutes from './routes/available.routes.js'
import watchlistRoutes from './routes/watchlist.routes.js';
import favouritesRoutes from './routes/favourites.routes.js';

import topRatedRoutes from './routes/topRated.routes.js';

import playlistRoutes from './routes/createanimeplaylist.routes.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  // origin: "http://localhost:5173",
  // credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

// Rate limiter for general API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use('/videos', express.static(path.join(__dirname, '..', 'videos')));
app.use('/videos', express.static('videos'));
     
// Apply strict rate limiter to auth routes (login/register)
app.use("/api/auth", authLimiter, authRoutes);

// Apply general rate limiter to other API routes
app.use("/api/available_data", apiLimiter, availableDataRoutes);
app.use("/api/anime", apiLimiter, animeRoutes);
app.use("/api/watchlist", apiLimiter, watchlistRoutes);
app.use("/api/favourites", apiLimiter, favouritesRoutes);
app.use("/api/playlist", apiLimiter, playlistRoutes);
app.use("/api/top-rated", apiLimiter, topRatedRoutes);
// app.use("/api/unified", unifiedAnimeRoutes);
// app.use("/api/my-watchlist", myWatchlistRoutes);


app.get('/', (req, res) => {
  res.send('Hello from Express app! The server will start from server.js');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});



app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle ApiError instances
  if (err instanceof Error && err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
      data: null,
      errors: err.errors || []
    });
  }
  
  // Handle other errors
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: null
  });
});

export default app;
