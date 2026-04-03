/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  controllers/animeProxy.controller.js
 *  
 *  Proxy controller: every function checks node-cache first,
 *  on miss fetches from Kitsu / Jikan, normalises response,
 *  stores in cache, and returns JSON.
 *
 *  ⚠️  Jikan rate-limit: 3 req/sec — the 10-min backend cache
 *      is the main protection layer. Do NOT lower the TTL.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import axios from "axios";
import NodeCache from "node-cache";
import { API_ENDPOINTS } from "../config/api.js";

const cache = new NodeCache({ stdTTL: 600 }); // 10 min — Jikan rate-limit shield

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

/** Standard success envelope */
const ok = (res, data, source = "api") => {
  const arr = Array.isArray(data) ? data : [data];
  return res.status(200).json({
    success: true,
    source,
    count: arr.length,
    data: arr,
  });
};

/** Standard error envelope */
const fail = (res, message, error) => {
  console.error(`❌ ${message}:`, error?.message || error);
  return res.status(500).json({ success: false, message });
};

/** Try cache, otherwise fetch → normalise → cache → return */
const cachedFetch = async (res, cacheKey, fetchFn) => {
  const cached = cache.get(cacheKey);
  if (cached) return ok(res, cached, "cache");

  const data = await fetchFn();
  cache.set(cacheKey, data);
  return ok(res, data, "api");
};

// ── Kitsu normaliser (mirrors topRated.controller.js pattern) ──
const normalizeKitsu = (anime) => ({
  id: anime.id,
  attributes: anime.attributes,  // keep raw for TopAnimeBox kitsu card
  title:
    anime.attributes?.titles?.en ||
    anime.attributes?.titles?.en_jp ||
    anime.attributes?.titles?.ja_jp ||
    anime.attributes?.canonicalTitle ||
    "Unknown",
  title_jp:
    anime.attributes?.titles?.ja_jp ||
    anime.attributes?.titles?.en_jp ||
    null,
  synopsis: anime.attributes?.synopsis,
  rating: anime.attributes?.averageRating
    ? Number(anime.attributes.averageRating) / 10
    : null,
  status: anime.attributes?.status,
  startDate: anime.attributes?.startDate,
  endDate: anime.attributes?.endDate,
  episodes: anime.attributes?.episodeCount,
  ageRating: anime.attributes?.ageRating,
  popularityRank: anime.attributes?.popularityRank,
  favoritesCount: anime.attributes?.favoritesCount,
  userCount: anime.attributes?.userCount,
  coverImage: anime.attributes?.coverImage?.large || anime.attributes?.coverImage?.original,
  posterImage: anime.attributes?.posterImage?.medium || anime.attributes?.posterImage?.large,
});

// ── Jikan normaliser (mirrors topRated.controller.js pattern) ──
const normalizeJikan = (anime) => ({
  mal_id: anime.mal_id,
  title: anime.title,
  title_english: anime.title_english || null,
  title_japanese: anime.title_japanese || null,
  synopsis: anime.synopsis,
  score: anime.score,
  rank: anime.rank,
  episodes: anime.episodes,
  type: anime.type,
  status: anime.status,
  images: anime.images,
  genres: anime.genres,
  startDate: anime.aired?.from,
  endDate: anime.aired?.to,
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  KITSU CONTROLLERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /api/anime/all?limit=12&offset=0 */
export const getAllAnime = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;
    const cacheKey = `kitsu_all_${limit}_${offset}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "page[limit]": limit, "page[offset]": offset, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch all anime", e); }
};

/** GET /api/anime/trending-kitsu?limit=12 */
export const getTrendingKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_trending_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuTrending, {
        params: { "page[limit]": limit },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch Kitsu trending", e); }
};

/** GET /api/anime/new-arrivals?limit=12 */
export const getNewArrivals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_new_arrivals_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[status]": "current", sort: "-startDate", "page[limit]": limit },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch new arrivals", e); }
};

/** GET /api/anime/seasonal-kitsu/:season/:year?limit=12
 *  NOTE: Kitsu supports filter[season] and filter[seasonYear] */
export const getSeasonalKitsu = async (req, res) => {
  try {
    const { season, year } = req.params;
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_seasonal_${season}_${year}_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: {
          "filter[season]": season,
          "filter[seasonYear]": year,
          "page[limit]": limit,
        },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch seasonal Kitsu anime", e); }
};

/** GET /api/anime/search-kitsu?q=naruto&limit=12 */
export const searchKitsu = async (req, res) => {
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_search_${query}_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[text]": query, "page[limit]": limit },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to search Kitsu anime", e); }
};

/** GET /api/anime/category/:slug?limit=12 */
export const getByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_category_${slug}_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[categories]": slug, "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch anime by category", e); }
};

/** GET /api/anime/romcom */
export const getRomcomKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_romcom_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[categories]": "romance,comedy", "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch romcom anime", e); }
};

/** GET /api/anime/romantic?limit=12 */
export const getRomanticKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_romantic_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[categories]": "romance,movie", "page[limit]": limit, sort: "popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch romantic anime", e); }
};

/** GET /api/anime/random */
export const getRandomKitsu = async (req, res) => {
  try {
    const randomOffset = Math.floor(Math.random() * 100);
    const cacheKey = `kitsu_random_${randomOffset}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { sort: "ratingRank", "page[limit]": 1, "page[offset]": randomOffset },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch random anime", e); }
};

/** GET /api/anime/romance-kitsu?limit=12 */
export const getRomanceKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_romance_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[categories]": "romance", "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch romance anime (Kitsu)", e); }
};

/** GET /api/anime/categories?limit=12 */
export const getCategoriesKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_categories_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuCategories, {
        params: { "page[limit]": limit },
      });
      return r.data.data; // categories don't need anime normalisation
    });
  } catch (e) { fail(res, "Failed to fetch categories", e); }
};

