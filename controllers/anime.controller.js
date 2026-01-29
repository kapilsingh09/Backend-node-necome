import { fetchAllEpisodes, searchAnimeBySlug, fetchGenres } from '../services/kitsu.service.js';
import { checkVideoFile } from '../utils/fileUtils.js';
import axios from 'axios';
import NodeCache from 'node-cache';

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// Jikan API base URL
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Kitsu API base URL
const KITSU_BASE_URL = 'https://kitsu.io/api/edge';

export const getAnimeDetails = async (req, res) => {
  const { slug } = req.params;

  try {
    const anime = await searchAnimeBySlug(slug);
    if (!anime) return res.status(404).json({ error: 'Anime not found on Kitsu.' });

    const animeId = anime.id;
    const attributes = anime.attributes;

    const animeData = {
      id: animeId,
      slug: attributes.slug,
      title: attributes.titles?.en || attributes.canonicalTitle || 'Unknown Title',
      title_jp: attributes.titles?.ja_jp || attributes.titles?.en_jp || null,
      synopsis: attributes.synopsis,
      description: attributes.description || 'No anime description available.',
      subtype: attributes.subtype,
      status: attributes.status,
      startDate: attributes.startDate,
      endDate: attributes.endDate,
      episodeCount: attributes.episodeCount,
      episodeLength: attributes.episodeLength,
      showType: attributes.showType,
      averageRating: attributes.averageRating,
      ratingRank: attributes.ratingRank,
      popularityRank: attributes.popularityRank,
      userCount: attributes.userCount,
      favoritesCount: attributes.favoritesCount,
      posterImage: attributes.posterImage,
      coverImage: attributes.coverImage,
      youtubeVideoId: attributes.youtubeVideoId,
      genres: []
    };

    animeData.genres = await fetchGenres(anime.relationships?.genres?.links?.related);

    const episodesData = await fetchAllEpisodes(animeId);
    const episodes = episodesData.map((ep, index) => {
      const epAttr = ep.attributes;
      const epNum = epAttr.number || index + 1;
      const { exists, filename } = checkVideoFile(animeId, epNum);

      return {
        id: ep.id,
        episode: epNum,
        title: epAttr.canonicalTitle || `Episode ${epNum}`,
        description: epAttr.synopsis || 'No episode description available.',
        airdate: epAttr.airdate || null,
        duration: epAttr.length || null,
        videoUrl: exists ? `http://localhost:3000/videos/${filename}` : null,
        thumbnail: animeData.posterImage?.original || null,
        seasonNumber: epAttr.seasonNumber || null,
        relativeNumber: epAttr.relativeNumber || null,
      };
    });

    res.json({ ...animeData, episodes, totalEpisodes: episodes.length });

  } catch (error) {
    console.error('Kitsu API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch anime episodes from Kitsu.' });
  }
};

/**
 * Normalize Jikan API response to common format
 */
const normalizeJikanAnime = (anime) => {
  return {
    id: anime.mal_id?.toString() || '',
    title: anime.title_english || anime.title || 'Unknown',
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
    genres: anime.genres?.map(g => g.name) || [],
    rating: anime.score || 0,
    synopsis: anime.synopsis || '',
    status: anime.status || '',
    episodes: anime.episodes || 0,
    year: anime.year || anime.aired?.prop?.from?.year || null,
    score: anime.score || 0,
    // Keep original fields for compatibility
    mal_id: anime.mal_id,
    images: anime.images,
    title_english: anime.title_english,
    scored_by: anime.scored_by,
    aired: anime.aired,
    popularity: anime.popularity,
    type: anime.type,
    source: anime.source,
    studios: anime.studios,
    duration: anime.duration,
    rank: anime.rank
  };
};

/**
 * Normalize Kitsu API response to common format
 */
