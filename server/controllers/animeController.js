const axios = require("axios");
const CustomAnime = require("../models/CustomAnime");

const FALLBACK_IMAGE = "https://placehold.co/600x900/0f172a/e2e8f0?text=AnimeVerse";

const jikan = axios.create({
  baseURL: process.env.JIKAN_API_BASE_URL || "https://api.jikan.moe/v4",
  timeout: 15000,
});

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

const mapCustomAnime = (anime) => ({
  mal_id: anime.animeId,
  title: anime.title,
  title_english: anime.title_english,
  title_japanese: anime.title_japanese,
  synopsis: anime.synopsis,
  rating: anime.rating || 0,
  scored_by: anime.scored_by || 0,
  episodes: anime.episodes || 0,
  status: anime.status || "Unknown",
  type: anime.type || "Unknown",
  season: anime.season || "",
  year: anime.year || "",
  seasonYear: anime.seasonYear || "",
  genres: anime.genres || [],
  image: anime.image || FALLBACK_IMAGE,
  trailer: anime.trailer || "",
  trailerImage: anime.trailerImage || anime.image || FALLBACK_IMAGE,
  source: anime.source || "",
  duration: anime.duration || "",
  popularity: anime.popularity || 0,
  rank: anime.rank || 0,
  studios: anime.studios || [],
  themes: anime.themes || [],
  demographics: anime.demographics || [],
  characters: anime.characters || [],
  promoVideos: anime.promoVideos || [],
  isCustom: true,
  createdAt: anime.createdAt,
});

const parseNameList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name, index) => ({ mal_id: 900000 + index, name }));

const buildPromoVideos = (trailer, trailerImage) =>
  trailer
    ? [
        {
          title: "Admin Trailer",
          trailer: {
            embed_url: trailer,
            url: trailer,
          },
          images: {
            jpg: {
              image_url: trailerImage || "",
            },
          },
        },
      ]
    : [];

const getHomeData = async (req, res) => {
  const customAnime = await CustomAnime.find().sort({ createdAt: -1 }).limit(8);

  try {
    const [trendingRes, topRatedRes, latestRes, featuredRes] = await Promise.all([
      jikan.get("/top/anime", { params: { filter: "airing", limit: 10 } }),
      jikan.get("/top/anime", { params: { limit: 10 } }),
      jikan.get("/seasons/now"),
      jikan.get("/recommendations/anime"),
    ]);

    const featured = featuredRes.data.data
      .flatMap((item) => item.entry || [])
      .slice(0, 5)
      .map((anime) => ({
        mal_id: anime.mal_id,
        title: anime.title,
        image: getImage(anime.images),
        url: anime.url,
      }));

    return res.json({
      trending: [...customAnime.slice(0, 4).map(mapCustomAnime), ...trendingRes.data.data.slice(0, 10).map(mapAnimeCard)].slice(0, 10),
      topRated: [...customAnime.slice(4, 8).map(mapCustomAnime), ...topRatedRes.data.data.slice(0, 10).map(mapAnimeCard)].slice(0, 10),
      latest: [...latestRes.data.data.slice(0, 8).map(mapAnimeCard), ...customAnime.slice(0, 2).map(mapCustomAnime)].slice(0, 10),
      featured: [...customAnime.slice(0, 2).map((anime) => ({ mal_id: anime.animeId, title: anime.title, image: anime.image, url: "" })), ...featured].slice(0, 5),
    });
  } catch (error) {
    return res.json({
      trending: customAnime.slice(0, 4).map(mapCustomAnime),
      topRated: customAnime.slice(0, 4).map(mapCustomAnime),
      latest: customAnime.slice(0, 4).map(mapCustomAnime),
      featured: customAnime.slice(0, 5).map((anime) => ({ mal_id: anime.animeId, title: anime.title, image: anime.image, url: "" })),
    });
  }
};

