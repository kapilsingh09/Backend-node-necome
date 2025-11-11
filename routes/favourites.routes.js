import express from "express";
import { verify_JWT } from "../middlewares/auth.middlewares.js";
import {
    getFavourites,
    addToFavourites,
    removeFromFavourites,
    checkFavouritesStatus
} from "../controllers/favourites.controller.js";

const router = express.Router();

// All routes require authentication
router.use(verify_JWT);

// Get user's favourites
router.get("/", getFavourites);

// Add anime to favourites
router.post("/add", addToFavourites);

// Remove anime from favourites
router.delete("/remove/:animeId", removeFromFavourites);

// Check if anime is in favourites
router.get("/check/:animeId", checkFavouritesStatus);

export default router;