const normalizeKitsuAnime = (anime) => {
  const attr = anime.attributes || {};
  const rating = attr.averageRating ? parseFloat(attr.averageRating) / 10 : 0;
  
  return {
    id: anime.id?.toString() || '',
    title: attr.titles?.en_us || attr.titles?.en || attr.canonicalTitle || attr.titles?.en_jp || 'Unknown',
    image: attr.posterImage?.large || attr.posterImage?.medium || '',
    genres: [], // Kitsu doesn't include genres in basic response
    rating: parseFloat(rating.toFixed(1)),
    synopsis: attr.synopsis || attr.description || '',
    status: attr.status || '',
    episodes: attr.episodeCount || 0,
    year: attr.startDate ? new Date(attr.startDate).getFullYear() : null,
    score: parseFloat(rating.toFixed(1)),
    // Keep original fields for compatibility
    attributes: attr,
    ageRating: attr.ageRating,
    averageRating: attr.averageRating,
    posterImage: attr.posterImage,
    canonicalTitle: attr.canonicalTitle,
    titles: attr.titles
  };
};

/**
 * Fetch anime from Jikan API
 */
export const fetchJikanAnime = async (req, res) => {
  try {
    const { endpoint = 'top/anime', ...params } = req.query;
    
    // Create cache key from endpoint and params
    const cacheKey = `jikan_${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] Jikan: ${endpoint}`);
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
        source: 'jikan'
      });
    }

    console.log(`[CACHE MISS] Fetching from Jikan: ${endpoint}`);
    
    // Fetch from Jikan API
    const response = await axios.get(`${JIKAN_BASE_URL}/${endpoint}`, {
      params: {
        sfw: true,
        ...params
      }
    });

    // Normalize the data
    const normalizedData = Array.isArray(response.data.data)
      ? response.data.data.map(normalizeJikanAnime)
      : [normalizeJikanAnime(response.data.data)];

    // Store in cache
    cache.set(cacheKey, normalizedData);

    return res.status(200).json({
      success: true,
      data: normalizedData,
      cached: false,
      source: 'jikan'
    });

  } catch (error) {
    console.error('Jikan API Error:', error.message);
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests to Jikan API. Please try again later.',
        error: error.message
      });
    }

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch anime from Jikan API',
      error: error.message
    });
  }
};

/**
 * Fetch anime from Kitsu API
 */
export const fetchKitsuAnime = async (req, res) => {
  try {
    const { endpoint = 'anime', ...params } = req.query;
    
    // Create cache key from endpoint and params
    const cacheKey = `kitsu_${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] Kitsu: ${endpoint}`);
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
        source: 'kitsu'
      });
    }

    console.log(`[CACHE MISS] Fetching from Kitsu: ${endpoint}`);
    
    // Fetch from Kitsu API
    const response = await axios.get(`${KITSU_BASE_URL}/${endpoint}`, {
      params: params
    });

    // Normalize the data
    const normalizedData = Array.isArray(response.data.data)
      ? response.data.data.map(normalizeKitsuAnime)
      : [normalizeKitsuAnime(response.data.data)];

    // Store in cache
    cache.set(cacheKey, normalizedData);

    return res.status(200).json({
      success: true,
      data: normalizedData,
      cached: false,
      source: 'kitsu'
    });

  } catch (error) {
    console.error('Kitsu API Error:', error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to fetch anime from Kitsu API',
      error: error.message
    });
  }
};

/**
 * Clear cache (useful for development/testing)
 */
export const clearCache = (req, res) => {
  cache.flushAll();
  console.log('[CACHE] All cache cleared');
  
  return res.status(200).json({
    success: true,
    message: 'Cache cleared successfully'
  });
};

/**
 * Get cache stats
 */
export const getCacheStats = (req, res) => {
  const stats = cache.getStats();
  
  return res.status(200).json({
    success: true,
    stats: {
      keys: cache.keys().length,
      hits: stats.hits,
      misses: stats.misses,
      ksize: stats.ksize,
      vsize: stats.vsize
    }
  });
};

