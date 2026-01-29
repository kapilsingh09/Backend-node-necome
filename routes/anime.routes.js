<<<<<<< HEAD
import express from "express";
import {
  getAnimeDetails
} from "../controllers/anime.controller.js";
import { fetchAnimeFromJikan } from "../controllers/fetchanime.controller.js";

const router = express.Router();

/**
 * GET /api/anime/top
 * Fetch top rated anime from Kitsu + Jikan
 */
// router.get("/top", getTopRatedAnime);
router.get("/top", fetchAnimeFromJikan);
/**
 * GET /api/anime/search?q=naruto
 * Search anime by title (optional)
 */
// router.get("/search", searchAnime);

/**
 * GET /api/anime/:slug
 * Get anime details by slug / id
 */
router.get("/:slug", getAnimeDetails);
=======
import express from 'express';
import { 
  getAnimeDetails, 
  fetchJikanAnime, 
  fetchKitsuAnime, 
  clearCache, 
  getCacheStats 
} from '../controllers/anime.controller.js';

const router = express.Router();

// Existing route for anime details
router.get('/:slug', getAnimeDetails);
>>>>>>> 07036aa0236dd3ad9aa2145f73907bc7e5c0a103

// New proxy routes
router.get('/proxy/jikan', fetchJikanAnime);
router.get('/proxy/kitsu', fetchKitsuAnime);

// Cache management routes
router.delete('/cache', clearCache);
router.get('/cache/stats', getCacheStats);

export default router;

