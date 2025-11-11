import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import animeRoutes from './routes/anime.routes.js'
import path from 'path'
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import availableDataRoutes from './routes/available.routes.js'
import watchlistRoutes from './routes/watchlist.routes.js';
import favouritesRoutes from './routes/favourites.routes.js';
import playlistRoutes from './routes/createanimeplaylist.routes.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

app.use('/videos', express.static(path.join(__dirname, '..', 'videos')));
app.use('/videos', express.static('videos'));
     
app.use("/api/auth", authRoutes);
app.use("/api/available_data", availableDataRoutes);
app.use("/api/anime", animeRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/favourites", favouritesRoutes);

//create playlist of anime route
app.use("/api/playlist",playlistRoutes)
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
