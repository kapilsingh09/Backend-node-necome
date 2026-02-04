const baseJikanUrl = "https://api.jikan.moe/v4";

export const API_ENDPOINTS = {
  kitsuTopRated:
    "https://kitsu.io/api/edge/anime?sort=-updatedAt&page[limit]=12&fields[anime]=titles,synopsis,coverImage,posterImage,averageRating,status,startDate,endDate,episodeCount,ageRating,userCount,favoritesCount,popularityRank",
    
  jikanTopRated:
    `${baseJikanUrl}/top/anime?limit=5&sfw=true`,
  jikanUpcoming:
    `${baseJikanUrl}/seasons/upcoming?limit=5`,
};
