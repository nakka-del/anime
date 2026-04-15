import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";
import { fetchAnimeList } from "../api/animeApi";
import AnimeCard from "../components/AnimeCard";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import SectionHeader from "../components/SectionHeader";
import { useAuth } from "../context/AuthContext";
import { mapWatchlistPayload } from "../utils/watchlist";

const GENRE_OPTIONS = [
  { label: "Action", value: "1" },
  { label: "Adventure", value: "2" },
  { label: "Comedy", value: "4" },
  { label: "Drama", value: "8" },
  { label: "Fantasy", value: "10" },
  { label: "Sci-Fi", value: "24" },
];

const AnimeListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animeList, setAnimeList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const { isAuthenticated } = useAuth();

  const filters = useMemo(
    () => ({
      q: searchParams.get("q") || "",
      genres: searchParams.get("genres") || "",
      type: searchParams.get("type") || "",
      rating: searchParams.get("rating") || "",
      status: searchParams.get("status") || "",
      page: Number(searchParams.get("page") || 1),
    }),
    [searchParams],
  );

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchAnimeList(filters),
      isAuthenticated ? apiClient.get("/watchlist") : Promise.resolve({ data: [] }),
    ])
      .then(([animePayload, watchlistRes]) => {
        setAnimeList(animePayload.data);
        setPagination(animePayload.pagination);
        setWatchlistIds(watchlistRes.data.map((item) => item.animeId));
      })
      .catch(() => toast.error("Failed to load anime list"))
      .finally(() => setLoading(false));
  }, [filters, isAuthenticated]);

  const updateFilter = (name, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }

    if (name !== "page") {
      nextParams.set("page", "1");
    }

    setSearchParams(nextParams);
  };

  const toggleWatchlist = async (anime) => {
    if (!isAuthenticated) {
      toast.error("Login to manage your watchlist");
      return;
    }

    const exists = watchlistIds.includes(anime.mal_id);

    if (exists) {
      await apiClient.delete(`/watchlist/${anime.mal_id}`);
      setWatchlistIds((prev) => prev.filter((id) => id !== anime.mal_id));
      toast.success("Removed from watchlist");
      return;
    }

    await apiClient.post("/watchlist", mapWatchlistPayload(anime));
    setWatchlistIds((prev) => [...prev, anime.mal_id]);
    toast.success("Added to watchlist");
  };

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Explore"
        title="Anime catalog"
        description="Search by title, jump across genres, and filter the catalog with a responsive anime discovery flow."
      />

      <section className="glass mb-8 rounded-[32px] p-6">
        <div className="grid gap-4 lg:grid-cols-5">
          <label className="lg:col-span-2">
            <span className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Search size={14} />
              Search
            </span>
            <input
              value={filters.q}
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="Naruto, Bleach, One Piece..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            />
          </label>
          <label>
            <span className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Filter size={14} />
              Genre
            </span>
            <select
              value={filters.genres}
              onChange={(event) => updateFilter("genres", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">All genres</option>
              {GENRE_OPTIONS.map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 inline-flex text-xs uppercase tracking-[0.2em] text-slate-400">Type</span>
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">All types</option>
              <option value="TV">TV</option>
              <option value="Movie">Movie</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
            </select>
          </label>
          <label>
            <span className="mb-2 inline-flex text-xs uppercase tracking-[0.2em] text-slate-400">Rating</span>
            <select
              value={filters.rating}
              onChange={(event) => updateFilter("rating", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">All ratings</option>
              <option value="g">G</option>
              <option value="pg">PG</option>
              <option value="pg13">PG-13</option>
              <option value="r17">R - 17+</option>
              <option value="r">R+</option>
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <LoadingSkeleton count={12} />
      ) : animeList.length ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {animeList.map((anime) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                isSaved={watchlistIds.includes(anime.mal_id)}
                onToggleWatchlist={toggleWatchlist}
              />
            ))}
          </div>

          {pagination && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                disabled={!pagination.has_previous_page}
                onClick={() => updateFilter("page", String(filters.page - 1))}
                className="rounded-full border border-white/10 px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">Page {filters.page}</span>
              <button
                type="button"
                disabled={!pagination.has_next_page}
                onClick={() => updateFilter("page", String(filters.page + 1))}
                className="rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No anime matched that filter set"
          description="Try broadening your search or clearing a few filters to surface more titles."
        />
      )}
    </div>
  );
};

export default AnimeListPage;
