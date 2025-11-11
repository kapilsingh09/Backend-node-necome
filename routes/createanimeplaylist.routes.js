import express from "express";
import { verify_JWT } from "../middlewares/auth.middlewares.js";
import {
  addAnimeToPlaylist,
  createAnimePlaylist,
  getAnimePlaylist,
  seeAllAnimeOnPlaylist,
} from "../controllers/createanimeplaylist.controller.js";

const router = express.Router();

// Apply JWT verification middleware to all routes
router.use(verify_JWT);

/**
 * POST /api/playlist/playlists
 * Create a new anime playlist
 */
router.post("/playlists", createAnimePlaylist);

/**
 * GET /api/playlist/playlists
 * Get all playlists for the authenticated user
 */
router.get("/playlists", getAnimePlaylist);

/**
 * GET /api/playlist/playlists/:id
 * Get a specific playlist and all its animes
 */
router.get("/playlists/:id", seeAllAnimeOnPlaylist);

/**
 * POST /api/playlist/playlists/:id/add-anime
 * Add an anime to a specific playlist
 */
router.post("/playlists/:id/add-anime", addAnimeToPlaylist);

export default router;
