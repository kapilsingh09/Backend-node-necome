import axios from "axios";
import NodeCache from "node-cache";
import { API_ENDPOINTS } from "../config/api.js";

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

export const getTopRatedAnime = async (req, res) => {
  try {
    const cacheKey = "kitsu_top_rated";

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "cache",
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
      source: "api",
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
