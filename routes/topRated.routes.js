import express from "express";
import { 
    getTopFiveRatedAnime, 
    getTopRatedAnime, 
    getTrendingAnime, 
    upcomingAnime,
    getSpring2024Popular,
    getTopRatedONA,
} from "../controllers/topRated.controller.js";

const router = express.Router();

/**
 * GET /api/top-rated/...
 */
router.get("/top-rated", getTopRatedAnime);
//for the five top rated anime component
router.get("/top-five-rated", getTopFiveRatedAnime);
//here the upcoming anime
router.get("/upcoming", upcomingAnime);
//here the trending anime
router.get("/trending-all-time", getTrendingAnime);
// Spring 2024 most popular (Kitsu)
router.get("/spring2024-popular", getSpring2024Popular);
// Top rated ONA (Jikan)
router.get("/top-rated-ona", getTopRatedONA);

export default router;