/** Helper: generic Kitsu genre fetcher */
const kitsuGenre = (genre) => async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_${genre}_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[categories]": genre, "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, `Failed to fetch ${genre} anime`, e); }
};

export const getActionKitsu         = kitsuGenre("action");
export const getRomanceComedyKitsu  = kitsuGenre("romance,comedy");
export const getComedyKitsu         = kitsuGenre("comedy");
export const getDramaKitsu          = kitsuGenre("drama");
export const getFantasyKitsu        = kitsuGenre("fantasy");
export const getHorrorKitsu         = kitsuGenre("horror");
export const getSportsKitsu         = kitsuGenre("sports");
export const getSliceOfLifeKitsu    = kitsuGenre("slice-of-life");

/** GET /api/anime/top-rated-kitsu?limit=12 */
export const getTopRatedKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_top_rated_proxy_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "page[limit]": limit, sort: "ratingRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch top rated Kitsu", e); }
};

/** GET /api/anime/currently-airing?limit=12 */
export const getCurrentlyAiring = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_airing_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[status]": "current", "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch currently airing", e); }
};

/** GET /api/anime/upcoming-kitsu?limit=12 */
export const getUpcomingKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_upcoming_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[status]": "upcoming", "page[limit]": limit, sort: "startDate" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch upcoming Kitsu anime", e); }
};

/** GET /api/anime/finished?limit=12 */
export const getFinishedKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_finished_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[status]": "finished", "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch finished anime", e); }
};

/** GET /api/anime/movies?limit=12 */
export const getMoviesKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_movies_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[subtype]": "movie", "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch anime movies", e); }
};

/** GET /api/anime/tv-series?limit=12 */
export const getTVSeriesKitsu = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const cacheKey = `kitsu_tv_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.kitsuAllAnime, {
        params: { "filter[subtype]": "TV", "page[limit]": limit, sort: "-popularityRank" },
      });
      return r.data.data.map(normalizeKitsu);
    });
  } catch (e) { fail(res, "Failed to fetch TV series", e); }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  JIKAN CONTROLLERS
//  ⚠️  Jikan rate limit: 3 req/sec
//  Cache protects us — 10 min TTL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** GET /api/anime/trending-romcom-jikan?limit=11 */
export const getTrendingRomcomJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_trending_romcom_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanAnimeSearch, {
        params: { genres: "22", status: "airing", order_by: "popularity", sort: "desc", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch trending romcom (Jikan)", e); }
};

/** GET /api/anime/romance-grid-jikan */
export const getRomanceGridJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const cacheKey = `jikan_romance_grid_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanAnimeSearch, {
        params: { genres: "22", order_by: "score", sort: "desc", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch romance grid (Jikan)", e); }
};

/** GET /api/anime/trending-jikan?limit=11 */
export const getTrendingJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_trending_bypop_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanTopAnime, {
        params: { filter: "bypopularity", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch trending Jikan", e); }
};

/** GET /api/anime/top-rated-jikan?limit=11 */
export const getTopRatedJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_top_rated_airing_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanTopAnime, {
        params: { filter: "airing", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch top rated Jikan", e); }
};

/** GET /api/anime/popular-jikan?limit=11 */
export const getPopularJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_popular_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanAnimeSearch, {
        params: { order_by: "popularity", sort: "desc", filter: "airing", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch popular anime (Jikan)", e); }
};

/** GET /api/anime/top-jikan?limit=11 */
export const getTopJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_top_overall_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanTopAnime, { params: { limit } });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch top anime (Jikan)", e); }
};

/** GET /api/anime/episodes/:id */
export const getEpisodesJikan = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `jikan_episodes_${id}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(`${API_ENDPOINTS.jikanAnimeEpisodes}/${id}/episodes`);
      return r.data.data; // episodes don't need the anime normaliser
    });
  } catch (e) { fail(res, "Failed to fetch anime episodes (Jikan)", e); }
};

/** GET /api/anime/seasonal-jikan/:year/:season?limit=11 */
export const getSeasonalJikan = async (req, res) => {
  try {
    const { year, season } = req.params;
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_seasonal_${year}_${season}_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(`${API_ENDPOINTS.jikanSeasons}/${year}/${season}`, {
        params: { limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch seasonal anime (Jikan)", e); }
};

/** GET /api/anime/current-season-jikan?limit=11 */
export const getCurrentSeasonJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_current_season_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanSeasonsNow, { params: { limit } });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch current season anime (Jikan)", e); }
};

/** GET /api/anime/upcoming-jikan?limit=11 */
export const getUpcomingJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_upcoming_top_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanTopAnime, {
        params: { filter: "upcoming", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch upcoming anime (Jikan)", e); }
};

/** GET /api/anime/romcom-jikan?limit=11 */
export const getRomcomJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_romcom_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanAnimeSearch, {
        params: { genres: "22,4", order_by: "popularity", sort: "desc", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch romcom anime (Jikan)", e); }
};

/** GET /api/anime/romance-jikan?limit=11 */
export const getRomanceJikan = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_romance_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanAnimeSearch, {
        params: { genres: "22", order_by: "score", sort: "desc", limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to fetch romance anime (Jikan)", e); }
};

/** GET /api/anime/search-jikan?q=naruto&limit=11 */
export const searchJikan = async (req, res) => {
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 11;
    const cacheKey = `jikan_search_${query}_${limit}`;
    await cachedFetch(res, cacheKey, async () => {
      const r = await axios.get(API_ENDPOINTS.jikanAnimeSearch, {
        params: { q: query, limit },
      });
      return r.data.data.map(normalizeJikan);
    });
  } catch (e) { fail(res, "Failed to search anime (Jikan)", e); }
};
