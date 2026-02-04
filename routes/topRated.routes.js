import express from "express";
import { 
    getTopFiveRatedAnime, 
    getTopRatedAnime, 
    upcomingAnime 

} from "../controllers/topRated.controller.js";

const router = express.Router();

/**
 * GET /api/anime/top-rated
 */
router.get("/top-rated", getTopRatedAnime);
//for the five top rated anime compoenent
router.get("/top-five-rated",getTopFiveRatedAnime);
//here the upcoming anime
router.get("/upcoming",upcomingAnime)


export default router;
