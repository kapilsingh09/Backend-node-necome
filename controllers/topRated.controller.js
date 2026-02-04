import axios from "axios";
import NodeCache from "node-cache";
import { API_ENDPOINTS } from "../config/api.js";

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// KITSU – TOP RATED ANIME
export const getTopRatedAnime = async (req, res) => {
  try {
    const cacheKey = "kitsu_top_rated";

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "cache",
        count: cachedData.length,
        data: cachedData,
      });
    }

    const response = await axios.get(API_ENDPOINTS.kitsuTopRated);

    const normalizedData = response.data.data.map((anime) => ({
      id: anime.id,
      title:
        anime.attributes.titles.en ||
        anime.attributes.titles.en_jp ||
        anime.attributes.titles.ja_jp,
      title_jp:
        anime.attributes.titles.ja_jp ||
        anime.attributes.titles.en_jp ||
        null,
      synopsis: anime.attributes.synopsis,
      rating: anime.attributes.averageRating
        ? Number(anime.attributes.averageRating) / 10
        : null,
      status: anime.attributes.status,
      startDate: anime.attributes.startDate,
      endDate: anime.attributes.endDate,
      episodes: anime.attributes.episodeCount,
      ageRating: anime.attributes.ageRating,
      popularityRank: anime.attributes.popularityRank,
      favoritesCount: anime.attributes.favoritesCount,
      userCount: anime.attributes.userCount,
      coverImage: anime.attributes.coverImage?.large,
      posterImage: anime.attributes.posterImage?.medium,
    }));

    cache.set(cacheKey, normalizedData);

    res.status(200).json({
      success: true,
      source: "backend",
      count: normalizedData.length,
      data: normalizedData,
    });
  } catch (error) {
    console.error("Kitsu Top Rated Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch top rated anime",
    });
  }
};

// JIKAN – TOP 5 RATED ANIME

export const getTopFiveRatedAnime = async (req, res) => {
  try {
    const cacheKey = "jikan_top_five_rated";

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "cache",
        count: cachedData.length,
        data: cachedData,
      });
    }

    const response = await axios.get(API_ENDPOINTS.jikanTopRated);

    const normalizedData = response.data.data.map((anime) => ({
      id: anime.mal_id,
      title: anime.title,
      title_jp: anime.title_japanese || null,
      synopsis: anime.synopsis,
      rating: anime.score,
      rank: anime.rank,
      episodes: anime.episodes,
      status: anime.status,
      startDate: anime.aired?.from,
      endDate: anime.aired?.to,
      image: anime.images?.jpg?.image_url,
    }));

    cache.set(cacheKey, normalizedData);

    res.status(200).json({
      success: true,
      source: "backend",
      count: normalizedData.length,
      data: normalizedData,
    });
  } catch (error) {
    console.error("Jikan Top Five Rated Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch top five rated anime",
    });
  }
};


//upcoming anime coming soon wale
export const upcomingAnime = async (req, res) => {
  try {
    const cacheKey = "jikan_upcoming";

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("🔥 Upcoming from CACHE");
      return res.status(200).json({
        success: true,
        source: "cache",
        count: cachedData.length,
        data: cachedData,
      });
    }

    console.log("Upcoming from API");
    const response = await axios.get(API_ENDPOINTS.jikanUpcoming);

    const normalizedData = response.data.data.map((anime) => ({
      id: anime.mal_id,
      title: anime.title,
      title_jp: anime.title_japanese || null,
      synopsis: anime.synopsis,
      rating: anime.score,
      episodes: anime.episodes,
      status: anime.status,
      image: anime.images?.jpg?.image_url,
    }));

    cache.set(cacheKey, normalizedData);

    res.status(200).json({
      success: true,
      source: "backend",
      count: normalizedData.length,
      data: normalizedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming anime",
    });
  }
};
