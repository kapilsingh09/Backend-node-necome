import axios from "axios";
import NodeCache from "node-cache";

const BASE_URL_KITSU = "https://kitsu.io/api/edge";
const BASE_URL_JIKAN = "https://api.jikan.moe/v4";

// Cache with 10 minutes TTL
const cache = new NodeCache({ stdTTL: 600 });

/**
 * Fetch top rated anime from Kitsu
 */
export async function fetchAnimeFromKitsu() {
  const cacheKey = "kitsu_top_rated";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${BASE_URL_KITSU}/anime`, {
    params: {
      "page[limit]": 10,
      "sort": "-averageRating"
    }
  });

  const anime = response.data.data.map(item => ({
    source: "kitsu",
    id: item.id,
    title: item.attributes.canonicalTitle,
    rating: item.attributes.averageRating,
    poster: item.attributes.posterImage?.small
  }));

  cache.set(cacheKey, anime);
  return anime;
}

/**
 * Fetch top rated anime from Jikan (MyAnimeList)
 */
export async function fetchAnimeFromJikan() {
  const cacheKey = "jikan_top_rated";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${BASE_URL_JIKAN}/top/anime`, {
    params: {
      limit: 10
    }
  });

  const anime = response.data.data.map(item => ({
    source: "jikan",
    id: item.mal_id,
    title: item.title,
    rating: item.score,
    poster: item.images?.jpg?.small_image_url
  }));

  cache.set(cacheKey, anime);
  return anime;
}

/**
 * Fetch from both APIs and merge results
 */
export async function fetchTopRatedAnime() {
  const [kitsu, jikan] = await Promise.all([
    fetchAnimeFromKitsu(),
    fetchAnimeFromJikan()
  ]);

  return [...kitsu, ...jikan];
}

export default fetchTopRatedAnime;
