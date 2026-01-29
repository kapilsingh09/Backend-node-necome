import express from "express";
import { getTopRatedAnime } from "../controllers/topRated.controller.js";

const router = express.Router();

/**
 * GET /api/anime/top-rated
 */
router.get("/top-rated", getTopRatedAnime);

export default router;
