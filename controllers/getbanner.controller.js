import axios from "axios";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 1800 }); // 30 min

export const getBannerAnime = async (req, res) => {
  try {
    const cacheKey = "banner_anime_list_v2";

    let animeList = cache.get(cacheKey);

    // 🎯 STEP 1: Fetch & cache (only once per 30 min)
    if (!animeList) {
      console.log("📡 Fetching RANDOM banner anime...");

      const genreIds = [
        1,  // Action
        2,  // Adventure
        4,  // Comedy
        8,  // Drama
        10, // Fantasy
        14, // Horror
        7,  // Mystery
        22, // Romance
        24, // Sci-Fi
        30, // Sports
        37, // Supernatural
        41  // Thriller
      ];

      const randomGenreId =
        genreIds[Math.floor(Math.random() * genreIds.length)];

      const randomPage = Math.floor(Math.random() * 5) + 1;

      const url = `https://api.jikan.moe/v4/anime?genres=${randomGenreId}&order_by=score&sort=desc&page=${randomPage}&limit=20`;

      const response = await axios.get(url);
      
      if (!response.data || !response.data.data || response.data.data.length === 0) {
          throw new Error("No anime returned from Jikan API");
      }

      animeList = response.data.data.map((anime) => ({
        id: anime.mal_id,

        // ✅ English first
        title:
          anime.title_english ||
          anime.title ||
          anime.title_japanese,

        synopsis: anime.synopsis?.slice(0, 180) + "...",
        rating: anime.score,
        episodes: anime.episodes,
        status: anime.status,
        image: anime.images?.jpg?.large_image_url,

        genre: anime.genres?.map(g => g.name) || [],
      }));

      cache.set(cacheKey, animeList);
    }

    // 🎯 STEP 2: RANDOM SELECTION
    const index = Math.floor(Math.random() * animeList.length);

    const selectedAnime = animeList[index];

    return res.status(200).json({
      success: true,
      index,
      data: selectedAnime,
    });

  } catch (error) {
    console.error("❌ Banner Anime Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banner anime",
    });
  }
};