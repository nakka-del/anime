export const mapWatchlistPayload = (anime) => ({
  animeId: anime.mal_id,
  title: anime.title,
  image: anime.image,
  rating: anime.rating,
  type: anime.type,
  status: anime.status,
  episodes: anime.episodes,
});
