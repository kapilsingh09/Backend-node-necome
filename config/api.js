// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE: config/api.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const baseJikanUrl = "https://api.jikan.moe/v4";
const baseKitsuUrl = "https://kitsu.io/api/edge";

export const API_ENDPOINTS = {
  // ── EXISTING (do not touch) ──
  kitsuTopRated:
    `${baseKitsuUrl}/anime?sort=-updatedAt&page[limit]=12&fields[anime]=titles,synopsis,coverImage,posterImage,averageRating,status,startDate,endDate,episodeCount,ageRating,userCount,favoritesCount,popularityRank`,

  jikanTopRated:
    `${baseJikanUrl}/top/anime?limit=5&sfw=true`,
  jikanUpcoming:
    `${baseJikanUrl}/seasons/upcoming?limit=13`,

  trendingAnime:
    `${baseJikanUrl}/top/anime?filter=airing&limit=13`,

  // ── NEW KITSU ENDPOINTS ──
  kitsuAllAnime:           `${baseKitsuUrl}/anime`,           // + sort, page[limit], page[offset]
  kitsuTrending:           `${baseKitsuUrl}/trending/anime`,  // Kitsu dedicated trending
  kitsuCategories:         `${baseKitsuUrl}/categories`,      // + page[limit]

  // ── NEW JIKAN ENDPOINTS ──
  jikanTopAnime:           `${baseJikanUrl}/top/anime`,       // + filter, limit, type
  jikanAnimeSearch:        `${baseJikanUrl}/anime`,           // + q, limit, genres, order_by, sort, status, filter
  jikanAnimeEpisodes:      `${baseJikanUrl}/anime`,           // + /:id/episodes
  jikanSeasons:            `${baseJikanUrl}/seasons`,         // + /:year/:season  ?limit
  jikanSeasonsNow:         `${baseJikanUrl}/seasons/now`,     // + ?limit
  jikanSeasonsUpcoming:    `${baseJikanUrl}/seasons/upcoming`,// + ?limit
};

// Frontend will call YOUR backend instead of 3rd-party APIs
export const BACKEND_BASE = "/api";