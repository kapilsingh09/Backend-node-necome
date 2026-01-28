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

// New proxy routes
router.get('/proxy/jikan', fetchJikanAnime);
router.get('/proxy/kitsu', fetchKitsuAnime);

// Cache management routes
router.delete('/cache', clearCache);
router.get('/cache/stats', getCacheStats);

export default router;

