import axios from "axios";
import apiClient from "./apiClient";
import { fallbackAnimeCatalog, fallbackHomeData, findFallbackAnimeById } from "../data/fallbackAnime";

const jikanClient = axios.create({
  baseURL: "https://api.jikan.moe/v4",
  timeout: 15000,
});

const FALLBACK_IMAGE = "https://placehold.co/600x900/0f172a/e2e8f0?text=AnimeVerse";

const getImage = (images) =>
  images?.webp?.large_image_url ||
  images?.webp?.image_url ||
  images?.jpg?.large_image_url ||
  images?.jpg?.image_url ||
  FALLBACK_IMAGE;

const normalizeTrailerUrl = (trailer = {}) => {
  if (trailer.embed_url) {
    return trailer.embed_url;
  }

  if (trailer.youtube_id) {
    return `https://www.youtube.com/embed/${trailer.youtube_id}`;
  }

  if (trailer.url?.includes("youtube.com/watch?v=")) {
    return trailer.url.replace("watch?v=", "embed/");
  }

  return "";
};

const mapAnimeCard = (anime) => ({
  mal_id: anime.mal_id,
  title: anime.title,
  title_english: anime.title_english,
  synopsis: anime.synopsis,
  rating: anime.score || 0,
  scored_by: anime.scored_by || 0,
  episodes: anime.episodes || 0,
  status: anime.status || "Unknown",
  type: anime.type || "Unknown",
  season: anime.season || "",
  year: anime.year || "",
  genres: anime.genres || [],
  image: getImage(anime.images),
  trailer: normalizeTrailerUrl(anime.trailer),
});

const withBackendFallback = async (backendRequest, fallbackRequest) => {
  try {
    return await backendRequest();
  } catch (error) {
    return fallbackRequest(error);
  }
};

const getFallbackListResult = (params = {}) => {
  const query = String(params?.q || "").toLowerCase();
  const type = params?.type || "";
  const filtered = fallbackAnimeCatalog.filter((anime) => {
    const titleMatches = !query || anime.title.toLowerCase().includes(query);
    const typeMatches = !type || anime.type === type;
    return titleMatches && typeMatches;
  });

  return {
    data: filtered,
    pagination: {
      has_next_page: false,
      has_previous_page: false,
      current_page: 1,
      items: { count: filtered.length, total: filtered.length, per_page: filtered.length || 12 },
    },
  };
};

export const fetchHomeData = () =>
  withBackendFallback(
    async () => {
      const response = await apiClient.get("/anime/home");
      const payload = response.data;

      if (!payload?.featured?.length && !payload?.trending?.length && !payload?.topRated?.length && !payload?.latest?.length) {
        return fallbackHomeData;
      }

      return payload;
    },
    async () => {
      try {
        const [trendingRes, topRatedRes, latestRes, featuredRes] = await Promise.all([
          jikanClient.get("/top/anime", { params: { filter: "airing", limit: 10 } }),
          jikanClient.get("/top/anime", { params: { limit: 10 } }),
          jikanClient.get("/seasons/now"),
          jikanClient.get("/recommendations/anime"),
        ]);

        return {
          trending: trendingRes.data.data.slice(0, 10).map(mapAnimeCard),
          topRated: topRatedRes.data.data.slice(0, 10).map(mapAnimeCard),
          latest: latestRes.data.data.slice(0, 10).map(mapAnimeCard),
          featured: featuredRes.data.data
            .flatMap((item) => item.entry || [])
            .slice(0, 5)
            .map((anime) => ({
              mal_id: anime.mal_id,
              title: anime.title,
              image: getImage(anime.images),
              url: anime.url,
            })),
        };
      } catch (error) {
        return fallbackHomeData;
      }
    },
  );

export const fetchAnimeList = (params) =>
  withBackendFallback(
    async () => {
      const response = await apiClient.get("/anime", { params });
      const payload = response.data;

      if (!payload?.data?.length) {
        return getFallbackListResult(params);
      }

      return payload;
    },
    async () => {
      try {
        const response = await jikanClient.get("/anime", { params: { ...params, limit: 12 } });
        return {
          data: response.data.data.map(mapAnimeCard),
          pagination: response.data.pagination,
        };
      } catch (error) {
        return getFallbackListResult(params);
      }
    },
  );

export const fetchAnimeSuggestions = (query) =>
  withBackendFallback(
    async () => {
      const response = await apiClient.get("/anime/search/suggestions", { params: { q: query } });
      return response.data;
    },
    async () => {
      try {
        const response = await jikanClient.get("/anime", { params: { q: query, limit: 6 } });
        return response.data.data.map((anime) => ({
          mal_id: anime.mal_id,
          title: anime.title,
          image: getImage(anime.images),
        }));
      } catch (error) {
        return fallbackAnimeCatalog
          .filter((anime) => anime.title.toLowerCase().includes(String(query).toLowerCase()))
          .slice(0, 6)
          .map((anime) => ({
            mal_id: anime.mal_id,
            title: anime.title,
            image: anime.image,
          }));
      }
    },
  );

export const fetchAnimeDetails = (id) =>
  withBackendFallback(
    async () => {
      const response = await apiClient.get(`/anime/${id}`);
      return response.data;
    },
    async () => {
      try {
        const [animeRes, charactersRes, videosRes] = await Promise.all([
          jikanClient.get(`/anime/${id}/full`),
          jikanClient.get(`/anime/${id}/characters`),
          jikanClient.get(`/anime/${id}/videos`),
        ]);

        const anime = animeRes.data.data;
        const promoVideos = videosRes.data.data?.promo?.slice(0, 6) || [];
        const firstPlayableVideo =
          promoVideos.find((video) => normalizeTrailerUrl(video.trailer))?.trailer || anime.trailer;

        return {
          ...mapAnimeCard({
            ...anime,
            trailer: firstPlayableVideo,
          }),
          background: anime.background,
          rank: anime.rank,
          popularity: anime.popularity,
          duration: anime.duration,
          source: anime.source,
          studios: anime.studios || [],
          themes: anime.themes || [],
          demographics: anime.demographics || [],
          title_japanese: anime.title_japanese,
          seasonYear: anime.season && anime.year ? `${anime.season} ${anime.year}` : "",
          trailerImage: anime.trailer?.images?.maximum_image_url || getImage(anime.images),
          characters: charactersRes.data.data.slice(0, 8),
          promoVideos,
        };
      } catch (error) {
        const fallbackAnime = findFallbackAnimeById(id);

        if (!fallbackAnime) {
          throw error;
        }

        return fallbackAnime;
      }
    },
  );

export const fetchAdminAnime = async () => {
  const response = await apiClient.get("/anime/admin");
  return response.data;
};

export const createAdminAnime = async (payload) => {
  const response = await apiClient.post("/anime/admin", payload);
  return response.data;
};

export const deleteAdminAnime = async (id) => {
  const response = await apiClient.delete(`/anime/admin/${id}`);
  return response.data;
};
