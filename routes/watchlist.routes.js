import express from "express";
import { verify_JWT } from "../middlewares/auth.middlewares.js";
import {
    getWatchlist,
    getSeenAnime,
    addToWatchlist,
    removeFromWatchlist,
    checkWatchlistStatus,
    toggleSeenStatus,
    createMyWatchlist
} from "../controllers/watchlist.controller.js";

const router = express.Router();

// All routes require authentication
router.use(verify_JWT);

// Get user's watchlist

router.get("/", getWatchlist);

// Get user's seen anime
router.get("/seen", getSeenAnime);

// Add anime to watchlist
router.post("/add", addToWatchlist);

// Remove anime from watchlist
router.delete("/remove/:animeId", removeFromWatchlist);

// Check if anime is in watchlist
router.get("/check/:animeId", checkWatchlistStatus);

// Toggle seen status
router.post("/seen/:animeId", toggleSeenStatus);
//here it will remove soon
router.get("/addtomywatchlist",createMyWatchlist)

export default router;

