import express from "express";
import { getAnimeDetails } from "../controllers/anime.controller.js";
import {
  // ── Kitsu ──
  getAllAnime,
  getTrendingKitsu,
  getNewArrivals,
  getSeasonalKitsu,
  searchKitsu,
  getByCategory,
  getRomcomKitsu,
  getRomanticKitsu,
  getRandomKitsu,
  getRomanceKitsu,
  getCategoriesKitsu,
  getActionKitsu,
  getRomanceComedyKitsu,
  getComedyKitsu,
  getDramaKitsu,
  getFantasyKitsu,
  getHorrorKitsu,
  getSportsKitsu,
  getSliceOfLifeKitsu,
  getTopRatedKitsu,
  getCurrentlyAiring,
  getUpcomingKitsu,
  getFinishedKitsu,
  getMoviesKitsu,
  getTVSeriesKitsu,

  // ── Jikan ──
  getTrendingRomcomJikan,
  getRomanceGridJikan,
  getTrendingJikan,
  getTopRatedJikan,
  getPopularJikan,
  getTopJikan,
  getEpisodesJikan,
  getSeasonalJikan,
  getCurrentSeasonJikan,
  getUpcomingJikan,
  getRomcomJikan,
  getRomanceJikan,
  searchJikan,
} from "../controllers/animeProxy.controller.js";

const router = express.Router();

// ── Kitsu proxied routes ──
router.get("/all",                getAllAnime);
router.get("/trending-kitsu",     getTrendingKitsu);
router.get("/new-arrivals",       getNewArrivals);
router.get("/seasonal-kitsu/:season/:year", getSeasonalKitsu);
router.get("/search-kitsu",       searchKitsu);
router.get("/category/:slug",     getByCategory);
router.get("/romcom",             getRomcomKitsu);
router.get("/romantic",           getRomanticKitsu);
router.get("/random",             getRandomKitsu);
router.get("/romance-kitsu",      getRomanceKitsu);
router.get("/categories",         getCategoriesKitsu);
router.get("/action",             getActionKitsu);
router.get("/romance-comedy",     getRomanceComedyKitsu);
router.get("/comedy",             getComedyKitsu);
router.get("/drama",              getDramaKitsu);
router.get("/fantasy",            getFantasyKitsu);
router.get("/horror",             getHorrorKitsu);
router.get("/sports",             getSportsKitsu);
router.get("/slice-of-life",      getSliceOfLifeKitsu);
router.get("/top-rated-kitsu",    getTopRatedKitsu);
router.get("/currently-airing",   getCurrentlyAiring);
router.get("/upcoming-kitsu",     getUpcomingKitsu);
router.get("/finished",           getFinishedKitsu);
router.get("/movies",             getMoviesKitsu);
router.get("/tv-series",          getTVSeriesKitsu);

// ── Jikan proxied routes ──
router.get("/trending-romcom-jikan",    getTrendingRomcomJikan);
router.get("/romance-grid-jikan",       getRomanceGridJikan);
router.get("/trending-jikan",           getTrendingJikan);
router.get("/top-rated-jikan",          getTopRatedJikan);
router.get("/popular-jikan",            getPopularJikan);
router.get("/top-jikan",                getTopJikan);
router.get("/episodes/:id",             getEpisodesJikan);
router.get("/seasonal-jikan/:year/:season", getSeasonalJikan);
router.get("/current-season-jikan",     getCurrentSeasonJikan);
router.get("/upcoming-jikan",           getUpcomingJikan);
router.get("/romcom-jikan",             getRomcomJikan);
router.get("/romance-jikan",            getRomanceJikan);
router.get("/search-jikan",             searchJikan);

// ── Existing catch-all slug route (MUST be last) ──
router.get("/:slug", getAnimeDetails);

export default router;
