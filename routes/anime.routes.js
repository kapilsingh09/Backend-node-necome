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

export default router;