const getAnimeList = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    q,
    genres,
    type,
    rating,
    order_by = "score",
    sort = "desc",
    status,
  } = req.query;

  const params = {
    page,
    limit,
    q,
    genres,
    type,
    rating,
    order_by,
    sort,
    status,
  };

  Object.keys(params).forEach((key) => {
    if (!params[key]) {
      delete params[key];
    }
  });

  const customAnime = await CustomAnime.find().sort({ createdAt: -1 });

  const searchText = String(q || "").toLowerCase();
  const filteredCustomAnime = customAnime.filter((anime) => {
    const queryMatches = !searchText || anime.title.toLowerCase().includes(searchText);
    const typeMatches = !type || anime.type === type;
    return queryMatches && typeMatches;
  });

  try {
    const response = await jikan.get("/anime", { params });

    return res.json({
      data: [...filteredCustomAnime.map(mapCustomAnime), ...response.data.data.map(mapAnimeCard)],
      pagination: response.data.pagination,
    });
  } catch (error) {
    return res.json({
      data: filteredCustomAnime.map(mapCustomAnime),
      pagination: {
        has_next_page: false,
        has_previous_page: false,
        current_page: 1,
        items: {
          count: filteredCustomAnime.length,
          total: filteredCustomAnime.length,
          per_page: filteredCustomAnime.length || 12,
        },
      },
    });
  }
};

const getAnimeSuggestions = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  const customAnime = await CustomAnime.find({ title: { $regex: q, $options: "i" } }).limit(6);

  try {
    const response = await jikan.get("/anime", {
      params: {
        q,
        limit: 6,
      },
    });

    return res.json(
      [...customAnime.map((anime) => ({ mal_id: anime.animeId, title: anime.title, image: anime.image })), ...response.data.data.map((anime) => ({
        mal_id: anime.mal_id,
        title: anime.title,
        image: getImage(anime.images),
      }))]
        .slice(0, 6),
    );
  } catch (error) {
    return res.json(customAnime.map((anime) => ({ mal_id: anime.animeId, title: anime.title, image: anime.image })));
  }
};

const getAnimeById = async (req, res) => {
  const { id } = req.params;
  const customAnime = await CustomAnime.findOne({ animeId: Number(id) });

  if (customAnime) {
    return res.json(mapCustomAnime(customAnime));
  }

  const [animeRes, charactersRes, videosRes] = await Promise.all([
    jikan.get(`/anime/${id}/full`),
    jikan.get(`/anime/${id}/characters`),
    jikan.get(`/anime/${id}/videos`),
  ]);

  const anime = animeRes.data.data;
  const promoVideos = videosRes.data.data?.promo?.slice(0, 6) || [];
  const firstPlayableVideo =
    promoVideos.find((video) => normalizeTrailerUrl(video.trailer))?.trailer || anime.trailer;

  res.json({
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
  });
};

const getAdminAnime = async (req, res) => {
  const customAnime = await CustomAnime.find().sort({ createdAt: -1 });
  res.json(customAnime.map(mapCustomAnime));
};

const createAdminAnime = async (req, res) => {
  const {
    title,
    synopsis,
    image,
    trailer,
    trailerImage,
    type,
    status,
    episodes,
    rating,
    season,
    year,
    source,
    duration,
    genres,
    themes,
    demographics,
    studios,
  } = req.body;

  if (!title || !image) {
    return res.status(400).json({ message: "Title and image are required" });
  }

  const latestAnime = await CustomAnime.findOne().sort({ animeId: -1 });
  const nextAnimeId = latestAnime?.animeId ? latestAnime.animeId + 1 : 900001;

  const createdAnime = await CustomAnime.create({
    animeId: nextAnimeId,
    title,
    title_english: title,
    synopsis,
    image,
    trailer,
    trailerImage: trailerImage || image,
    type: type || "TV",
    status: status || "Finished Airing",
    episodes: Number(episodes) || 0,
    rating: Number(rating) || 0,
    season: season || "",
    year: year ? Number(year) : null,
    seasonYear: season && year ? `${season} ${year}` : year ? String(year) : "",
    source: source || "",
    duration: duration || "",
    genres: parseNameList(genres),
    themes: parseNameList(themes),
    demographics: parseNameList(demographics),
    studios: parseNameList(studios),
    promoVideos: buildPromoVideos(trailer, trailerImage || image),
    createdBy: req.user._id,
  });

  return res.status(201).json(mapCustomAnime(createdAnime));
};

const deleteAdminAnime = async (req, res) => {
  const { id } = req.params;
  const anime = await CustomAnime.findOneAndDelete({ animeId: Number(id) });

  if (!anime) {
    return res.status(404).json({ message: "Custom anime not found" });
  }

  return res.json({ message: "Anime deleted" });
};

module.exports = {
  getHomeData,
  getAnimeList,
  getAnimeSuggestions,
  getAnimeById,
  getAdminAnime,
  createAdminAnime,
  deleteAdminAnime,
};
